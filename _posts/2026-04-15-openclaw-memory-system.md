---
layout: post
title: OpenClaw 记忆系统源码拆解：从写入到晋升的全链路
date: 2026-04-15 15:00:00
description: how OpenClaw's memory pipeline works and where it falls short
tags: AI
categories: 技术
giscus_comments: true
pretty_table: true
toc:
  beginning: true
---

接着上一篇对 OpenClaw 整体架构的分析，这次单独拆一下它的记忆系统。

上次提到过 OpenClaw 用 `MEMORY.md` + `memory/日期.md` 做双层记忆管理，但没有深入到实现细节。这次从源码层面把写入、晋升、召回的全链路走一遍，顺便分析一下这套系统的不确定性问题。

## 记忆系统全景

OpenClaw 的设计原则是：一切持久状态都是磁盘上的 Markdown 文件。

完整的文件体系：

| 文件                 | 用途                          | 加载时机               |
| -------------------- | ----------------------------- | ---------------------- |
| AGENTS.md            | 工作区规则、安全边界          | 每次会话（最高优先级） |
| SOUL.md              | Agent 个性、沟通风格          | 每次会话               |
| USER.md              | 用户档案                      | 每次会话               |
| MEMORY.md            | 长期记忆（已验证事实、决策）  | 仅主会话               |
| memory/YYYY-MM-DD.md | 日记忆（当天观察、临时笔记）  | 当天 + 昨天自动加载    |
| DREAMS.md            | 梦境日记（Dreaming 系统输出） | 不自动注入             |

其中 `AGENTS.md`、`SOUL.md`、`USER.md` 定义的是身份和规则，每次会话启动时加载。而 `MEMORY.md` 和 `memory/YYYY-MM-DD.md` 是另一套机制——承载 Agent 在对话中积累的动态记忆，有专门的写入、演进和召回管线。

## 记忆写入：两条路径

### Agent 主动写入

最常用的路径。对话过程中，Agent 随时可以调用 `write` 工具写入记忆文件：

- 用户显式要求："记住我偏好 TypeScript"
- Agent 自主判断：认为某些信息值得保存，自行决定写入

关键点在于：**是否写入、写入什么、用什么格式，完全由 LLM 自主决定**。没有结构化的提取规则，没有强制的写入模板。

AGENTS.md 模板里对写入的指导是这样的：

```text
Write It Down - No "Mental Notes"!
- Memory is limited — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When someone says "remember this" → update memory/YYYY-MM-DD.md
```

可以看到，这些是方向性的建议（"capture what matters"），而非结构化的提取规则。

### Memory Flush 自动写入

Memory Flush 是上下文压缩（Compaction）前的安全网——确保激进裁剪之前，重要信息已被保存。

触发条件：

- Token 阈值：`softThresholdTokens`（默认 4000）— 距离 Compaction 的 token 距离
- 文件大小阈值：`forceFlushTranscriptBytes`（默认 2MB）

触发时，系统向 LLM 发送一段特殊指令：

```text
Pre-compaction memory flush turn.
The session is near auto-compaction; capture durable memories to disk.
Store durable memories only in memory/YYYY-MM-DD.md.
Treat MEMORY.md, DREAMS.md, SOUL.md, TOOLS.md, AGENTS.md as read-only during this flush.
If nothing to store, reply with NO_REPLY.
```

Flush 期间，`write` 工具被包装为仅追加模式（`appendOnly`），只允许写入当天的日记忆文件。

> ##### Note
>
> 两条路径都写入 `memory/YYYY-MM-DD.md`。主动写入是日常的主要方式，Memory Flush 是压缩前的"最后一次救济机会"。
> {: .block-tip }

## 日记忆到长期记忆的晋升

### 默认方式：Agent 自主整理

不启用 Dreaming 的情况下，晋升完全靠 Agent 自己判断：

1. 对话中直接写入 `MEMORY.md`（AGENTS.md 模板允许："You can read, edit, and update MEMORY.md freely in main sessions"）
2. 心跳（Heartbeat）期间定期回顾日记忆并更新

