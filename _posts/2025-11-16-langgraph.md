---
layout: post
title: 多智能体
date: 2025-11-16 15:00:00
description: LangGraph 学习
tags: AI
categories: 技术
giscus_comments: true
---

# 是什么？

LangGraph 是 LangChain 生态的底层工作流编排框架，用有向图结构管理复杂 AI Agent 系统

# 有什么优势？

- 持久执行：支持故障恢复，自动从断点继续执行，适合长期运行任务
- 可视化流程：与 LangSmith 集成，提供执行路径追踪和状态转换可视化
- 动态控制：条件分支、循环、并行执行，提供细粒度控制，开发者可精确设计和观察每一步行为
- 状态管理：内置状态持久化，支持短期和长期记忆，保持上下文一致性
- 人机协作：无缝集成人工干预，可在任意执行点检查和修改状态

# 核心组件

langgraph 的核心是有向图模型，由三个基本组件构成

```text
节点(Node) → 边(Edge) → 状态(State)
```

- 节点 (Node)：工作流中的基本处理单元，可代表 LLM 调用、工具执行或自定义逻辑，接收并处理状态，返回更新后的状态
- 边 (Edge)：定义节点间的连接关系和执行路径，分为：
  - 普通边：固定执行顺序
  - 条件边：根据状态值决定下一步路径，实现动态决策
- 状态 (State)：贯穿整个工作流的数据结构，在节点间流动并被修改，支持短期工作记忆和长期持久化存储

# 安装

```shell
# 必要依赖
pip install langchain langgraph langchain-community

# 可视化工具
pip install langsmith
```

# Demo

```python
from typing import List, Dict, Tuple
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langchain_core.language_models import ChatOpenAI

# 1. 定义状态
class ChatState(BaseModel):
    messages: List[Dict[str, str]] = []
    current_input: str = ""
    should_continue: bool = True

# 2. 定义节点函数
async def process_user_input(state: ChatState) -> ChatState:
    """处理用户输入"""
    messages = state.messages + [{"role": "user", "content": state.current_input}]
    return ChatState(
        messages=messages,
        current_input=state.current_input,
        should_continue=True
    )

async def generate_ai_response(state: ChatState) -> ChatState:
    """生成AI回复"""
    llm = ChatOpenAI(temperature=0.7)
    response = await llm.ainvoke(state.messages)
    messages = state.messages + [{"role": "assistant", "content": response}]
    return ChatState(
        messages=messages,
        current_input=state.current_input,
        should_continue=True
    )

def should_continue(state: ChatState) -> str:
    """决定是否继续对话"""
    if "goodbye" in state.current_input.lower():
        return "end"
    return "continue"

# 3. 构建图
workflow = StateGraph(ChatState)

# 添加节点
workflow.add_node("process_input", process_user_input)
workflow.add_node("generate_response", generate_ai_response)

# 添加边
workflow.add_edge("process_input", "generate_response")
workflow.add_conditional_edges(
    "generate_response",
    should_continue,
    {
        "continue": "process_input",
        "end": END
    }
)

# 4. 编译图
app = workflow.compile()

# 5. 运行对话
async def chat():
    state = ChatState()
    while True:
        user_input = input("You: ")
        state.current_input = user_input
        state = await app.ainvoke(state)
        print("Bot:", state.messages[-1]["content"])
        if not state.should_continue:
            break

# 运行聊天
import asyncio
asyncio.run(chat())
```
