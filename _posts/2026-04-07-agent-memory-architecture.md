---
layout: post
title: Agent Memory 架构思考：从本质命题到系统设计
date: 2026-04-07 15:00:00
description: rethinking memory architecture for AI agents
tags: AI Agent
categories: 技术
giscus_comments: true
pretty_table: true
toc:
  beginning: true
---

最近读到一篇关于 Agent Memory 架构的长文，信息密度非常高，引用了大量 2026 年初的新论文。读完之后整理一下我觉得最有价值的部分。

这篇文章讨论的 Memory 不是指对话历史的简单存储，而是：Agent 在长期交互中积累的、可被检索与利用的记录/知识/经验库。它直接影响个性化、持续学习和长程任务表现。

## Memory 的本质：三个核心命题

文章提出了三个命题，我觉得推导过程比结论本身更有价值。

**命题 A：Memory 不是"存储"，而是可被决策利用的外部状态**

把 Agent 看成一个函数，"存了很多历史"本身不构成能力。能力来自：历史能否以某种形式影响当前的决策分布。

Memory 的价值不在于"存了多少"，而在于从历史到当前决策的通道是否有效。

**命题 B：Memory 的最小闭包是 (Ledger, Views, Policy) 三件套**

只要系统需要满足可溯源、可回滚、可观测，Memory 的最小形态就不可能是"一个向量库 + 若干 prompt"。它必须是：

1. **Raw Ledger（权威记录）**：append-only 的事件日志，记录每次写入/更新/删除
2. **Derived Views（派生视图）**：面向检索的派生状态（向量索引、KG、timeline、skill index 等），可以 lossy，但必须可回指 Ledger
3. **Policy（控制层）**：决定何时读、何时写、如何更新、如何遗忘，决策必须显式化为可记录的 Action 序列

> ##### Note
>
> 类比一下：Raw Ledger 像"账本/黑匣子"；Views 像"缓存 + 索引 + 物化视图"；Policy 像"调度器/控制回路"。三者缺一，系统要么不可治理，要么不可用，要么不可迭代。
> {: .block-tip }

**命题 C：Memory 的基本单位是 event 序列，但直接用 event 流不等于可用系统**

event 是"真相来源"，但太底层。真正把历史变成能力的是 Views（对 event 的重组织/压缩/索引）和 Policy（决定什么时候触发哪些 view）。

event 是 Ledger 的数据形态；Views / Policy 是能力形态。

## System 1 + System 2 的分工

一个关键判断：**记忆能力和 LLM 本身的 Agent 能力是「相对」正交的**。

这意味着我们可以把系统拆成两块低耦合的模块：

- **System 1**：通用 LLM/Agent（推理、规划、工具调用）
- **System 2**：记忆系统（写入、索引、检索、过滤、摘要、时序化）

为什么要外置化？如果记忆能力只能通过 RL post-training 固化到 LLM 权重里，很难保证特化训练后仍保持通用泛化能力。外置的 System 2 可以做到可插拔、可迁移、更易归因。

从经验现象看：同一个 base model 接入不同的记忆策略就能显著改变长程任务表现；同一套记忆 infra 也能服务不同的 base model。这种"跨模型可复用"说明能力更多绑定在接口与外部状态上。

System 2 的架构大致是这样的：

```text
User/Env IO → System 1 (LLM + tools + planner) → Output
                        ↑↓
              System 2: Agentic Memory (Slow Loop)
              PreThink → Retrieve (loop) → Evidence Accumulate → Early Stop
                              ↕
                        Memory Infra
                        - Raw Ledger
                        - Derived Views (Vector/BM25/KG/Timeline)
                        ← control feedback loop →
```

## 非参数化 Memory 的上限

参数化记忆把经验写进模型权重，非参数化把经验写在外部状态里。两者的差别不在"有没有存储"，而在**适应算子写在哪里**。

非参数化方案想逼近参数化效果，核心不是把更多东西塞进库，而是让修正项 Δ 逼近"如果真的 fine-tune 了会发生什么"。

上限由三类瓶颈共同决定：

**(1) 接口带宽**

不管是 passage、graph 还是 skill，最终都要通过某种 Context Bridge 让 System 1 用上它。token 预算、注意力容量都是硬约束。外部记忆再大也没用，真正起作用的是每一步能注入多少"有效信息"。

**(2) 检索与聚合误差**

Views 是近似结构，近似就会带来错检、漏检、时序冲突、语义漂移。上限不仅取决于"存了多少"，更取决于误差是否被治理住。

**(3) Policy 的可学习性与可控性**

这是最容易被低估的瓶颈：

- 写多了污染，写少了学不到
- 召回多了噪声，召回少了信息不够
- UPDATE/DELETE 做错一次，长期滚雪球

> ##### WARNING
>
> 基于预定义规则（rubrics）的 policy 不可持续。必须把控制回路显式化为可训练对象，让它既能学习（RL 训练范式），又能治理（候选集合约束 + provenance 闭包 + sandbox A/B）。
> {: .block-warning }

## 记忆单元的结构、时序和压缩

### 记忆固化

SimpleMem 不存储原始文本，而是存储压缩后的"记忆单元"。通过亲和力评分将高相似的记忆单元递归合并为更高层级的抽象表征——很像参数化模型训练中的层级抽象。

