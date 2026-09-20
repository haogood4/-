---
project: calculator-site
doc_id: tech/env
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 环境变量说明

> 纯静态架构，当前仅一个环境变量；无后端、无数据库，**无任何密钥类配置**。本地在 shell 中 export（或 `.env`，不入 Git）；生产在 Cloudflare Pages 项目环境变量中配置。

## 变量表

| 变量 | 说明 | 必需 |
|---|---|---|
| `PUBLIC_SITE_URL` | 站点正式 URL。`astro.config.mjs` 读取用于 sitemap / canonical / RSS；`scripts/check-site-url.mjs` 在部署前校验（必须 https、非占位/本地域名）。默认占位符 `https://example-calculator.cn` | ✅（部署时必需） |

GA4 / Sentry / Supabase / 汇率 API 等变量均已随方案否决或暂未接入；如未来接入需补充本表。

## 安全规则

- 严禁把 key 写入代码、Markdown、聊天工具。
- 纯静态架构无服务端私密配置位：任何需要私密 key 的第三方服务都意味着引入服务端组件，须先通过架构评审（见 `adr/0004-astro7-cloudflare-pages.md`）。

---
