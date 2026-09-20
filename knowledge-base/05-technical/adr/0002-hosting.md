# ADR-0002 · 托管平台选型

- 状态：已采纳
- 日期：2025-01-01

## 决定

- 主：Vercel（前）
- CDN / WAF：Cloudflare
- 数据库：Supabase

## 理由

- Vercel 对 Next.js 一等支持，零配置。
- Cloudflare 提供全球 CDN、DDoS 防护与 Worker 边缘计算。
- Supabase 免费层满足 MVP，可平滑升级到 Pro。

---