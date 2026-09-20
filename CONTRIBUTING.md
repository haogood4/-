# 贡献指南 — 计算器大全（calculator-site）

本文面向参与本项目的开发/运营同学。动手前请先通读「铁律」与「新增计算器页清单」两节。

## 项目概览

Astro 7 纯静态站（零水合）：51 个计算器页 + 11 篇知识库文章 + 5 个场景指南 + 搜索/收藏等增强功能。部署目标为 Cloudflare Pages（`pnpm deploy`），产物为 `dist/` 静态目录。

## 环境要求

- Node.js（以 CI 中版本为准）与 **pnpm ≥ 9**（CI 使用 11.x）
- ⚠️ 若 PATH 中存在 corepack shim 的 pnpm，可能出现 `pnpm verify` 静默 no-op 且返回 0（假绿）。验证时请使用系统 pnpm 绝对路径，例如 `PATH=/usr/bin:$PATH /usr/bin/pnpm verify`

## 常用命令

| 命令               | 作用                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `pnpm dev`         | 本地开发服务器                                                          |
| `pnpm build`       | 先打包页面脚本（esbuild）再 astro build                                 |
| `pnpm verify`      | 质量门禁：typecheck + lint + 单测 + prettier + mcp:check + bundle:check |
| `pnpm smoke`       | 对 `dist/` 的 10 组冒烟断言（需先 build）                               |
| `pnpm verify:dist` | build + smoke 一条龙                                                    |

**任何 PR 合并前必须 `pnpm verify` 与 `pnpm verify:dist` 全绿。**

## 铁律（违反即打回）

1. **CSP 红线**：`public/_headers` 的 `script-src 'self'` 不可放宽。禁止内联 `<script>`、禁止 `javascript:` URL、禁止新增第三方脚本域。页面脚本一律走外置管线（见下）。
2. **页面脚本管线**：所有 `src/scripts/*-page.ts` 由 `scripts/build-public-scripts.mjs` 自动发现、esbuild（esm + code splitting）打包到 `public/scripts/`，页面以 `<script is:inline type="module" src="/scripts/x-page.js"></script>` 引用。**必须带 `type="module"`**（共享 kit chunk 依赖 import）。这是 Astro 7 内联 bug 的 workaround，勿改回 `<script src>` 标准写法，除非 Astro 修复并回归验证（见 P3-15）。
3. **共享样板**：取元素/字段错误/结果状态机/复制/分享等交互一律使用 `src/scripts/_page-kit.ts`，禁止在页面脚本内复制样板（历史上 51 份拷贝导致 JS 超软红线，专项去除）。
4. **数据单一来源**：工具导航清单只允许存在于 `src/data/nav.ts`（首页、搜索索引、收藏 resolveTool 三处共用）。新增/改名工具页必须同步更新 nav.ts，否则搜索与收藏功能不可见。
5. **noindex 页不进 sitemap**：`astro.config.mjs` 的 sitemap filter 与页面 noindex 必须成对出现（smoke 断言 8 有自动冲突守卫）。
6. **体积预算**：JS gzip 软红线 65KB（当前 ~60KB）、硬限 100KB；CSS 软红线 30KB。新增代码使 `bundle:check` 失败即需先做去重/外置。
7. **计算逻辑与 UI 分离**：公式实现放 `src/lib/calculators/<name>.ts`（纯函数 + 输入校验 + 错误对象），页面脚本只做 DOM 粘合。金融/税务/健康类结果页必须保留「仅供参考」声明。

## 新增计算器页清单（必须全部完成）

1. `src/lib/calculators/<slug>.ts` — 纯计算逻辑 + 单元测试（参照既有 `*.test.ts`）
2. `src/pages/<category>/<slug>.astro` — 页面（复用既有结构：`#calc-form`、`#result-empty/#result-content/#result-stale-hint`、`#copy-btn`、`<CalcJsonLd>`、`<FaqSection>`）
3. `src/scripts/<slug>-page.ts` — 交互脚本，import `_page-kit`（A 方言：仅复制按钮；B 方言：复制+分享+resultBox）
4. 页面尾部 `<script is:inline type="module" src="/scripts/<slug>-page.js"></script>`
5. `src/data/nav.ts` 对应分类登记（label + href，href 需带尾斜杠且与实际路由一致）
6. 更新冒烟断言计数：`scripts/smoke-dist.mjs` 断言 1 页面总数（当前 75）、断言 4 计算器页数（当前 51）、断言 10 JSON-LD 块数（每计算器页 2 块）
7. `pnpm verify && pnpm verify:dist` 全绿

## 代码风格

- TypeScript strict；ESLint flat config（0 error 门禁；`no-explicit-any` 为 error）
- Prettier 统一格式化（`format:check` 在门禁内；一次性 codemod 脚本 `scripts/fix-*`/`remove-*`/`generate-*` 不在检查范围）
- 中间件/工具脚本一律 async/await，不用回调风格
- 注释与提交信息使用中文

## 测试

- 单测：vitest（`src/**/*.test.ts`，当前 271 用例），计算逻辑必须有边界值/非法输入用例
- 组件测试：`src/components/components.test.ts` 使用 Astro container API 真实渲染
- 冒烟：`scripts/smoke-dist.mjs` 对构建产物做 10 组硬断言（页面数、关键路由、JSON-LD、CSP、sitemap/robots/RSS/搜索索引等），CI 与 `verify:dist` 均执行

## 已知雷区（踩过的坑）

- `@astrojs/rss` v4：`trailingSlash` 是 boolean，传字符串直接构建失败
- `@astrojs/sitemap` v3.7：无 `exclude` 配置键，误用会导致 sitemap 整体不生成（用 `filter`）
- typescript-eslint 暂不支持 TypeScript 7：typecheck 用 `typescript-v7` 别名，lint 用根 typescript@6
- zsh 下 `grep` 无匹配返回 1 会断 `&&` 链；`pkill -f` 会自匹配
- ESLint `no-unused-expressions` 禁三元语句（`void x` 除外）
