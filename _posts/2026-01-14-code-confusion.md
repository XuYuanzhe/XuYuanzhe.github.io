---
layout: post
title: Pyarmor 包
date: 2026-01-14 15:00:00
description: Python 混淆技术
tags: Python 教学
categories: 技术
giscus_comments: true
pretty_table: true
---

# 尝试使用 pyarmor 包混淆 python 服务

## step1 安装

在虚拟环境中使用 pip 下载

```shell
uv pip install pyarmor
```

查看版本

```shell
uv pip list | grep pyarmor

# 输出
Using Python 3.12.12 environment at: .env-multi-agent
pyarmor                                           9.2.3
pyarmor-cli-core                                  8.1.0
```

## step2 准备工作

确保服务可以正常启动

```shell
# 进入项目
cd /path/to/your/project

# 启动服务
uvicorn main:app --reload

# 服务正常启动会输出
INFO:     Will watch for changes in these directories: ['/path/to/your/project']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [54433] using WatchFiles
__start__
__start__
__start__
INFO:     Started server process [54435]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## step3 混淆

第一次尝试使用 pyarmor 混淆

```shell
pyarmor gen --output=dist --include="**/*.py" .
```

遇到报错信息如下

```shell
INFO     Python 3.12.12
INFO     Pyarmor 9.2.3 (trial), 000000, non-profits
INFO     Platform darwin.x86_64
INFO     search inputs ...
INFO     find package at .
INFO     find 1 top resources
...
INFO     write dist/./.env-multi-agent/lib/python3.12/site-packages/nest_asyncio.py
INFO     obfuscating file typing_extensions.py
ERROR    out of license

Pyarmor 9.2.3 (trial), 000000, non-profits
```

查询后发现，通过 pip 安装的 pyarmor 9.2.3版本为 trial（实验）版，混淆过多文件会提示超出限制。

随后查看 trial 版支持的命令用法

```shell
pyarmor gen -h
```

支持参数如下：

| 参数                              | 简写                | 类型/值                                | 中文说明                                                                                 | 使用建议                                                  |
| --------------------------------- | ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `-O PATH`                         | `--output PATH`     | 路径字符串                             | 指定混淆后文件的输出目录                                                                 | 必填，例如 `-O dist`                                      |
| `-r`                              | `--recursive`       | 无值（开关）                           | 递归处理子目录中的 `.py` 文件                                                            | 处理包结构时必加                                          |
| `--exclude PATTERN`               | —                   | 路径模式（可多次使用）                 | 排除匹配的文件或目录（支持通配符）                                                       | 用于跳过虚拟环境、缓存等，如 `--exclude .env-multi-agent` |
| `--obf-module {0,1}`              | —                   | `0` 或 `1`（默认 `1`）                 | 是否混淆整个模块（文件）<br>`1`=是，`0`=否                                               | 一般保持默认                                              |
| `--obf-code {0,1,2}`              | —                   | `0`/`1`/`2`（默认 `1`）                | 函数级代码混淆强度：<br>`0`=不混淆函数体<br>`1`=基本混淆<br>`2`=增强混淆（更慢但更安全） | 试用版可能限制 `2`                                        |
| `--no-wrap`                       | —                   | 无值                                   | 禁用“包装模式”（wrap mode）                                                              | 高级选项，一般不用                                        |
| `--mix-str`                       | —                   | 无值                                   | 混淆字符串常量（防明文提取）                                                             | 增强保护，推荐开启                                        |
| `--assert-call`                   | —                   | 无值                                   | 运行时检查函数是否被混淆（防篡改）                                                       | 增强安全性                                                |
| `--assert-import`                 | —                   | 无值                                   | 运行时检查模块是否被混淆                                                                 | 同上                                                      |
| `--enable {jit,bcc,rft,themida}`  | —                   | 特性名                                 | 启用高级混淆技术（部分需专业版）                                                         | 试用版通常不可用                                          |
| `--private`                       | —                   | 无值                                   | 启用私有模式（脚本级隔离）                                                               | 适用于单脚本分发                                          |
| `--restrict`                      | —                   | 无值                                   | 启用包限制模式（防止被其他代码导入）                                                     | 保护核心模块时可用                                        |
| `-i`                              | —                   | 无值                                   | 将运行时文件嵌入到输出包内（不生成独立 `pyarmor_runtime_xxx` 目录）                      | 方便分发，减少文件数                                      |
| `--prefix PREFIX`                 | —                   | 字符串                                 | 为运行时包设置导入前缀（用于多版本共存）                                                 | 高级场景使用                                              |
| `--platform NAME`                 | —                   | 平台名（如 `linux.x86_64`）            | 交叉平台混淆（在 A 平台生成 B 平台代码）                                                 | 跨平台部署时使用                                          |
| `--outer`                         | —                   | 无值                                   | 启用外部运行时密钥（配合授权绑定）                                                       | 需专业版                                                  |
| `-e DATE`                         | `--expired DATE`    | 日期（如 `2025-12-31`）                | 设置代码过期时间                                                                         | 试用版可能不支持                                          |
| `--period N`                      | —                   | 整数（天数）                           | 定期检查运行时密钥有效性                                                                 | 配合授权使用                                              |
| `-b DEV`                          | `--bind-device DEV` | 设备标识（如 `mac=aa:bb:cc:dd:ee:ff`） | 绑定到特定设备                                                                           | 需专业版                                                  |
| `--bind-data STRING or @FILENAME` | —                   | 字符串或 `@文件路径`                   | 在运行时密钥中嵌入自定义数据                                                             | 高级授权用途                                              |

开始尝试混淆单个文件

```shell
pyarmor gen --output=dist example/test.py
```

看到正常输出后说明参数正确，开始尝试白名单混淆整个项目

```shell
pyarmor gen -O dist -r main.py app controller core model
```

正确的输出了 dist 文件夹且命令行无报错，进入dist 文件夹查看服务是否可以正常启动

```shell
# 进入项目
cd dist

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000

# 服务正常启动会输出
__start__
__start__
__start__
INFO:     Started server process [53613]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

服务启动正常且文件混淆成功，证明 pyarmor 的 trial 版本是满足混淆预期的。
