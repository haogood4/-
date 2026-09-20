---
project: calculator-site
doc_id: docs/manual-pending-items
type: manual-todo-registry
locale: zh-CN
version: v1.1
status: active
created: 2026-09-20
last_updated: 2026-09-20
owner: 项目经理（人工执行）
review_cycle: 每周复核
---

# 需人工干预事项清单（AI 不擅自执行）

> 登记规则：凡涉及**成本支出、外部账号/凭据、法务合规、隐私决策**的操作，AI 一律登记于此待人工执行，每项含操作步骤与阻塞影响。状态：⏳ 待办 / ✅ 完成 / ❌ 已裁决不做。

## 当前待办

| # | 事项 | 类别 | 操作步骤 | 阻塞影响 | 建议时限 | 状态 |
|---|---|---|---|---|---|---|
| M-01 | 法务审核 legal 三页（P1-10，双签编号 DS-202609-08，7 文件资料包已提交） | 法务合规 | 法务部门审核 → 通过后：①移除三页 noindex ②补全第三方服务清单与联系方式 ③去掉 astro.config.mjs sitemap filter 中 `/legal/` 排除 ④smoke 页数断言同步 | legal 页保持 noindex 草稿（带水印），不能对外宣称已合规；阻塞正式上线 | 2026-09-26（双签截止） | ⏳ |
| M-02 | GitHub 推送与 CI 首跑 | 外部凭据 | `git remote add origin <repo-url> && git push -u origin main`；确认 Actions 首跑全绿 | CI 防护网未生效，本地改动无远程备份 | 本周 | ✅ 推送 / ⏳ CI 首跑 |
| M-03 | 域名购买与 DNS 配置 | 成本支出 | 购买域名 → Cloudflare 托管 → `export PUBLIC_SITE_URL=https://<正式域名>` 后执行 `pnpm deploy`；predeploy 守卫会拦截占位符 | 阻塞部署与上线（当前 site 为占位符 example-calculator.cn） | 上线前 | ⏳ |
| M-04 | Cloudflare Pages 项目创建 | 外部账号 | `wrangler login`（或配 API Token）→ 首次 `pnpm deploy` 创建 project calculator-site | 阻塞部署 | 上线前 | ⏳ |
| M-05 | 暗色模式二期手动开关方案批复（P1-7②） | 设计决策 | 评估 localStorage + 外置 theme-init.js 的 FOUC 窗口接受度（不能内联脚本，违反 CSP）；批复后 AI 可实现（按钮 ≥44px、aria-pressed、可覆盖系统偏好） | 非上线阻塞，仅体验项 | 择机 | ⏳ |
| M-06 | 第三方统计脚本接入决策（GA4/Sentry） | 隐私决策 | 选择工具 → 评估与 CSP/隐私政策一致性 → 提供度量 ID 后 AI 可接线（负面清单规定统计脚本决策留人工） | 数据驱动运营无法启动；非上线阻塞 | 上线后首周 | ⏳ |
| M-07 | GSC 域名验证与 sitemap 提交 | 外部账号 | 域名 M-03 完成后：Search Console 验证 → 提交 sitemap.xml → 监控收录 | SEO 收录启动依赖项 | 上线后首周 | ⏳ |
| M-08 | 47/50 计算器单页详细需求文档补齐策略裁决 | 项目决策 | 决策：a) 按 P3 随迭代分批补（推荐）或 b) 因 YMYL 合规提级 P1 专项补齐 | 影响文档工作量排期；不阻塞开发（清单级规格+模板已够用） | 本月 | ⏳ |

## 已完成（记录存档）

| # | 事项 | 完成日期 | 备注 |
|---|---|---|---|
| M-00 | Git 仓库本地初始化（main 分支） | 2026-09-20 | 后续推送见 M-02 |
| M-02a | 推送至 `git@github.com:haogood4/-.git`（main 分支，10 个提交，HEAD=262d901） | 2026-09-20 | SSH 推送（密钥已认证）；CI 首跑仍待用户在 GitHub Actions 中确认（M-02b） |

## 关联文档

- 主任务追踪：[AI-IMPROVEMENT-PROMPT.md](../AI-IMPROVEMENT-PROMPT.md)（P1-7②、P1-10）
- 部署清单：[pre-deploy-checklist.md](pre-deploy-checklist.md)
- 双签流程：[policy-verifications/dual-sign-todo.md](policy-verifications/dual-sign-todo.md)
- 提交清单：[legal-review/P1-10_DS-202609-08_提交清单_v1.0_20260920.md](legal-review/P1-10_DS-202609-08_提交清单_v1.0_20260920.md)
