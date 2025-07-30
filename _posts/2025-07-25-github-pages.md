---
layout: post
title: 使用 jekyll 搭建自己的博客
date: 2025-07-25 15:00:00
description: basic knowledge is required, but not too much
tags: 教学 Ruby
categories: 技术
featured: false # 置顶
related_posts: false # 显示相关文章 全局已关闭
giscus_comments: true # giscus 评论
thumbnail: /assets/img/posts/202507251102553.png # 首页缩略图
mermaid:
  enabled: true # 流程图
  zoomable: true # 允许缩放
---

Jekyll有很多主题可以使用，下面是一些常用的主题：

> https://github.com/topics/jekyll-theme

本人使用的是al-folio主题，主题地址在这里：

> https://github.com/alshedivat/al-folio

## 一、基于模板创建 Github Pages 仓库

### step1

使用下面的链接创建一个新的仓库：

https://github.com/new?template_name=al-folio&template_owner=alshedivat

注意：仓库名称必须为 `<your-github-username>.github.io` 或 `<your-github-orgname>.github.io`

<img src="/assets/img/posts/202507251033900.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

### step2

进入新仓库依次找到 `Settings -> Actions -> General -> Workflow permissions` 授予读写权限

<img src="/assets/img/posts/202507251038571.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

### step3

修改 `_config.yml` 文件中的 `url` 和 `baseurl` 字段：

1. 把 url 设置成 `<your-github-username>.github.io`
2. 把 baseurl 设置成空字符串

<img src="/assets/img/posts/202507251043363.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

### step4

进入 `Actions -> Deploy site` 等待 `Update_config.yml` 完成从橙黄色变成绿色

<img src="/assets/img/posts/202507251049557.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

现在除了 `main` 分支还自动创建了一个 `gh-pages` 分支

### step5

进入 `Settings -> Pages -> Build and deployment` 修改 branch 从 `main` 切换到 `gh-pages` 点击 save 保存

### step6

进入 `Actions -> pages-build-deployment` 等待 `pages-build-deployment` 完成从橙黄色变成绿色

<img src="/assets/img/posts/202507251058972.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

进入 `pages-build-deployment` 可以看到网站已经生成了

<img src="/assets/img/posts/202507251102553.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

现在可以 clone 项目到本地进行编辑了

```shell
$ git clone git@github.com:<your-username>/<your-repo-name>.git
```

## 2. 本地编辑

官方建议使用 docker 环境 我这里使用的本地环境

al-folio 的官方文档参考：

> https://github.com/alshedivat/al-folio/blob/main/INSTALL.md

我这里使用 mac 电脑演示

### step1 Ruby

安装 ruby

```shell
brew install ruby
```

查看安装信息

```shell
brew install info
```

执行这个语句将我们自己安装的 ruby 添加到环境变量中（macOS 系统自带 ruby 我们用自己安装）

<img src="/assets/img/posts/202507241740123.png" class="card-img-top" width="100%" height="auto" alt="project thumbnail" loading="eager" onerror="this.onerror=null; $('.responsive-img-srcset').remove();">

查看 ruby 版本

```shell
ruby -v
```

### step2 Jekyll

安装 jekyll

```shell
gem install --user-install bundler jekyll
```

添加到环境变量中 我这里使用的是 zsh

```shell
echo 'export PATH="$HOME/.gem/ruby/3.4.0/bin/"' >> ~/.zshrc
source ~/.zshrc
```

查看 jekyll 版本

```shell
jekyll -v
```

### step3 Start

进入项目目录

```shell
cd <your-username>.github.io
```

启动项目

```shell
bundle exec jekyll serve
```

> ##### WARNING
>
> 官方模板里支持 RSS 订阅 这可能导致项目无法启动，我的解决方法是注释掉 `_config.yml` 中的 `external_sources` 相关代码
> {: .block-warning }

项目启动后可以在浏览器中访问 `http://localhost:4000` 查看效果，修改样式可以实时看到效果。

enjoy ✌︎(ツ)ɔ

### step4 一些关键字

```text
layout: post    # 分类
title: Test     # 标题
date: 2025-07-25 15:00:00           # 创建时间
last_updated: 2025-07-26 15:00:00   # 最后更新时间
description: test       # 简介
tags: Ruby              # 标签
categories: tech        # 分类
featured: false         # 置顶
related_posts: false    # 支持显示相关文章 全局已关闭
giscus_comments: false  # 支持评论
disqus_comments: false  # 支持 DISQUS 评论
pretty_table: true      # 支持 表
tabs: true              # 支持 tabs
typograms: true         # 支持 typograms 样式
citation: true          # 支持引用信息
pseudocode: true        # 支持 pseudocode 伪代码
code_diff: true         # 支持代码对比
map: true               # 支持 geojson 渲染
redirect: /assets/pdf/example_pdf.pdf               # 支持重定向
thumbnail: /assets/img/posts/202507251033900.png    # 缩略图
mermaid:
  enabled: true     # 支持流程图
  zoomable: true    # 允许流程图缩放
toc:
  beginning: true   # 支持目录
images:
  lightbox2: true   # 支持Lightbox2 图片库
  photoswipe: true
  spotlight: true
  venobox: true
chart:
  plotly: true      # 支持 plotly 图表
  vega_lite: true   # 支持 vega lite 图表
  echarts: true     # 支持 echarts 图表
  chartjs: true     # 支持 chart.js 图表
```

添加完文章后，可以通过 `npx prettier --write "**/*.md"` 来检查 `_posts` 目录下的文章格式是否正确。

安装 prettier 工具很简单，只需要执行 `npm install --save-dev prettier`

如果安装成功执行报错：

```shell
[error] Cannot find package '@shopify/prettier-plugin-liquid' imported from /Users/xuyuanzhe/path/XuYuanzhe.github.io/_posts/noop.js
```

是因为插件缺失，安装一下 Shopify 插件即可 `npm install --save-dev @shopify/prettier-plugin-liquid`
