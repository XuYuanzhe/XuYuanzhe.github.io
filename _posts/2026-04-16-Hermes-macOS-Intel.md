---
layout: post
title: macOS 系统安装赫尔墨斯
date: 2026-04-16 15:00:00
description: Install Hermes Agent + hermes-web-ui on macOS Intel
tags: AI
categories: 技术
giscus_comments: true
pretty_table: true
toc:
  beginning: true
---

# Hermes + Web UI 本地部署指南（macOS Intel）

本文档指导你在 macOS Intel 笔记本上完成 **Hermes Agent**（NousResearch 出品的 AI Agent 运行时）和 **hermes-web-ui**（可视化管理界面）的完整部署。

---

## 一、整体架构

```
浏览器 ──▶ hermes-web-ui (BFF, 端口 8648) ──▶ Hermes Gateway (端口 8642)
                  │
             Hermes CLI
                  │
          ~/.hermes/config.yaml
          ~/.hermes/auth.json
```

- **Hermes Agent**：核心后端，提供 CLI 和 Gateway 服务，连接各种 LLM 提供商
- **hermes-web-ui**：基于 Vue 3 的 Web 管理界面，通过 BFF 层与 Hermes 通信

---

## 二、前置条件

| 依赖          | 说明                                             | 检查命令                   |
| ------------- | ------------------------------------------------ | -------------------------- |
| macOS (Intel) | 系统要求                                         | `uname -m` 应输出 `x86_64` |
| Python 3      | Hermes Agent 依赖（安装脚本会自动处理）          | `python3 --version`        |
| Node.js ≥ 18  | hermes-web-ui 依赖                               | `node --version`           |
| LLM API Key   | 至少一个（OpenAI / OpenRouter / Nous Portal 等） | —                          |

> 如果还没有 Node.js，推荐用 Homebrew 安装：
>
> ```bash
> brew install node
> ```

---

## 三、第一步：安装 Hermes Agent

### 3.1 一键安装

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装完成后，重新加载 shell 配置：

```bash
source ~/.zshrc
```

### 3.2 验证安装

```bash
hermes --version
```

如果能正常输出版本号，说明安装成功。

### 3.3 初始配置

运行配置向导：

```bash
hermes setup
```

或者分步配置：

```bash
# 选择 LLM 提供商和模型
hermes model

# 查看/配置可用工具
hermes tools
```

配置过程中需要输入你的 LLM API Key（如 OpenAI API Key），配置会保存到 `~/.hermes/auth.json`。

### 3.4 测试 Hermes 能否正常工作

```bash
hermes
```

进入对话界面，发送一条消息确认 LLM 连接正常。确认无误后按 `Ctrl+C` 退出。

### 3.5 启动 Gateway 服务

hermes-web-ui 需要连接 Hermes Gateway，因此要先启动它：

```bash
hermes gateway
```

Gateway 默认监听 `localhost:8642`。保持此终端运行，或使用后台方式运行。

---

## 四、第二步：安装 hermes-web-ui

提供三种安装方式，推荐方式 A。

### 方式 A：npm 全局安装（推荐）

```bash
npm install -g hermes-web-ui
```

启动服务：

```bash
hermes-web-ui start
```

### 方式 B：一键脚本安装

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/EKKOLearnAI/hermes-web-ui/main/scripts/setup.sh)
```

此脚本会自动检测并安装缺失的 Node.js。

### 方式 C：从源码构建（适合开发者）

```bash
git clone https://github.com/EKKOLearnAI/hermes-web-ui.git
cd hermes-web-ui
npm install
npm run dev
```

源码模式下前端运行在 `http://localhost:5173`，BFF 运行在 `http://localhost:8648`。

---

## 五、访问 Web UI

安装并启动后，打开浏览器访问：

```
http://localhost:8648
```

首次启动时，系统会自动生成一个认证 Token，在终端输出中可以看到。复制该 Token 输入即可登录。

---

## 六、hermes-web-ui 常用命令

| 命令                              | 说明                 |
| --------------------------------- | -------------------- |
| `hermes-web-ui start`             | 以守护进程模式启动   |
| `hermes-web-ui start --port 9000` | 指定自定义端口启动   |
| `hermes-web-ui stop`              | 停止服务             |
| `hermes-web-ui restart`           | 重启服务             |
| `hermes-web-ui status`            | 查看运行状态         |
| `hermes-web-ui update`            | 更新到最新版本并重启 |

---

## 七、认证配置（可选）

hermes-web-ui 支持三种认证方式：

1. **Token 认证（默认）**：首次启动自动生成，也可通过环境变量手动指定：

   ```bash
   AUTH_TOKEN=your-custom-token hermes-web-ui start
   ```

2. **用户名密码**：在 Web UI 的设置页面中配置。

3. **禁用认证**（仅限本地开发环境）：
   ```bash
   AUTH_DISABLED=1 hermes-web-ui start
   ```

---

## 八、日常使用流程

每次使用时，确保以下两个服务都在运行：

```bash
# 终端 1：启动 Hermes Gateway
hermes gateway

# 终端 2：启动 Web UI（如果未在守护模式运行）
hermes-web-ui start
```

然后浏览器打开 `http://localhost:8648` 即可。

---

## 九、常见问题

### Q: `hermes: command not found`

安装后未重新加载 shell 配置。执行 `source ~/.zshrc` 后重试。

### Q: hermes-web-ui 无法连接 Hermes

确认 Hermes Gateway 是否在运行（`hermes gateway`），默认端口 8642 是否被占用。

### Q: npm install 报权限错误

不要使用 `sudo npm install -g`，改为修复 npm 全局目录权限：

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

然后重新执行 `npm install -g hermes-web-ui`。

### Q: Node.js 版本过低

hermes-web-ui 要求 Node.js ≥ 18。升级方式：

```bash
brew upgrade node
```

---

## 十、卸载

```bash
# 卸载 hermes-web-ui
hermes-web-ui stop
npm uninstall -g hermes-web-ui

# 卸载 Hermes Agent（删除配置目录）
rm -rf ~/.hermes
# 删除 hermes 可执行文件（路径参考安装时的输出）
```

---

## 参考链接

- Hermes Agent：https://github.com/NousResearch/hermes-agent
- hermes-web-ui：https://github.com/EKKOLearnAI/hermes-web-ui
