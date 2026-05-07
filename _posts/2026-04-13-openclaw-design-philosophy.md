---
layout: post
title: 从 OpenClaw 源码看 Agent 系统设计的三个维度
date: 2026-04-13 15:00:00
description: what can we learn from OpenClaw's architecture design
tags: AI
categories: 技术
giscus_comments: true
pretty_table: true
toc:
  beginning: true
---

最近花了一些时间翻阅了 OpenClaw 的源码，记录一下我的思考。

我不太关心"养虾"本身有多好玩，更想搞清楚的是：它的 Agent 架构到底做了哪些值得学习的设计？

整体看下来，我觉得可以从三个维度去拆解：**Prompt Engineering**、**Context Engineering** 和 **Harness Engineering**。分别对应"如何说"、"让 AI 看什么"、"构建怎样的运行环境"。三者层层递进。

## Prompt Engineering：不只是写提示词

2023 年大家就在讨论怎么写好提示词了，但到了今天，Prompt Engineering 的内涵已经变了——不再是写一段固定的 System Prompt，而是一套动态的组装机制。

### 模块化的 System Prompt

OpenClaw 的 System Prompt 是在运行时拼装出来的。核心函数 `buildAgentSystemPrompt()` 接收几十个参数，按固定顺序把各个模块像积木一样拼在一起。

大概有 23 个模块，包括：身份标识、工具清单、安全准则、Skills 系统、记忆召回、工作区信息、沙箱配置、运行时信息等等。

它还区分了三种模式：

- **full**：主 Agent 与用户对话时，全量加载
- **minimal**：子 Agent 执行任务，只保留核心模块
- **none**：极简场景，基本只有一行身份标识

> ##### TIP
>
> 区分模式的原因很简单——上下文窗口是有限的，不同场景下没必要全部加载。这个思路在设计自己的 Agent 系统时也适用。
> {: .block-tip }

### Markdown 驱动的配置体系

OpenClaw 用一组 `.md` 文件来管理 Agent 的"灵魂"和"骨架"，运行时动态注入到 System Prompt。为什么用 Markdown？比纯文本多了格式能力（标题、加粗、斜体），同时又能用 Shell 工具方便地读写。

几个核心文件：

- `AGENT.md` — 总纲，定义 Agent 的行为规范
- `SOUL.md` — 人格特质、说话风格、价值观（修改时必须通知用户）
- `IDENTITY.md` — 外在标识：名字、类型、头像
- `USER.md` — 用户档案：称呼、偏好、习惯
- `TOOLS.md` — 可用工具清单
- `BOOTSTRAP.md` — 首次启动的引导脚本，用完即删
- `MEMORY.md` — 长期记忆

### 极简主义的措辞

OpenClaw 的 Prompt 措辞非常精炼。比如要求群聊里不要每条都回复，它用了一句 `Quality > quantity`；要求遇到不确定的事情就问用户，用了一句 `Ask anything you're uncertain about`。

这种风格值得学习。我们写提示词的时候容易越写越啰嗦，试图覆盖各种边界情况，结果 token 消耗巨大，重点反而模糊了。每一个 token 都是有成本的，在需要注入大量配置文件的情况下尤其如此。

## Context Engineering：在有限窗口里做更多事

Prompt Engineering 解决的是"做什么"，Context Engineering 解决的是"如何在有限的上下文窗口里做得更好"。

这部分可以从三个角度看：Skills 机制、上下文压缩/修剪、Memory 系统。

### Skills 的渐进式披露

OpenClaw 默认不具备所有能力。它通过一个类似 App Store 的市场（ClawHub）来扩展技能。关键在于：系统不会一次性把所有 Skill 的详细内容塞进上下文，而是先只加载名称和描述，判断需要用哪个，再去读对应的 `SKILL.md`。

这就是 Anthropic 提出的**渐进式披露（Progressive Disclosure）**——按需加载，避免上下文爆炸。

> ##### WARNING
>
> Skills 的开放也带来了安全风险。Skill 包里包含可执行脚本，恶意开发者可能植入后门。OpenClaw 近期在这方面加强了鉴权和管控。
> {: .block-warning }

### 上下文压缩（Compaction）

对话越来越长，Context Window 总会不够用。OpenClaw 的策略是：保留最近几轮对话的原文，把更早的历史压缩成摘要。

源码在 `src/agents/compaction.ts`，核心逻辑：

1. 把旧消息切分成多个 chunk（自适应分块，每块约占上下文的 40%）
2. 每个 chunk 独立生成 Summary
3. 合并所有 Summary 作为压缩后的历史

压缩时会特别保留：活跃任务、重要决策、TODO、UUID 等标识符（不能让模型自己瞎改）。

