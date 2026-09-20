---
project: calculator-site
doc_id: tech/env
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 环境变量说明

> 所有环境变量在 Vercel / Cloudflare 后台管理；本地用 `.env.local`（不入 Git）。

## 必备变量

| 变量 | 说明 | 必需 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 站点正式 URL（用于 sitemap/canonical） | ✅ |
| `NEXT_PUBLIC_GA4_ID` | GA4 测量 ID | ✅ |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN（前端） | ✅ |
| `SUPABASE_URL` | Supabase URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase 匿名 Key（前端可读） | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase 服务 Key（仅服务端） | ✅ |
| `EXCHANGE_RATE_API_KEY` | 汇率 API Key | ❌（可选） |

## 安全规则

- 服务端 key 绝不出现在 `NEXT_PUBLIC_*`。
- Sentry / Supabase 服务 key 仅在 Serverless / Worker 中使用。
- 严禁把 key 写入代码、Markdown、聊天工具。

---