---
project: calculator-site
doc_id: tech/repo-structure
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 代码目录结构

```
.
├── astro.config.mjs              # Astro 7.3.3：output:"static" + inlineStylesheets:"never" + sitemap filter + 构建后断言 hook
├── package.json                  # pnpm 11 脚本与依赖（deploy / verify / build / smoke 等）
├── tsconfig.json                 # TS strict（extends astro/tsconfigs/strict）
├── eslint.config.js              # ESLint 10 flat config（typescript-eslint 8 + eslint-plugin-astro 3）
├── vitest.config.ts              # Vitest 5
│
├── src/
│   ├── pages/                    # 构建产出 75 页（51 计算器页 + 首页/404/搜索/文章/hub/法务）
│   │   ├── index.astro / 404.astro / search.astro / articles-list.astro
│   │   ├── finance/              # 16 个：mortgage-cn、loan-cn、irr-cn、income-tax-cn、prepayment-cn、fund-dca-cn …
│   │   ├── investment/           # 10 个：roas-cn、break-even-cn、option-pricing-cn、amazon-fba-cn、crypto-position-cn …
│   │   ├── health/               # 5 个：bmi-cn、calorie-burn-cn、pace-cn、due-date-cn、ovulation-cn
│   │   ├── math/                 # 5 个：percentage、discount、ratio、unit-price、average
│   │   ├── daily/                # 4 个：basic、age、date-diff、fuel-consumption-cn
│   │   ├── efficiency/           # 4 个：scientific-cn、base-converter-cn、ip-subnet-cn、word-count-cn
│   │   ├── renovation/           # 4 个：renovation-budget-cn、tile-quantity-cn、paint-quantity-cn、floor-area-cn
│   │   ├── unit/                 # 2 个：length、temperature
│   │   ├── dev/                  # 1 个：timestamp
│   │   ├── articles/[slug].astro # 文章详情（11 篇，来自 Content Collections）
│   │   ├── hub/                  # index.astro + [slug].astro（专题 hub）
│   │   └── legal/                # terms / disclaimer / privacy（noindex，sitemap 排除）
│   │
│   ├── scripts/                  # 53 个 *-page.ts 页面脚本 + _page-kit.ts 共享模块
│   │                             # （由 scripts/build-public-scripts.mjs esbuild 预打包至 public/scripts/）
│   │
│   ├── lib/calculators/          # 51 个纯函数计算引擎 + _shared.ts（数值校验）+ 同名 *.test.ts 单测
│   │
│   ├── components/               # SiteHeader / SiteFooter / Breadcrumb / BreadcrumbJsonLd / CalcJsonLd /
│   │                             # FaqSection / ResultArea / AdContainer / ArticleCard
│   │                             # + components.test.ts（Astro container API 真实渲染断言）
│   ├── layouts/BaseLayout.astro  # 唯一布局：head/SEO/canonical/暗色跟随/SW 注册/skip-link
│   ├── data/                     # nav.ts（首页导航唯一源）/ articles.ts / hubs.ts
│   ├── content/articles/         # 11 篇 markdown 文章（content.config.ts 定义集合）
│   ├── styles/global.css         # 单文件设计 token 与全部样式
│   ├── content.config.ts
│   └── env.d.ts
│
├── public/                       # 原样发布的静态资源
│   ├── _headers                  # CSP 与全套安全头 + 分路径缓存策略
│   ├── manifest.json / robots.txt / favicon.svg / icons/ / og-image.png|svg
│   ├── scripts/                  # esbuild 预打包产物：x-page.js + kit-[hash] 共享 chunk
│   ├── sw.js / register-sw.js    # Service Worker 与注册器（离线缓存）
│   └── menu.js                   # 移动端菜单脚本（外链普通脚本，兼容 CSP）
│
├── scripts/                      # Node 工具脚本（零依赖）
│   ├── build-public-scripts.mjs  # esbuild 预打包管线（esm + splitting → public/scripts/）
│   ├── smoke-dist.mjs            # 构建产物冒烟断言（12 组：页数/CSP/死链/a11y/JSON-LD/暗色等）
│   ├── check-bundle-size.mjs     # 体积卡口：JS gzip ≤100KB / CSS gzip ≤30KB
│   ├── check-site-url.mjs        # PUBLIC_SITE_URL 部署守卫（拦截占位/本地域名）
│   ├── check-astro-fix.mjs       # Astro 内联脚本 bug 修复探针
│   ├── check-mcp-json.mjs        # mcp-config JSON 可解析校验
│   └── generate-* / fix-* / migrate-*   # 历史生成与迁移脚本（一次性）
│
├── .github/workflows/ci.yml      # CI：Node 22 + pnpm 11 → verify + build + smoke + sitemap/robots/manifest 断言
├── knowledge-base/               # 项目知识库（本文件所在树）
├── .trae/specs/                  # 规格文档
└── mcp-config/ / mcp-manual/     # MCP 配置与手册
```

## 约定

- 新增计算器四件套：`lib/calculators/x.ts`（引擎 + 单测）→ `pages/<dir>/x.astro`（页面）→ `scripts/x-page.ts`（交互，预打包管线自动枚举）→ 在 `data/nav.ts` 登记导航。
- 页面脚本一律外链 `/scripts/x-page.js`，禁止内联脚本；禁止新增运行时第三方依赖。
- 工具清单只在 `data/nav.ts` 维护一份；页面与搜索索引均从它读取。

---

## 修订记录

- 2026-09-20 v1.1.0：按实际目录树全面重写（原 Next.js App Router 结构作废）。
