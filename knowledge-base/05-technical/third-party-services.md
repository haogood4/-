---
project: calculator-site
doc_id: tech/third-party
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 第三方服务清单

| 服务 | 用途 | 账号 | 计费 | 替代方案 |
|---|---|---|---|---|
| Vercel | 前端托管 | team@example.com | 免费层 + 流量计费 | Cloudflare Pages |
| Cloudflare | CDN + DNS + WAF | 同上 | 免费层 | — |
| Supabase | 数据库 | 同上 | 免费层 | Neon / PlanetScale |
| Sentry | 错误监控 | 同上 | 免费层 | GlitchTip |
| GA4 | 流量分析 | 同上 | 免费 | Plausible（自托管） |
| Google Search Console | SEO 数据 | 同上 | 免费 | Bing Webmaster |
| Google AdSense | 变现 | 同上 | 分成 | 联盟营销 |
| exchangerate-api.com | 汇率 | 同上 | 免费层 | open.er-api.com |

## 选型原则

- 优先使用"免费层够用"的服务。
- 任何新增第三方必须经 PO + 技术负责人双签字。
- 所有服务必须有退出方案。

---