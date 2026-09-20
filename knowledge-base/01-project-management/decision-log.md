---
project: calculator-site
doc_id: pm/decision-log
type: decision
domain: project-management
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2025-01-01
owner: 项目经理
last_updated: 2026-09-20
---

# 决策日志 · Decision Log

> 永久追加的"为什么这么做"记录。
> 任何重大决策（技术选型、范围变更、公式变更、放弃功能）必须在此登记。

## 决策记录模板

| 字段 | 含义 |
|---|---|
| 日期 | YYYY-MM-DD |
| 决策编号 | DEC-YYYYMMDD-NNN |
| 决策事项 | 一句话 |
| 候选方案 | 列 2–4 个 |
| 最终决定 | 选哪个 |
| 决策原因 | 优劣势对比 |
| 影响范围 | 受影响的模块/团队 |
| 决策人 | 谁拍板 |
| 反悔成本 | 高/中/低 |

---

> 新增决策请复制本节"## DEC-..."格式追加到文件末尾，不要修改历史条目。

## DEC-20260920-001 前端框架定稿 Astro 7.3.3

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-001 |
| 决策事项 | 前端框架定稿为 Astro 7.3.3 静态输出 |
| 候选方案 | Astro 7 / Next.js |
| 最终决定 | Astro 7.3.3，纯静态输出（否决 Next.js） |
| 决策原因 | 内容型工具站零 JS 默认、构建期生成、CSP 友好；Next.js 运行时与水合成本高 |
| 影响范围 | 全站构建管线、页面模板、CI |
| 决策人 | 技术负责人 + PM |
| 反悔成本 | 高 |

> 详细论证见 ADR-0004。

## DEC-20260920-002 托管定稿 Cloudflare Pages + wrangler 4

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-002 |
| 决策事项 | 托管平台定稿 |
| 候选方案 | Cloudflare Pages / Vercel / Supabase |
| 最终决定 | Cloudflare Pages + wrangler 4 部署（否决 Vercel/Supabase） |
| 决策原因 | 边缘 CDN、免费额度充足、静态资产分发快；Vercel 成本与 Supabase 定位不符 |
| 影响范围 | 部署流程、域名、CI/CD |
| 决策人 | 技术负责人 + PM |
| 反悔成本 | 中 |

> 原 ADR-0002 的托管结论已被本决策取代，状态标记为 Superseded。

## DEC-20260920-003 TypeScript side-by-side 双轨策略

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-003 |
| 决策事项 | TypeScript 版本策略 |
| 候选方案 | 统一升级 / side-by-side 双轨 |
| 最终决定 | side-by-side：根 tsconfig 6.0.3 承担 lint，v7 别名承担 typecheck |
| 决策原因 | 规避一次性升级破坏面，lint 与 typecheck 职责分离，渐进迁移 |
| 影响范围 | 构建脚本、CI 校验链 |
| 决策人 | 技术负责人 |
| 反悔成本 | 低 |

## DEC-20260920-004 JS bundle 预算红线

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-004 |
| 决策事项 | JS bundle 体积预算 |
| 候选方案 | 无预算 / 单一硬限 / 软硬双线 |
| 最终决定 | 软红线 65KB、硬限 100KB；超软线需去重专项 |
| 决策原因 | 兼顾交互能力与 LCP/移动端体验，软线提前预警避免逼近硬限 |
| 影响范围 | 全站脚本、计算器实现、CI 体积检查 |
| 决策人 | 技术负责人 + PM |
| 反悔成本 | 中 |

## DEC-20260920-005 暗色模式一期方案

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-005 |
| 决策事项 | 暗色模式实现策略 |
| 候选方案 | 一期纯 CSS / 直接上手动开关 |
| 最终决定 | 一期纯 CSS `prefers-color-scheme`（零 JS、零 CSP 影响）；二期手动开关待人工批复 FOUC+CSP 方案 |
| 决策原因 | 零 JS 成本即覆盖系统级偏好；手动开关引入内联脚本与 FOUC 风险，需先评审 |
| 影响范围 | 全站样式、CSP 策略 |
| 决策人 | PM + 技术负责人 |
| 反悔成本 | 低 |

## DEC-20260920-006 sitemap 排除 noindex 页

| 字段 | 含义 |
|---|---|
| 日期 | 2026-09-20 |
| 决策编号 | DEC-20260920-006 |
| 决策事项 | sitemap 收录范围 |
| 候选方案 | 全量收录 / 排除 noindex 页 |
| 最终决定 | sitemap 排除所有 noindex 页（legal/、search/） |
| 决策原因 | noindex 页入 sitemap 与收录意图矛盾，浪费抓取预算并触发 Search Console 告警 |
| 影响范围 | astro.config.mjs、SEO 巡检 |
| 决策人 | SEO + 技术负责人 |
| 反悔成本 | 低 |