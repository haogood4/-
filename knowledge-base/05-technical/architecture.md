---
project: calculator-site
doc_id: tech/architecture
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 系统架构

## 总览

纯静态架构：Astro 7.3.3 构建期渲染全部页面（75 页，约 2.3s），零框架水合、零运行时第三方依赖；全部计算在浏览器端由 TypeScript 纯函数引擎完成；无后端、无数据库、无服务端函数（Next.js / Vercel / Supabase / Cloudflare Workers 方案已全部否决）。

```
                     ┌─────────────────────────┐
                     │     用户（移动 / Web）    │
                     └──────────────┬──────────┘
                                    │ HTTPS
                                    ▼
                    ┌────────────────────────────────┐
                    │  Cloudflare Pages（托管 + CDN） │
                    │  dist/ 纯静态产物：              │
                    │   - HTML ×75（Astro 构建期渲染） │
                    │   - /_astro/*（CSS + 哈希产物）  │
                    │   - /scripts/*（esbuild 预打包） │
                    └────────────────────────────────┘

  页面交互：纯客户端计算（src/scripts/*-page.ts，无任何 API 调用）
  内容产出：构建期完成（markdown 经 marked + DOMPurify 清洗后写入静态 HTML）
  安全策略：public/_headers 全套安全头；CSP script-src 'self'，无内联脚本
```

## 分层与模块说明

| 层 | 模块 | 职责 |
|---|---|---|
| 页面层 | `src/pages/`（构建 75 页） | Astro 构建期渲染：51 个计算器页、文章详情、hub、列表页、法务页、搜索页 |
| 脚本层 | `src/scripts/`（53 个 `*-page.ts` + `_page-kit.ts`） | 页面交互与表单逻辑；经 esbuild 预打包到 `public/scripts/` 后由页面外链引用 |
| 引擎层 | `src/lib/calculators/`（51 个纯函数 + `_shared.ts`） | 全部计算公式：输入/输出纯数据、无副作用、Vitest 单测覆盖 |
| 数据层 | `src/data/`（`nav.ts` / `articles.ts` / `hubs.ts`） | 导航、文章元数据、hub 配置的唯一数据源 |
| 内容层 | `src/content/articles/`（11 篇 markdown） | Content Collections + marked + DOMPurify 构建期清洗，产出含 Article JSON-LD 的静态页 |
| 样式层 | `src/styles/global.css` | 单文件设计 token 与全部样式；`inlineStylesheets: "never"` 强制外链，满足 CSP `style-src 'self'` |
| 部署层 | Cloudflare Pages + wrangler 4 | 静态托管与边缘缓存；`public/_headers` 定义 CSP 与缓存策略 |

## 关键架构约束

1. **CSP 红线与脚本预打包**：`script-src 'self'` 禁止一切内联脚本。Astro 7.3.3 存在未修 bug，会把特定「页面 + 脚本」组合内联为 `<script type="module">`，生产环境被 CSP 拦截导致计算器不可用。workaround：全部页面脚本经 `scripts/build-public-scripts.mjs`（esbuild，esm + code splitting）预打包到 `public/scripts/`，页面一律以 `<script is:inline type="module" src="/scripts/x-page.js">` 外链引用；跨页共享样板被 splitting 提取为 `kit-[hash]` chunk，按一年 immutable 强缓存（`public/_headers` 中 `/scripts/kit-*`）。`scripts/check-astro-fix.mjs` 为修复探针，Astro 上游修复后可回归标准 `<script>` 范式。
2. **零运行时第三方依赖**：产品代码不引入任何运行时框架/库；`marked`、`isomorphic-dompurify`、esbuild 等仅在构建期使用。
3. **无服务端**：无 API、无数据库、无服务端函数；汇率换算等使用内置静态数据。需要后端能力（实时汇率拉取、表单防滥用、持久化）时须重新立项架构评审。
4. **数据单源**：首页分类导航与站内搜索索引统一读 `src/data/nav.ts`，工具清单禁止在页面内重复维护。

## SEO 与无障碍

- JSON-LD 共 183 块（WebSite / SoftwareApplication / FAQPage / BreadcrumbList / Article 等），由冒烟断言校验全部可解析。
- sitemap 70 条 URL（排除 noindex 的 legal 三页与搜索页）、robots.txt、RSS 全量 11 篇。
- 无障碍：全站每页恰好 1 个 h1、`<main id="main">` + skip-link、表单 label 全覆盖、WCAG AA 对比度（含 `prefers-color-scheme: dark` 暗色模式），均由 `scripts/smoke-dist.mjs` 12 组断言守住。

---

## 修订记录

- 2026-09-20 v1.1.0：按实际实现全面重写——Astro 7.3.3 纯静态架构（构建期渲染 + esbuild 预打包脚本 + 纯客户端计算）；删除已否决的 Next.js / Vercel / Cloudflare Workers / Supabase 内容（决策见 `adr/0004-astro7-cloudflare-pages.md`）。
