# ADR-0002 · 托管平台选型

- 状态：Superseded —— 已被 ADR-0004（Astro 7 静态架构 + Cloudflare Pages）取代
- 日期：2025-01-01

> 说明：本 ADR 决策（Vercel + Supabase）已废弃，仅作历史记录保留；现行决策见 `0004-astro7-cloudflare-pages.md`。

## 决定

- 主：Vercel（前）
- CDN / WAF：Cloudflare
- 数据库：Supabase

## 理由

- Vercel 对 Next.js 一等支持，零配置。
- Cloudflare 提供全球 CDN、DDoS 防护与 Worker 边缘计算。
- Supabase 免费层满足 MVP，可平滑升级到 Pro。

---