```text
Memory Maintenance (During Heartbeats)
Periodically (every few days), use a heartbeat to:
1. Read through recent memory/YYYY-MM-DD.md files
2. Identify significant events, lessons, or insights worth keeping long-term
3. Update MEMORY.md with distilled learnings
4. Remove outdated info from MEMORY.md that's no longer relevant
```

特点是灵活但不确定——是否执行、何时执行、整理质量如何，完全取决于 LLM。

### Dreaming 梦境系统：三阶段异步演进

这是 OpenClaw 比较有意思的设计。Dreaming 默认禁用（`DEFAULT_MEMORY_DREAMING_ENABLED = false`），启用后通过 Cron 定时任务运行（默认凌晨 3 点），将短期信号逐步转化为长期记忆。

三个阶段按顺序执行：Light → REM → Deep。

**浅睡眠（Light Sleep）— 摄取与去重**

从多个信号源搜集候选记忆片段：

- 日记忆文件：逐行提取（最小 8 字符，最大 280 字符，最多 4 行合并）
- 会话转录：按 Agent 和 Session 聚合（每次最多 240 条）
- 短期回忆存储：`memory/.dreams/short-term-recall.json`

去重使用 Jaccard 相似度（阈值 0.9）。这个阶段不调用 LLM，完全是确定性的文本处理。

**快速眼动睡眠（REM Sleep）— 反射与候选真理**

对候选信号做模式分析，识别反复出现的主题和高置信度的"候选真理"。

主题强度计算：

```text
strength = min(1, (count / totalEntries) × 2)
```

候选真理的置信度分数：

```text
confidence = avgScore × 0.45
           + recallStrength × 0.25
           + consolidation × 0.20
           + conceptual × 0.10

其中：
  recallStrength = min(1, log1p(recallCount) / log1p(6))
  consolidation  = min(1, recallDays.length / 3)
  conceptual     = min(1, conceptTags.length / 6)
```

去重阈值提高到 Jaccard 0.88，仅保留置信度 >= 0.45 的候选，最多 3 条。

**深度睡眠（Deep Sleep）— 六维评分与晋升**

这是决定一条记忆能否晋升为长期记忆的最终关口。六个加权信号：

| 信号       | 权重 | 计算方式                                      |
| ---------- | ---- | --------------------------------------------- |
| 频率       | 0.24 | min(1, ln(signalCount + 1) / ln(11))          |
| 相关性     | 0.30 | totalScore / max(1, signalCount)              |
| 多样性     | 0.15 | min(1, max(uniqueQueries, recallDays) / 5)    |
| 时效性     | 0.15 | exp(-λ × ageDays)，λ = ln(2)/14，半衰期 14 天 |
| 巩固度     | 0.10 | 基于多日重现或 grounded 信号强度              |
| 概念丰富度 | 0.06 | min(1, conceptTags.length / 6)                |

巩固度的计算取两个分支的最大值：

```text
// 分支 1：基于 recallDays 的时间跨度
spacing = min(1, ln(recallDays.length - 1) / ln(4))
span    = min(1, (maxDay - minDay) / 7天)
consolidation_a = 0.55 × spacing + 0.45 × span

// 分支 2：基于 grounded 信号计数
consolidation_b = min(1, groundedCount / 3)

consolidation = max(consolidation_a, consolidation_b)
```

Light Sleep 和 REM Sleep 的命中记录还会额外加分：

```text
phaseBoost = 0.06 × lightStrength × lightRecency
           + 0.09 × remStrength × remRecency
// 衰减半衰期同为 14 天
```

最终晋升门控，三个条件必须同时满足：

- `score >= 0.80`
- `totalSignalCount >= 3`（recallCount + dailyCount + groundedCount）
- `max(uniqueQueries, recallDays.length) >= 3`

通过门控的候选会被重新水合（从日文件中重新读取，确保不写入过时内容），然后追加到 `MEMORY.md`。

## 记忆召回与反馈环

持久化的记忆通过 `memory_search` 工具被召回：

