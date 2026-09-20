---
project: calculator-site
doc_id: tech/third-party
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 第三方服务清单

| 服务 | 用途 | 账号 | 计费 | 状态 |
|---|---|---|---|---|
| Cloudflare Pages | 静态托管 + CDN + 安全头（`_headers`） | team@example.com | 免费层 | ✅ 已接入 |
| wrangler CLI（npm 依赖） | Pages 部署（`pnpm deploy`），非独立 SaaS | — | — | ✅ 已接入 |
| GitHub Actions | CI：verify + build + smoke 断言 | 同上 | 免费额度 | ✅ 已接入 |
| Google Search Console | SEO 数据 | 同上 | 免费 | 未接入（正式域名上线后） |
| GA4 | 流量分析 | 同上 | 免费 | 未接入（规划） |
| Sentry | 错误监控 | 同上 | 免费层 | 未接入（规划） |
| Google AdSense | 变现（页面已预留 AdContainer） | 同上 | 分成 | 未接入（规划） |

> 已移除条目：Vercel（托管方案否决）、Supabase（数据库方案否决）、exchangerate-api.com（汇率换算为纯前端静态数据，无外部 API）。纯静态架构下新增任何需要私密 key 的服务前必须先过架构评审。

## 选型原则

- 优先使用"免费层够用"的服务。
- 任何新增第三方必须经 PO + 技术负责人双签字。
- 所有服务必须有退出方案。

---