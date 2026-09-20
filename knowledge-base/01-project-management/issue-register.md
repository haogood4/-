---
project: calculator-site
doc_id: pm/issue-register
type: sop
domain: project-management
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2025-01-01
owner: 项目经理
last_updated: 2026-09-20
---

# 问题登记册 · Issue Register

> 用于追踪临时发现但尚未归类到 backlog 的问题。

| 日期 | 编号 | 描述 | 影响 | 状态 | 负责人 | 解决日期 |
|---|---|---|---|---|---|---|
| 2026-09-20 | ISS-001 | 本机 Corepack shim pnpm 静默 no-op 假绿 → 统一改用 /usr/bin/pnpm 且复合脚本加 PATH 前缀 | 构建脚本假成功，掩盖真实失败 | 已解决 | FE | 2026-09-20 |
| 2026-09-20 | ISS-002 | sitemap 误收 noindex 法务页 → astro.config.mjs filter 排除 legal/ 与 search/ | noindex 页被收录，SEO 合规风险 | 已解决 | SEO | 2026-09-20 |
| 2026-09-20 | ISS-003 | SiteFooter 三个 legal 链接死锚点 → 新建 src/pages/legal/ 三页骨架（noindex，P1-10 法务审核中） | 页脚链接点击 404 | 已解决 | FE | 2026-09-20 |
| 2026-09-20 | ISS-004 | 404 页缺 id="main" 致 skip-link 失效 → 已修 | a11y 键盘用户无法跳过导航 | 已解决 | FE | 2026-09-20 |
| 2026-09-20 | ISS-005 | 9 个页面脚本被 Astro 7 构建内联违反 CSP → esbuild 预打包管线（build-public-scripts.mjs）+ is:inline type=module 引用 | CSP 拦截脚本，交互失效 | 已解决 | FE | 2026-09-20 |
| 2026-09-20 | ISS-006 | IRR/年化收益率页主结果恒空（formatIrr 返回 string 误取 .value）→ 契约测试复现后修复 | 核心计算功能不可用 | 已解决 | QA | 2026-09-20 |
| 2026-09-20 | ISS-007 | 32 页 FAQ<3 条、5 个金融/健康页缺免责声明 → codemod fix-faq-disclaimer.mjs 补足并固化 smoke 断言 | SEO 质量与 YMYL 合规缺口 | 已解决 | SEO | 2026-09-20 |
| 2026-09-20 | ISS-008 | 33 页内链<3、32 页 title 同质化 → codemod fix-seo-links.mjs，复检 51/51 通过 | 内链与标题质量拖累 SEO 评分 | 已解决 | SEO | 2026-09-20 |

---

## 流程

1. 发现人通过 GitHub Issue 创建，标签 `bug` / `content` / `infra` / `risk`。
2. 由 PM 在每周一站会分类到：bug / 需求 / 风险。
3. 重要问题（影响上线或合规）升级到 `risk-register.md`。
---