### 时序记忆

这部分我觉得是全文最有洞察力的地方。

LLM 对时间天然不敏感。纯语义检索会把"过去的高相似事实"错当成"现在仍为真"。解决方案不是更强的 prompt，而是把时序提升为架构的结构维度。

核心概念是**双时态（bi-temporal）**：

- **valid_time**：事实在世界中何时为真
- **transaction_time**：系统何时写入/更正

两者不等价——你可以在今天纠正上周发生的事实。

遗忘也不应该只是一条全局衰减曲线，而应区分三层抑制机制：

1. **validity gating**：不在有效窗口内的事实，直接不进候选集（硬门控）
2. **tombstone**：显式撤回某条记忆的可见性（可审计抑制）
3. **decay**：在有效集合里做偏好排序（软信号）

三者的关系是：先 validity，再 tombstone，再 decay。否则会出现"decay 把无效事实拉回来"的语义错误。

还有一个重要推演：**记忆固化不能跨越变更点**。如果只按语义相似合并，会把不同时期的不同真值"平均化"。固化的第一原则不是更抽象，而是不跨越变更点。

## 程序性记忆：从"知识"到"技能"

传统 RAG 擅长检索"信息片段"，但很难直接复用"推理过程/操作流程"。

ProcMEM 的思路是把成功的交互轨迹抽象为可执行的 skill，用 Skill-MDP 形式化。一个 skill 是三元结构（触发条件、执行序列、终止条件）。

关键设计：

- **生成**：用语义梯度（Semantic Gradient）对技能做事后归因，生成候选技能
- **验证**：用 PPO 风格的信任域门控做反事实验证，过滤掉激进且不可靠的候选
- **维护**：基于在线评分做进化压力，得分长期为非正的技能被淘汰

经验记忆的三个特点：可执行性、可复用性、非参数化优化（不更新 LLM 权重仍能持续改进）。

## Memory 整合层：潜层融合

一个工程上绕不过去的问题：外部记忆通常是文本/结构化数据，LLM 的核心计算对象是 token 与注意力。常见实现要经历 外部内容 → 文本化 → 拼 prompt → 模型再编码 的链路，存在编解码开销和信息损失。

2026 年的一些工作开始探索 Machine-Native 的记忆形态：

- **LycheeMemory**：训练 compressor 把输入压缩成潜层 token，直接注入注意力计算，绕开文本中间层
- **MemAdapter**：异构记忆的对齐器，把图谱等结构化信息零样本映射到 LLM 的语义空间

但这里有个盲点：潜层 token 越 machine-native，可读性越弱，越依赖可观测性与溯源机制兜底。

## 架构总结

文章最后给出了一个类 Linux 风格的五件套抽象：

- **内核（Kernel）**：System 2 的慢回路与调度器，决定何时检索/写入/更新/遗忘
- **文件系统（Storage）**：Raw Ledger + 派生视图，承载时序一致性与分层固化
- **可执行文件（Skill）**：把经验固化为可执行、可复用的程序性单元
- **总线接口（Context Bridge）**：记忆与推理之间的接口层，低开销低失真地注入
- **学习引擎（Online Adaptation）**：持续把交互反馈转化为改进信号

## 我的一些想法

读完这篇文章，几个对我触动比较大的点：

1. **Memory 不是一个组件，而是一个闭环系统**。之前在分析 OpenClaw 的记忆系统时，就发现它的问题恰好落在这三件套的各个环节上——写入靠 LLM 自由发挥（Policy 缺失）、Jaccard 去重没有语义理解（Views 误差）、晋升靠统计信号而非语义重要性（Policy 不可学习）。
2. **时序是架构的结构维度，不是 metadata**。OpenClaw 用简单的时间衰减半衰期来处理"遗忘"，但这篇文章说得对：decay 只是最后一层软信号，前面还需要 validity gating 和 tombstone 这两层硬约束。否则就会出现"decay 把无效事实拉回来"的问题。
3. **程序性记忆是一个被低估的方向**。我们大部分时候在讨论的都是 Declarative Memory（事实/证据），但在真实任务中，一段可复用的解决路径（怎么做）往往比一条事实（是什么）价值更高。
4. **Policy 是最大的瓶颈**。存储后端不是问题，检索算法也有成熟方案，真正难的是"什么时候写、写什么、信谁"这些控制决策。这也是为什么基于规则的 policy 不可持续——必须让它变成一个可训练的对象。

---

**相关论文：**

- JitRL：推理阶段利用外部经验库调制 logits
- UMEM：通过语义邻域构建实现记忆的迁移能力
- AgeMem：将记忆操作工具化并用 RL 训练使用策略
- InfMem：PreThink-Retrieve-Write 协议，自适应早停
- SimpleMem：递归固化，模拟生物记忆 Consolidation
- Zep/Graphiti：时序知识图谱（TKG），bi-temporal 设计
- MAGMA：四正交图架构（语义/时间/因果/实体）
- ProcMEM：Skill-MDP，将交互轨迹固化为可执行技能
- LycheeMemory：潜层压缩与 KV-Cache 注入
- MemAdapter：异构记忆的零样本对齐
- MemWeaver：三层混合存储（Graph/Experience/Passage）
