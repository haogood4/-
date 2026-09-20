---
project: calculator-site
doc_id: tech/deployment
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 部署流程

## 环境

| 环境 | 地址 | 部署方式 |
|---|---|---|
| 本地 | localhost:4321 | `pnpm dev` |
| Preview | Cloudflare Pages 按分支自动生成预览部署 | push 非生产分支 / PR |
| Production | 正式域名（未购，暂为占位符） | `pnpm deploy`（手动触发） |

> **域名尚未购买**：`PUBLIC_SITE_URL` 默认占位符 `https://example-calculator.cn`。`predeploy` 守卫（`scripts/check-site-url.mjs`）会拦截占位 / 本地 / 保留字域名，购入域名并在 Cloudflare Pages 环境变量（或本地 export）设置正式 `PUBLIC_SITE_URL` 之前无法完成部署。

## 部署命令（pnpm deploy）

```bash
pnpm deploy
```

实际链路（package.json `deploy` script）：

```
predeploy
  ├─ node scripts/check-site-url.mjs   # 校验 PUBLIC_SITE_URL：已设置、https、非占位/本地、无 test/staging/dev 保留字
  └─ pnpm verify                       # typecheck + lint + test:run + format:check + mcp:check + bundle:check
astro build                            # 先跑 build-public-scripts.mjs 预打包，再构建 75 页
wrangler pages deploy dist --project-name calculator-site
```

产物为纯静态文件（无服务端函数）。`astro.config.mjs` 从 `PUBLIC_SITE_URL` 读取站点 URL，用于 sitemap / canonical / RSS 域名；该变量也可直接在 Cloudflare Pages 项目环境变量中配置。

## CI（.github/workflows/ci.yml）

```
push / PR → main
  ├─ Node 22 + pnpm 11（pnpm/action-setup@v4，--frozen-lockfile 安装）
  ├─ pnpm verify        # typecheck（TS 7.0.2）+ eslint + Vitest 272 用例 + prettier + mcp:check + bundle:check
  ├─ pnpm build         # esbuild 预打包 + astro build（75 页）
  ├─ smoke-dist.mjs     # 12 组产物断言（页数=75、关键路由、CSP 红线、死链、a11y、JSON-LD、暗色等）
  └─ 断言 dist/ 中 sitemap-index.xml / robots.txt / manifest.json 存在
```

## 回滚

- Cloudflare Pages 控制台 → 对应 deployment → **Rollback**（或 `wrangler pages deployment rollback`）。
- 无数据库、无迁移，回滚即把流量切回历史静态产物，秒级生效。

## 上线检查清单

- [ ] 域名已购并绑定到 Cloudflare Pages 项目（自定义域 + HTTPS 证书生效）
- [ ] `PUBLIC_SITE_URL` 已设置为正式域名，`predeploy` 校验通过
- [ ] sitemap / canonical / RSS 均指向正式域名（构建期由站点 URL 决定，需用正式变量重新构建部署）
- [ ] robots.txt 正常，Search Console 提交 sitemap
- [ ] `public/_headers` 的 CSP 与全套安全头在生产域名下验证生效
- [ ] Service Worker（`/sw.js`）新版本可正常下发（no-cache 头生效）
- [ ] Lighthouse 关键页跑通：JS gzip ≈60KB、CSS gzip 6.4KB，均在预算内（详见 `performance-budget.md`）

---

## 修订记录

- 2026-09-20 v1.1.0：按实际实现全面重写——Vercel / Next.js / Supabase 方案已否决，改为 Cloudflare Pages + wrangler 4 的 `pnpm deploy` 管线与 predeploy 守卫。
