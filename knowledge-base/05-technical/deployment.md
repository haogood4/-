---
project: calculator-site
doc_id: tech/deployment
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 部署流程

## 环境

| 环境 | 域名 | 部署方式 |
|---|---|---|
| 本地 | localhost:3000 | `pnpm dev` |
| Preview | pr-{n}.example.com | Vercel 自动 |
| Staging | staging.example.com | push develop 自动 |
| Production | example.com | 手动 + main tag |

## 流水线（GitHub Actions）

```
push / PR
  ├─ lint (eslint)
  ├─ typecheck (tsc)
  ├─ test (vitest)
  ├─ e2e (playwright)
  └─ build (next build)

通过 → Vercel 预览
push main → staging
release tag → production (manual approval)
```

## 回滚

```bash
# Vercel
vercel rollback

# 数据库（Supabase）
supabase db reset --linked
```

## 上线检查清单

- [ ] 数据库迁移已应用
- [ ] Sentry DSN 已注入
- [ ] GA4 ID 已注入
- [ ] Sitemap 已更新
- [ ] Search Console 提交新版 sitemap
- [ ] robots.txt 正常
- [ ] 关键页面 Lighthouse 跑通
- [ ] 灰度 5% → 25% → 100%

---