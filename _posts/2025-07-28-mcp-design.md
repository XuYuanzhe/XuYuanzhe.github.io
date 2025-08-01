---
layout: post
title: MCP 架构设计模式
date: 2025-07-28 15:00:00
tags: AI MCP
categories: 技术
giscus_comments: true
pretty_table: true
---

MCP 是 AI 应用与能力（tools、prompts、resources）之间的通用连接器，类似于 USB-C 为电子设备之间的连接提供了标准化接口。

<img src="/assets/img/posts/640.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

九种结构模式：

- 完全本地的 MCP Client 架构设计模式一适合需要完全在本地运行的应用；
- MCP 驱动的 Agentic RAG 架构设计模式二适合需要搜索和分析大量数据的场景；
- MCP 驱动的多智能体架构设计模式三适合金融数据分析和趋势预测；
- MCP 驱动的语音智能体设计模式四适合需要语音交互的应用；
- 统一的 MCP Server 架构设计模式五适合需要整合多个数据源的应用；
- MCP 驱动的共享内存架构设计模式六适合需要跨应用共享数据的场景；
- MCP 驱动的复杂文档 RAG 架构设计模式七适合处理复杂格式文档的应用。
- MCP 驱动的数据合成生成器架构设计模式八适合需要生成合成数据集进行测试或训练。
- MCP 驱动的 Deep Researcher 多智能体架构设计模式九适合需要深度研究和分析的应用。

业务选型

- 数据密集型业务：选择 Agentic RAG 或多智能体模式。
- 用户交互型业务：选择语音或共享内存模式。
- 文档处理型业务：选择复杂文档处理模式。
- 数据生成需求：选择合成数据生成器模式。
- 研究分析需求：选择深度研究员模式。

## 1. 完全本地的 MCP Client

MCP Client 是 AI 应用（比如：Cursor）中的一个组件，它负责与外部工具建立连接。流程如下：

<img src="/assets/img/posts/641.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户提交一个查询。
- AI 智能体连接到 MCP Server 以发现工具。
- 根据查询，AI 智能体调用合适的工具并获得上下文。
- AI 智能体返回一个有上下文感知的响应。
- LlamaIndex 用于构建 MCP 驱动的 AI 智能体。
- Ollama 用于本地提供 Deepseek-R1 服务。
- LightningAI 用于开发和托管。

## 2. MCP 驱动的 Agentic RAG

由 MCP 驱动的 Agentic RAG，它可以搜索向量数据库，并在需要时回退到网络搜索。流程如下：

<img src="/assets/img/posts/642.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户通过 MCP Client（比如：Cursor IDE）输入查询。
- 2-3) MCP Client 连接 MCP Server 选择一个相关工具。
- 4-6) 工具的输出返回给用户以生成响应。
- Cursor 作为 MCP Client。
- Qdrant 作为向量数据库。
- Bright Data 来大规模抓取网页数据。

## 3. MCP 驱动的多智能体

构建一个由 MCP 驱动的 AI 智能体，比如：在金融业务分析场景，它可以直接从 Cursor 或 Claude 桌面获取、分析并生成股市趋势的洞见。流程如下：

<img src="/assets/img/posts/643.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户提交查询请求。
- MCP 智能体启动金融分析师团队。
- 团队进行研究并创建可执行脚本。
- 智能体运行脚本以生成分析图表。
- 使用 CrewAI 进行多智能体编排。
- 使用 Ollama 本地部署 DeepSeek-R1 LLM。
- 使用 Cursor 作为 MCP Host。

## 4. MCP 驱动的语音智能体

MCP 驱动的语音智能体，它能够查询数据库，并在需要时回退到网络搜索。流程如下：

<img src="/assets/img/posts/644.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户的语音查询通过 AssemblyAI 转录成文本。
- 智能体发现数据库和网络工具。
- 大语言模型调用正确的工具，获取数据并生成响应。
- 应用程序通过文本转语音的方式传递响应。
- AssemblyAI 用于语音转文本。
- Firecrawl 用于网络搜索。
- Supabase 作为数据库。
- Livekit 用于协调。
- Qwen3 作为大语言模型（LLM）。

## 5. 统一的 MCP Server

通过一个由 MindDB（MCP Server） 和 Cursor IDE（MCP Client） 提供支持的统一界面，使用自然语言查询和聊天，可以访问 200 多个以上的数据源。流程如下：

<img src="/assets/img/posts/645.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户提交查询。
- 智能体连接到 MindDB 的 MCP Server 以找到工具。
- 智能体基于用户查询选择一个合适的工具并调用它。
- 最后，它返回一个与上下文相关联的响应。
- MindDB 来为我们的统一 MCP Server 提供动力（在 GitHub 上有 31k Stars）。
- Cursor 作为 MCP Host。
- Docker 用于自行托管 MCP Server。

## 6. MCP 驱动的共享内存

开发者们分别独立使用 Claude 桌面和 Cursor，而没有共享上下文。如何添加一个通用的内存层，以便在不丢失上下文的情况下进行跨操作。

<img src="/assets/img/posts/646.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户向 Cursor 和 Claude 提交查询。
- 事实/信息使用 Graphiti MCP 存储在通用内存层中。
- 如果任何交互需要上下文，就会查询内存。
- Graphiti 在多个主机（Hosts）之间共享内存。
- Graphiti MCP 作为 AI 智能体的内存层（ GitHub 代码库拥有 10k Stars）。
- Cursor 和 Claude 桌面作为 MCP Hosts。

## 7. MCP 驱动的复杂文档 RAG

使用 MCP 为处理包含表格、图表、图片、复杂布局等复杂文档的 RAG 应用提供动力。流程如下：

<img src="/assets/img/posts/647.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户与 MCP Client（Cursor IDE）进行互动。
- MCP Client 连接到 MCP Server 并选择一个工具。
- 工具利用 GroundX 对文档进行高级搜索。
- 搜索结果被 MCP Client 用来生成响应。
- Cursor IDE 作为 MCP Client。
- EyelevelAI 的 GroundX 来构建一个能够处理复杂文档的 MCP Server。

## 8. MCP 驱动的数据合成生成器

MCP Server 能够生成任何类型的合成数据集。它使用 Cursor 作为 MCP 的 Host ，并利用 SDV 来生成逼真的表格形式的合成数据。

<img src="/assets/img/posts/648.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户提交查询。
- AI 智能体连接到 MCP Server 以找到工具。
- AI 智能体根据查询使用合适的工具。
- 返回关于合成数据创建、评估或可视化的响应。
- 使用 Cursor 作为 MCP Host。
- 使用 SDV 生成逼真的表格形式的合成数据。
- SDV 是一个 Python 库，它使用机器学习来创建类似于真实世界模式的合成数据。这个过程包括训练模型、采样数据，并与原始数据进行验证。

## 9. MCP 驱动的 Deep Researcher 多智能体

ChatGPT 有一个 Deep Researcher 功能。它可以帮助你获取任何主题的详细见解。流程如下：

<img src="/assets/img/posts/649.gif" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

- 用户提交查询。
- 网络搜索智能体通过 Linkup 运行深度网络搜索。
- 研究分析师智能体验证并去除重复的结果。
- 技术写手智能体撰写带有引用的连贯响应。
- Linkup 用于深度网络研究。
- CrewAI 用于多智能体协调。
- Ollama 在本地提供 DeepSeek-R1 服务。
- Cursor 作为 MCP Host。
