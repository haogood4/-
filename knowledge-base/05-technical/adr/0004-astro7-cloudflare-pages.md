# ADR-0004 · Astro 7 静态架构 + Cloudflare Pages 托管

- 状态：已采纳（Accepted）
- 日期：2026-09-20
- 决策者：技术负责人
- 取代：ADR-0001（Next.js 14 App Router）、ADR-0002（Vercel + Supabase）

## 决定

- **框架**：Astro 7.3.3，`output: "static"` + `build.inlineStylesheets: "never"`，构建期渲染全部 75 页；零框架水合、零运行时第三方依赖。
- **托管**：Cloudflare Pages，wrangler 4 CLI 部署（`wrangler pages deploy dist --project-name calculator-site`）；纯静态产物，无服务端函数。
- **计算**：全部在客户端执行——51 个 TypeScript 纯函数引擎 + 53 个页面脚本经 esbuild 预打包（esm + code splitting）外链。
- **否决项**：Next.js / Vercel、Supabase（Postgres）、Cloudflare Workers（轻 API）方案全部否决。

## 理由

- **零水合性能**：内容站 + 工具页形态无需 RSC/ISR；全站 JS gzip ≈60KB（硬限 100KB）、CSS 6.4KB，75 页构建 ≈2.3s。
- **内容站形态**：SEO 强需求，构建期 HTML + JSON-LD（183 块）+ sitemap + RSS 是最优解。
- **成本与安全**：Cloudflare Pages 免费层，无后端/数据库运维成本；攻击面收缩到静态文件，CSP 可收紧至 `script-src 'self'`。

## 后果与约束

- **CSP 内联 bug workaround**：Astro 7.3.3 存在未修 bug，特定「页面 + 脚本」组合会被内联为 `<script type="module">`，违反 CSP `script-src 'self'` 导致浏览器拦截。故 esbuild 预打包全部页面脚本至 `public/scripts/`（`scripts/build-public-scripts.mjs`，成为 `pnpm build` 必经步骤），页面一律外链 `<script is:inline type="module" src="/scripts/x-page.js">`；共享样板提取为 `kit-[hash]` chunk（一年 immutable 缓存）。`scripts/check-astro-fix.mjs` 为修复探针，上游修复后回归标准范式。
- **无服务端函数**：依赖后端的能力（实时汇率拉取、表单防滥用、持久化、A/B）均被排除；需要时须重新立项架构评审，不得引入 Edge Function 绕行。
- **域名未购**：`PUBLIC_SITE_URL` 为占位符 `https://example-calculator.cn`，`scripts/check-site-url.mjs` 在 predeploy 拦截占位/本地域名；购入域名并配置环境变量前不可部署。
- **体积卡口**：新增脚本/样式受 `bundle:check` 硬限约束（JS gzip ≤100KB、CSS ≤30KB），软红线 65KB。

---
