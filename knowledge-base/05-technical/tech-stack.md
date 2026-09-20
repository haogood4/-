---
project: calculator-site
doc_id: tech/stack
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 技术选型

| 类别 | 选型 | 理由 |
|---|---|---|
| 前端框架 | Astro + TypeScript（实施时受支持的版本） | 静态优先、SEO 友好、客户端 JS 可控 |
| 样式方案 | 待 UX 评估 + 你裁决（Tailwind / 原生 CSS Modules / 其他） | BLOCKED，详见 `docs/ux-tech-review.md` |
| 计算引擎 | TypeScript（客户端） + decimal.js（如需高精度） | MVP 首期 10 个计算器为纯前端计算 |
| 后端 | 无（MVP 阶段） | Supabase / Cloudflare Workers 已 deferred |
| 数据库 | 无（MVP 阶段） | Postgres / Supabase 已 deferred |
| 缓存 | CDN 边缘缓存（按目标市场选 Cloudflare / Vercel / 其他） | 取决于 `project-charter-inputs.md` 第 1 项决策 |
| 部署 | 平台原生 CI/CD（如选 Cloudflare Pages 则用 Cloudflare 构建） | 与托管平台绑定 |
| 监控 | Sentry | 错误捕获 |
| 分析 | GA4 + GSC | 行业标准 |
| 搜索 | 静态 JSON 索引 + 客户端过滤（Meilisearch 已 deferred） | 10 个工具规模不需要独立搜索服务 |
| 测试 | Vitest + Playwright | 单元 + E2E |
| Lint | ESLint + Prettier + TypeScript strict | 质量保障 |

## Deferred 项说明

以下项目在 MVP 阶段不接入，标注 deferred，需重新评估后再启动：

- **Supabase（Postgres）**：首期 10 个计算器均为纯前端计算，无持久化需求；引入会带来运维、备份、合规成本而无对应收益。出现真实持久化需求（如用户收藏跨端同步）时重新评估。
- **Cloudflare Workers**：MVP 无后端需求。如需轻 API（如汇率拉取、个税规则同步）再评估。
- **Meilisearch 站内搜索**：10 个计算器检索需求可由静态 JSON 索引 + 客户端过滤满足。工具数 > 50 或出现长尾检索需求后重新评估。

## 备选对比（仅技术评审参考）

| 备选方案 | 优势 | 劣势 |
|---|---|---|
| Astro + Cloudflare Pages | 更轻、SEO 极佳 | 首期纯前端计算场景下动态能力不构成限制 |
| Nuxt 3 | Vue 生态 | 团队不熟 |
| 纯静态 HTML | 简单 | 无法 A/B |

---

## 修订记录

- 2025-01-01 v1.1.0：技术栈全面更新为 Astro + TypeScript；Supabase / Cloudflare Workers / Meilisearch 标记 deferred（依据：`remediate-foundation/spec.md` MODIFIED Requirement "技术栈一致性" 与 "MVP 阶段接入站内搜索引擎" + `docs/ux-tech-review.md` 冲突 C-05）。理由：原 Next.js 14 + Tailwind + shadcn/ui 与已批准的 Astro 方案冲突；3 项 deferred 服务无对应 MVP 需求。