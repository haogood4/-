---
project: calculator-site
doc_id: tech/stack
type: sop
domain: tech
locale: zh-CN
version: v1.2.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 技术选型

| 类别 | 选型 | 理由 |
|---|---|---|
| 前端框架 | Astro 7.3.3（`output: "static"`、`build.inlineStylesheets: "never"`） | 构建期渲染 75 页、零框架水合、SEO 友好 |
| 语言 | TypeScript strict（`astro/tsconfigs/strict`） | 全仓类型安全 |
| TypeScript 编译器 | side-by-side：根 `typescript@6.0.3`（供 eslint/typescript-eslint 子树）+ `typescript-v7` 别名（npm:typescript@7.0.2，`pnpm typecheck` 走它） | typescript-eslint 暂不支持 TS7，typecheck 经别名用 TS 7.0.2 |
| 样式方案 | 原生 CSS 单文件 `src/styles/global.css`（设计 token） | 零构建依赖；外链加载满足 CSP `style-src 'self'` |
| 计算引擎 | 51 个 TypeScript 纯函数模块（客户端执行） | 可单测、零依赖；如出现高精度需求再评估 decimal.js |
| 后端 | 无 | 纯静态；Next.js / Cloudflare Workers 方案已否决 |
| 数据库 | 无 | Supabase 方案已否决；无持久化需求 |
| 内容管线 | Astro Content Collections + `marked` + `isomorphic-dompurify`（构建期清洗） | Git-as-CMS，11 篇 markdown |
| 预打包 | esbuild 0.28（esm + code splitting → `public/scripts/`） | 绕过 Astro 7 内联脚本违反 CSP 的未修 bug |
| 缓存 | Cloudflare Pages 边缘缓存；`/_astro/*` 与 `/scripts/kit-*` 一年 immutable | 内容哈希文件名 |
| 部署 | Cloudflare Pages + wrangler 4（`pnpm deploy` = predeploy 守卫 → astro build → wrangler pages deploy） | 纯静态免费层托管；predeploy 拦截未配置域名 |
| 监控 | 未接入（规划 Sentry） | 无服务端，暂无错误上报位 |
| 分析 | 未接入（规划 GA4 + GSC） | 行业标准 |
| 搜索 | 静态索引 `search-index.json` + 客户端过滤（Meilisearch 仍为 deferred） | 51 个工具规模不需要独立搜索服务 |
| 测试 | Vitest 5（54 文件 272 用例，含 Astro container API 组件测试） | 单元 + 组件渲染断言 |
| Lint / 格式化 | ESLint 10 flat config（typescript-eslint 8 + eslint-plugin-astro 3，`no-explicit-any = error`）+ Prettier | 质量卡口 |
| 包管理 | pnpm 11（CI 同版本） | 注意 Corepack shim 可能报「假绿」版本号，本机以 `/usr/bin/pnpm` 为准 |

## Deferred 项说明

以下项目暂不接入，出现对应需求后重新评估：

- **Meilisearch 站内搜索**：当前由构建期生成的静态搜索索引 + 客户端过滤满足。
- **decimal.js 高精度**：引擎统一走 `_shared.ts` 数值校验（上限 1e12 / 6 位小数），金融计算场景暂未触及浮点精度问题。
- **Sentry / GA4**：规划项，待正式域名上线后接入。

## 后端类方案否决说明

Next.js / Vercel、Supabase（Postgres）、Cloudflare Workers（轻 API）方案已在架构定稿时全部否决（见 `adr/0004-astro7-cloudflare-pages.md`）：内容站 + 纯前端计算形态下，引入服务端只增加成本与攻击面，无对应收益。

## 备选对比（仅技术评审参考）

| 备选方案 | 优势 | 劣势 |
|---|---|---|
| Astro 7 + Cloudflare Pages（现行） | 极致静态性能、CSP 可收紧到 'self' | Astro 7 内联脚本 bug 需 esbuild 预打包 workaround |
| Next.js 14 + Vercel | 动态能力强 | 水合开销大、CSP 难收紧、成本高 |
| 纯静态 HTML | 简单 | 75 页无法模板化维护 |

---

## 修订记录

- 2026-09-20 v1.2.0：补齐实际版本号（Astro 7.3.3 / TS 6.0.3+7.0.2 side-by-side / Vitest 5 / ESLint 10 / wrangler 4 / pnpm 11）；部署定稿为 Cloudflare Pages + wrangler 4；标注后端类方案已否决（非 deferred）。
- 2025-01-01 v1.1.0：技术栈全面更新为 Astro + TypeScript；Supabase / Cloudflare Workers / Meilisearch 标记 deferred（依据：`remediate-foundation/spec.md` MODIFIED Requirement "技术栈一致性" 与 "MVP 阶段接入站内搜索引擎" + `docs/ux-tech-review.md` 冲突 C-05）。理由：原 Next.js 14 + Tailwind + shadcn/ui 与已批准的 Astro 方案冲突；3 项 deferred 服务无对应 MVP 需求。