- 搜索后端：支持 builtin（SQLite + FTS，可选 sqlite-vec 向量扩展）和 QMD 两种；无 embedding 时自动降级为 FTS 全文索引
- 信号记录：每次搜索返回结果后，后台异步调用 `recordShortTermRecalls`，把查询、路径、评分写入 `memory/.dreams/short-term-recall.json`
- 反馈环（仅 Dreaming 启用时）：召回信号被 Dreaming 消费，影响六维评分中的频率和相关性，形成"越被检索 → 越容易晋升"的正向循环

## 这套系统的不确定性问题

管线的设计理念是优秀的：异步演进、多阶段过滤、正向反馈。但从工程角度看，有几个不确定性环节值得注意。

**写入完全依赖 LLM 判断**

无论主动写入还是 Memory Flush，写什么、怎么写都由 LLM 单次推理决定。不同模型、不同上下文长度、甚至同一模型的不同推理轮次，写入内容可能完全不同。你告诉 Agent 自己的名字、城市和饮食偏好，它可能只记住了名字，漏掉其余两个。

**Memory Flush 的盲区**

Flush 只在上下文接近压缩阈值时触发。如果一次对话很短（没触发 Compaction），而 Agent 又没主动写入，对话中的信息就不会被持久化。它只能保证"长对话压缩前不丢"，不能保证"短对话也记住"。

**晋升的不确定性**

默认路径下，晋升完全靠 Agent 自主判断，可能长期不回顾。Dreaming 路径虽然有量化的评分机制，但也有三个问题：

1. **Cron 周期延迟**：晋升门控要求信号计数 >= 3 且跨日数 >= 3，一条记忆通常需要多次跨日积累。"我下周二飞杭州"这样的时效性信息，等信号积累完，飞机可能已经起飞了。
2. **Jaccard 去重无法捕捉语义**："用户喜欢苹果"和"用户爱吃苹果"在语义上是同一件事，但 Jaccard 基于词汇重叠，可能判定它们不相似，导致同一事实存在多个版本。
3. **统计评分而非语义重要性**：Deep Sleep 评分完全基于统计信号（检索次数、出现天数），没有 LLM 参与语义判断。"我对花生过敏"只被提及一次但极其重要，在评分中可能远低于一条反复出现但不重要的信息。

不确定性的完整链路：

```text
对话内容
  ↓ ❶ LLM 自主判断是否写入（可能遗漏）
  ↓ ❷ 短对话无 Flush 安全网（可能不触发）
日记忆文件
  ↓ ❸ 晋升不确定
  │   ├─ 默认路径：Agent 自主判断，可能不执行
  │   └─ Dreaming 路径（默认禁用）：
  │        Jaccard 机械去重（无语义理解）
  │        六维统计评分（无语义判断）
MEMORY.md
  ↓ ❹ 召回受限（无 embedding 时降级为词法匹配）
对话上下文
```

> ##### Note
>
> 这些不确定性不算设计缺陷——通用框架要在提取精度和系统复杂度之间做权衡。但对于需要精确记住用户事实的场景，从写入到晋升到召回的不确定性叠加起来，确实会影响体验。
> {: .block-tip }

## 可以优化的方向

分析完这套系统的不确定性，自然会想到一些改进思路：

**写入环节**：不依赖 Agent 自主判断，改为每轮对话结束时自动触发结构化提取。用 LLM 做结构化输出，强制提取用户偏好、事实、计划等。

**晋升环节**：不等 Cron 调度，在提取的同时做实时整合。对每条新事实，向量检索已有记忆，用 LLM 判定是 INSERT（新事实）、UPDATE（更丰富）、SKIP（已存在）还是 DELETE（矛盾过时）。

**去重环节**：用向量相似度 + LLM 语义判断替代 Jaccard 字面匹配。

**召回环节**：混合召回（向量 + BM25），不依赖单一搜索后端。

**衰减策略**：区分对待。个人事实（偏好、过敏等）应该是 Evergreen 的，不衰减；时效性事件按策略淘汰。

这些方向的核心思路是：把关键决策从"LLM 自由发挥"变成"LLM 在结构化约束下做语义判断"，在灵活性和确定性之间找到更好的平衡点。
