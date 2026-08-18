# AGENTS.md — 项目级约束（仅本项目生效）

本文件为「启航」个人网站项目（`D:\MyBlog\PersonalWeb`）的代理开发约束。
**注意：本文档中的 Skills 资源仅作为本项目的设计上下文读取，不安装到 Codex / 其他环境全局。**

## 上位文档

- 最高约束：`D:\MyBlog\系统规则文档.md`（技术栈版本锁定、动效分层铁律、工程规范）
- 需求文档：`D:\MyBlog\PRD.md`（页面结构、主题系统、视觉方向；改需求先改 PRD）
- 需求思路：`D:\MyBlog\思路.md`

## 技术栈（版本锁定，禁止自行升级）

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React + TypeScript | 19.2.8 + 7.0.2 |
| 样式 | TailwindCSS | 4.3.3 |
| 构建 | Vite | 8.1.4 |
| 2D 动画 | Anime.js | 4.5.0 |
| 3D | Three.js | 0.184.0 |
| 路由 | react-router-dom | 7.18.2 |
| 包管理 | pnpm | 11.x |

严禁未经许可引入其他 UI / 动画 / 状态管理库。

## 动效分层（铁律）

1. DOM 动效层：react-bits 组件 + 自研 Reveal / CursorGlow（CSS / IntersectionObserver）
2. 2D 创意动画层：Anime.js（SVG、数字、加载动画）
3. WebGL 3D 层：Three.js（仅背景装饰）

同一目标元素禁止被多个动画引擎同时控制；动画实例必须在 useEffect 清理函数中销毁。

## 本地 Skills 资源（只读上下文，勿安装为全局）

| 资源 | 用途 |
|------|------|
| `D:\MyBlog\Skills\taste-skill-main` | 视觉审美总控（三 Dial 系统） |
| `D:\MyBlog\Skills\impeccable-main` | 微交互 / 滚动叙事质量标尺 |
| `D:\MyBlog\Skills\ui-ux-pro-max-skill-main` | 布局 / 色彩 / 字体参考 |
| `D:\MyBlog\Skills\andrej-karpathy-skills-main` | 编码四原则（Think First / Simplicity / Surgical / Goal-Driven） |
| `D:\MyBlog\Skills\Component\react-bits-main` | DOM 动效组件，按需复制到 `src/components/animation/` |
| `D:\MyBlog\Skills\Component\anime-master` | Anime.js 4 本地源码参考 |

## 工程规范

- 目录：`components/ui`（原子）→ `components/animation`（动效）→ `components/sections`（板块）→ `pages` → `hooks` → `utils` → `content`
- 全部函数式组件 + Hooks，动画逻辑抽离为独立 Hook / 组件
- 通用组件 props 化，禁止硬编码业务内容
- TypeScript 类型完整，禁止滥用 any
- 内容数据驱动：博客在 `src/content/blog/*.md`，项目 / 动态 / 友链 / 首页自定义区为 JSON

## 性能红线

- 桌面端滚动 ≥ 55fps；动画优先 transform / opacity
- 尊重 `prefers-reduced-motion`，低性能设备自动降级 Three.js 场景
- 移动端降低动效强度

## 开发流程

1. 需求变更 → 先更新 `D:\MyBlog\PRD.md`，用户确认后再改代码
2. 增量开发，禁止全量重写
3. 验收：`pnpm build` + `pnpm preview`

## 截图 / 生成文件保存位置（用户要求）

- 禁止把截图、录屏、导出的图片等生成文件保存到 C 盘（包括 `C:\Users\...\.codex\visualizations`、桌面、文档等位置）。
- 如果任务需要保存截图或图片供用户查看，必须保存到本项目目录内（如 `PersonalWeb/.shots`）。
- 首次在项目目录内创建存放截图/附件的文件夹前，必须先询问用户并得到明确同意；用户未同意时不得创建。
