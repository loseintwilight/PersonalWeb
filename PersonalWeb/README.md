# 启航 · PersonalWeb

「启航」— 个人技术博客与作品集。以「航海探索」为隐喻的 React 单页应用（SPA），纯前端、静态部署。

> 人生如航海，每一次出发都是对未知的探索。扬帆，启航。

## ✨ 功能特性

- **游戏化角色展示**：沉浸式展示区升级为三张 16:9 角色卡（滚动入场 + 光束扫过 + 持续浮动呼吸 + 鼠标 3D 视差 + 滚动视差 + HUD 扫描线 / 边缘发光 / 高光扫过）；全站新增缓慢光晕与星光粒子环境层；Hero 视频加入 Ken Burns 缩放与光影流动
- **fqzlr 风格首页**：sail.mp4 航海视频全屏循环（2 倍速播放）+ 下拉滚动视差动效（文案上移淡出 + 视频缩放 + 圆角玻璃幕布 + 滚动进度条）+ 公告跑马灯 + 动态访客欢迎语（api.ip.sb/geoip 与 ipinfo.io 双源定位，显示访客所在省/市，失败自动降级）
- **3D 天气粒子系统**：春 / 夏 / 秋 / 冬 × 晴 / 多云 / 下雨 / 下雪；雨 / 雪为 Three.js 全屏 3D 粒子（雨滴下落 + 落地水花 / 雪花飘落自旋），支持鼠标视差、甩动刮风、点击阵风，右下角控制面板切换并持久化到 localStorage
- **全站 2D 航海氛围**：所有页面均有蓝天白云 + 三层波浪海洋 + 横穿航行的 2D 帆船
- **航迹页 3D 交互**：Three.js 3D 帆船 + 动态海洋 + 天空云朵海鸥，支持拖拽旋转视角与滚轮缩放（懒加载独立 chunk）
- **关于页 3D 船长舱室**：木质船舱 + 舷窗动态海景（昼夜切换）+ 舵轮 / 书桌 / 双层床 / 书架，用户头像相框置于舱内；拖拽旋转、滚轮缩放、点击台灯 / 舷窗 / 相框互动（懒加载独立 chunk）
- **fqzlr 风格导航**：浮岛胶囊导航（左头像 + 站名、滚动收缩、滑动高亮、玻璃下拉菜单）
- **分层动效**：DOM 滚动入场（clip-path 数据卡片）+ 光标光晕；Anime.js 标题逐字渐显、指南针加载、数字计数
- **文件系统驱动内容**：博客 Markdown、项目 / 动态 / 友链 / 首页自定义区 JSON
- **Markdown 渲染**：自研轻量渲染器（标题 / 列表 / 表格 / 引用 / 代码块 + 轻量语法高亮）
- **性能与无障碍**：尊重 prefers-reduced-motion，动画以 transform / opacity 为主；favicon 使用 load.jpg Q 版角色

## 🧰 技术栈（版本锁定）

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React + TypeScript | 19.2.8 / 7.0.2 |
| 样式 | TailwindCSS | 4.3.3 |
| 构建 | Vite | 8.1.4 |
| 2D 动画 | Anime.js | 4.5.0 |
| 3D | Three.js | 0.184.0 |
| 路由 | react-router-dom | 7.18.2 |

## 🚀 快速开始

```bash
# 安装依赖（要求 Node.js 20+，使用 pnpm）
pnpm install

# 开发服务器 http://localhost:5173
pnpm dev

# 类型检查 + 生产构建（产物在 dist/）
pnpm build

# 本地预览构建产物
pnpm preview
```

## 📁 目录结构

```
src/
├── components/
│   ├── ui/          # 基础原子组件（按钮、卡片、徽章、图标、下拉）
│   ├── animation/   # 动效组件（Magnet / ScrollExpand 来自 react-bits；Reveal / AnimatedText / CountUp / WaveDivider / Sailboat / CompassLoader / CursorGlow / AmbientAura 为自研）
│   └── sections/    # 板块（Navbar / Footer / Backdrop / ThemePanel / WakeSea3D / WeatherFX / ImmersiveShowcase / PostCard / ProjectCard）
├── hooks/           # useTheme（季节天气）、usePrefersReducedMotion、usePageTitle
├── utils/           # markdown 渲染器、内容加载器、格式化
├── content/
│   ├── blog/        # 文章 Markdown（frontmatter：title/date/category/tags/summary）
│   ├── projects/    # 项目 JSON
│   ├── wake/        # 动态 JSON
│   ├── links/       # 友链 JSON
│   └── custom/      # 首页自由设计区 / 角色展示 JSON
├── pages/           # 路由页面
├── themes.ts        # 季节 / 天气数据与页面默认主题映射
└── index.css        # 全局样式（主题变量、组件类、keyframes）
```

## ✏️ 内容维护

- **写文章**：在 `src/content/blog/` 新建 `xxx.md`，头部用 `---` 包裹 frontmatter 即可自动出现在日志 / 归档 / 首页
- **项目 / 动态 / 友链 / 首页自由区**：直接编辑对应 JSON
- **角色展示**：编辑 `src/content/custom/showcase.json`（kicker / title / subtitle / bg / items；items 每项含 code、image、title、subtitle、tags；图片建议 16:9 横屏）
- **季节默认主题**：修改 `src/themes.ts` 中的 `pageDefaultThemes`

## 🌍 部署

```bash
pnpm build
```