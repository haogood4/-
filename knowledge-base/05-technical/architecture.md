---
project: calculator-site
doc_id: tech/architecture
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 系统架构

```
                     ┌─────────────────────────┐
                     │       用户（移动 / Web）  │
                     └──────────────┬──────────┘
                                    │ HTTPS / CDN
                                    ▼
                       ┌────────────────────────┐
                       │   Cloudflare (CDN + WAF)│
                       └──────────────┬─────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │ Vercel (前端 SSR)│    │ Cloudflare Pages │    │ Cloudflare Worker │
   │ Next.js 14 App  │    │ 静态资源         │    │ 轻量 API        │
   └────────┬─────────┘    └──────────────────┘    └────────┬─────────┘
            │                                               │
            └───────────────────┬───────────────────────────┘
                                ▼
                    ┌──────────────────────┐
                    │  Supabase (Postgres) │
                    │ - 计算器配置          │
                    │ - 公式版本            │
                    │ - 测试数据            │
                    │ - 指标快照            │
                    └──────────────────────┘

外部服务：
- Sentry（错误监控）
- GA4 + GSC（流量与 SEO）
- Google AdSense（变现）
```

## 模块说明

| 模块 | 职责 |
|---|---|
| 前端（Next.js） | 渲染计算器页面、表单交互、Schema 输出 |
| 后端 API（Worker） | 计算代理、汇率拉取、表单防滥用 |
| 数据库（Supabase） | 存储计算器元数据、公式版本、用户偏好 |
| CDN（Cloudflare） | 静态资源、缓存、防护 |
| 监控（Sentry） | 错误、性能 |
| 分析（GA4 + GSC） | 用户行为与 SEO 数据 |

---