还有一些工程细节：5 分钟超时保护、压缩期间加写锁、可以配置用便宜的模型来做压缩。

### 修剪（Pruning）

工具调用的返回结果是占上下文的大户。一个大文件的读取结果可能瞬间消耗数万 token。

OpenClaw 的修剪策略是**头尾保留，中间省略**——因为报错信息通常在开头和结尾，JSON 的结构定义也在头部。裁剪比例控制在 50% 以内。

两者的区别：

| 特性 | 压缩（Compaction）          | 修剪（Pruning）    |
| ---- | --------------------------- | ------------------ |
| 做法 | 调用 LLM 生成摘要替换旧消息 | 规则裁剪，直接删减 |
| 信息 | 摘要保留关键信息            | 信息直接丢失       |
| 成本 | 需要额外的 LLM 调用         | 低成本             |
| 场景 | 对话历史太长                | 工具返回结果太大   |

### Memory 双层管理

大模型每次会话都是"失忆"的。想要跨会话记住东西，就得靠外部存储。

OpenClaw 的做法是双层记忆：

- **`MEMORY.md`（长期记忆）**：存储高价值信息，每次对话自动注入到 System Prompt（截断到 200 行）
- **`memory/日期.md`（每日笔记）**：细节化的日常记录，通过搜索访问

写入方面，除了用户主动说"记住这个"之外，会话结束时还会自动触发 Memory Flush，把关键信息归档。

读取方面，用 BM25 + 向量匹配双路召回。每日笔记还有时间衰减机制，半衰期 30 天——30 天前的记忆权重减半，90 天前只剩 1/8，模拟人类的"自然遗忘"。

| 特性     | MEMORY.md        | memory/日期.md |
| -------- | ---------------- | -------------- |
| 数量     | 只有一个         | 每天一个       |
| 写入     | 覆盖或编辑       | 追加           |
| 注入方式 | 每次对话自动注入 | 只通过搜索访问 |
| 衰减     | 不衰减           | 随时间衰减     |

## Harness Engineering：给野马套上缰绳

这是一个比较新的概念。Anthropic 和 OpenAI 分别在 2025 年底和 2026 年初提出了相关的论述。

简单说：Prompt Engineering 告诉模型"做什么"，Context Engineering 让模型"做得更好"，Harness Engineering 确保模型"可控地做"。

### 为什么需要 Harness

没有 Harness 的 Agent 容易出问题：

- 写完代码就认为完成了，不跑测试
- 遇到错误陷入死循环
- 执行高风险操作（删文件、调外部 API）时没有确认机制

Harness 就是在模型之外建立一套约束机制，让这些问题有工程化的解决方案。

### Harness vs Workflow

这两个概念容易混淆。我的理解是，核心区别在于**主导权**：

- **Workflow**：人预定义固定路径（A → B → C），模型只是其中一个节点。主导权在人。
- **Harness**：模型仍然有自主规划和迭代的权利，但在关键节点有约束和校验。主导权在模型，但有"缰绳"。

> ##### Note
>
> 在基座模型越来越强的趋势下，Harness 比 Workflow 更能发挥模型本身的能力，同时又不至于完全失控。
> {: .block-tip }

### OpenClaw 的 Harness 实践

**Hook 系统**：在 Agent 运行的关键节点插入自定义逻辑。

| 钩子              | 时机       | 用途           |
| ----------------- | ---------- | -------------- |
| before_tool_call  | 执行工具前 | 参数校验、拦截 |
| after_tool_call   | 工具执行后 | 结果处理       |
| before_compaction | 压缩前     | 标注或观察     |
| message_received  | 收到消息时 | 预处理         |

比如可以在 `before_tool_call` 里用正则校验参数格式，把错误拦截在执行之前。一次配置，所有工具调用都能生效。

**三层安全沙箱**：文件系统沙箱（限制访问范围）、命令执行沙箱（白名单 + 人工确认）、网络访问沙箱（白名单域名）。

**Human-in-the-Loop**：遇到不确定或高风险操作时暂停执行，等待人工确认。这是 Harness 赋予人类的最终控制权。

## 一些思考

看完 OpenClaw 的源码，我觉得真正有价值的不是它的产品形态，而是这些设计思路：

1. System Prompt 不要写成一坨，要模块化、按需加载
2. 上下文管理是 Agent 系统的核心工程挑战，压缩和修剪缺一不可
3. 记忆系统要分层，长期记忆和短期记忆的管理策略完全不同
4. 不能指望模型"自觉"，关键节点的约束必须是工程化的

这些东西不绑定 OpenClaw，在设计任何 Agent 系统的时候都适用。
