// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-关于我",
    title: "关于我",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-博客",
          title: "博客",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-github仓库",
          title: "GitHub仓库",
          description: "Edit the `_data/repositories.yml` and change the `github_users` and `github_repos` lists to include your own GitHub profile and repositories.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "post-记忆策略与技术实现",
        
          title: "记忆策略与技术实现",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/memory/";
          
        },
      },{id: "post-mcp-架构设计模式",
        
          title: "MCP 架构设计模式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/mcp-design/";
          
        },
      },{id: "post-函数调用与上下文协议",
        
          title: "函数调用与上下文协议",
        
        description: "function calling &amp; model context protocol",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/mcp/";
          
        },
      },{id: "post-langchain-学习",
        
          title: "LangChain 学习",
        
        description: "LangChain中文文档：https://www.langchain.asia/",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/langchain/";
          
        },
      },{id: "post-使用-jekyll-搭建自己的博客",
        
          title: "使用 jekyll 搭建自己的博客",
        
        description: "basic knowledge is required, but not too much",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/github-pages/";
          
        },
      },{id: "post-一位父亲写给儿子的婚前寄语",
        
          title: "一位父亲写给儿子的婚前寄语",
        
        description: "a great great father",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/father-to-son/";
          
        },
      },{id: "post-智能体与工作流",
        
          title: "智能体与工作流",
        
        description: "agent &amp; workflow",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/aigc/";
          
        },
      },{id: "post-提示词",
        
          title: "提示词",
        
        description: "prompt",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/prompt/";
          
        },
      },{id: "post-有关于人工智能",
        
          title: "有关于人工智能",
        
        description: "all in ai",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/ai/";
          
        },
      },{id: "post-人这一生为什么要读很多的书",
        
          title: "人这一生为什么要读很多的书？",
        
        description: "why do people need to read a lot of books",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/why-need-read/";
          
        },
      },{id: "post-面试准备思路",
        
          title: "面试准备思路",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/interview/";
          
        },
      },{id: "post-nginx-编译与安装及自签名-ssl-证书生成与配置",
        
          title: "Nginx 编译与安装及自签名 SSL 证书生成与配置",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/nginx-https-config/";
          
        },
      },{id: "post-linux-操作系统对log的一些处理手段的记录",
        
          title: "Linux 操作系统对log的一些处理手段的记录",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/grep/";
          
        },
      },{id: "post-python-基础",
        
          title: "python 基础",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/python/";
          
        },
      },{id: "post-我的笔记",
        
          title: "我的笔记",
        
        description: "some private goods",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/my-notes/";
          
        },
      },{id: "post-linux-命令手册",
        
          title: "Linux 命令手册",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/linux/";
          
        },
      },{id: "post-git工作流规范",
        
          title: "Git工作流规范",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/git-workflow/";
          
        },
      },{id: "post-个人简历模板",
        
          title: "个人简历模板",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/resume-template/";
          
        },
      },{id: "post-思考和解决问题的方法",
        
          title: "思考和解决问题的方法",
        
        description: "methods of thinking and problem-solving",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/solve-problem/";
          
        },
      },{id: "post-正则表达式",
        
          title: "正则表达式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/re/";
          
        },
      },{id: "post-dns协议",
        
          title: "DNS协议",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/dns-protocol/";
          
        },
      },{id: "post-什么时候该离职",
        
          title: "什么时候该离职？",
        
        description: "when to leave",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/when-to-leave/";
          
        },
      },{id: "post-一些编程书籍资源",
        
          title: "一些编程书籍资源",
        
        description: "some books",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/books/";
          
        },
      },{id: "post-三种成本",
        
          title: "三种成本",
        
        description: "three costs",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/three-costs/";
          
        },
      },{id: "post-三句义",
        
          title: "三句义",
        
        description: "simple understanding",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/buddhism/";
          
        },
      },{id: "post-既然有-http-请求-为什么还要用-rpc-调用",
        
          title: "既然有 HTTP 请求，为什么还要用 RPC 调用？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/http-rpc/";
          
        },
      },{id: "post-印第安文化以及-goro-s",
        
          title: "印第安文化以及 Goro’s",
        
        description: "simple record",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/indian-silver/";
          
        },
      },{id: "post-vim-command-常用操作",
        
          title: "Vim Command 常用操作",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/vim-command/";
          
        },
      },{id: "post-使用http-2-0-进行反爬",
        
          title: "使用Http/2.0 进行反爬",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/http2/";
          
        },
      },{id: "post-内卷",
        
          title: "内卷",
        
        description: "involution",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/involution/";
          
        },
      },{id: "post-boringssl-实验",
        
          title: "BoringSSL 实验",
        
        description: "experiment",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/boringSSL/";
          
        },
      },{id: "post-赛博朋克2077故事梗概",
        
          title: "赛博朋克2077故事梗概",
        
        description: "John Wick or Johnny Silverhand",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/cyberpunk2077/";
          
        },
      },{id: "post-我的第一本算法书",
        
          title: "我的第一本算法书",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/assets/pdf/my_first_algorithm_book.pdf";
          
        },
      },{id: "post-图解网络",
        
          title: "图解网络",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/assets/pdf/illustrated_network.pdf";
          
        },
      },{id: "post-redis-大全",
        
          title: "Redis 大全",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/assets/pdf/a_complete_collection_of_redis.pdf";
          
        },
      },{id: "post-包含各种组件的文章示例",
        
          title: "包含各种组件的文章示例",
        
        description: "an example of a distill-style blog post and main elements",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/distill/";
          
        },
      },{id: "post-edc-大饱眼福",
        
          title: "EDC 大饱眼福",
        
        description: "玩到最后就是拍照",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/favorite-edc/";
          
        },
      },{id: "post-高级图像组件",
        
          title: "高级图像组件",
        
        description: "this is what advanced image components could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/advanced-images/";
          
        },
      },{id: "post-图像库组件",
        
          title: "图像库组件",
        
        description: "this is what included image galleries could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/photo-gallery/";
          
        },
      },{id: "post-table-of-contents-目录样式-左侧",
        
          title: "Table of Contents 目录样式[左侧]",
        
        description: "an example of a blog post with table of contents on a sidebar",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/sidebar-table-of-contents/";
          
        },
      },{id: "post-table-of-contents-目录样式-顶部",
        
          title: "Table of Contents 目录样式[顶部]",
        
        description: "an example of a blog post with table of contents",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/table-of-contents/";
          
        },
      },{id: "post-tables-样式",
        
          title: "Tables 样式",
        
        description: "an example of how to use Bootstrap Tables",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/tables/";
          
        },
      },{id: "post-custom-blockquotes-样式",
        
          title: "Custom Blockquotes 样式",
        
        description: "an example of a blog post with custom blockquotes",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/custom-blockquotes/";
          
        },
      },{id: "post-引用样式",
        
          title: "引用样式",
        
        description: "this is what a post that can be cited looks like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/post-citation/";
          
        },
      },{id: "post-视频支持",
        
          title: "视频支持",
        
        description: "this is what included videos could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/videos/";
          
        },
      },{id: "post-音频支持",
        
          title: "音频支持",
        
        description: "this is what included audios could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/audios/";
          
        },
      },{id: "post-chartjs-组件示例",
        
          title: "chartjs 组件示例",
        
        description: "this is what included chart.js code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/chartjs/";
          
        },
      },{id: "post-diff-code-组件示例",
        
          title: "diff code 组件示例",
        
        description: "this is how you can display code diffs",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/code-diff/";
          
        },
      },{id: "post-typograms-组件示例",
        
          title: "typograms 组件示例",
        
        description: "this is what included typograms code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/typograms/";
          
        },
      },{id: "post-jupyter-组件示例",
        
          title: "jupyter 组件示例",
        
        description: "an example of a blog post with jupyter notebook",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/jupyter-notebook/";
          
        },
      },{id: "post-tabs-组件示例",
        
          title: "tabs 组件示例",
        
        description: "this is what included tabs in a post could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/tabs/";
          
        },
      },{id: "post-vega-lite-组件示例",
        
          title: "vega lite 组件示例",
        
        description: "this is what included vega lite code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/vega-lite/";
          
        },
      },{id: "post-plotly-组件示例",
        
          title: "plotly 组件示例",
        
        description: "this is what included plotly.js code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/plotly/";
          
        },
      },{id: "post-echarts-组件示例",
        
          title: "echarts 组件示例",
        
        description: "this is what included echarts code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/echarts/";
          
        },
      },{id: "post-pseudocode-组件示例",
        
          title: "pseudocode 组件示例",
        
        description: "this is what included pseudo code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/pseudocode/";
          
        },
      },{id: "post-geojson-组件示例",
        
          title: "geojson 组件示例",
        
        description: "this is what included geojson code could look like",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2018/geojson-map/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%74%6D%73%6A%6A%73%61%6E%67@%31%36%33.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/XuYuanzhe", "_blank");
        },
      },{
        id: 'social-wechat_qr',
        title: 'Wechat_qr',
        section: 'Socials',
        handler: () => {
          window.open("", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://xuyuanzhe.github.io/", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
