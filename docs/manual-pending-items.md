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
| M-01 | 法务审核 legal 三页（P1-10，双签编号 DS-202609-08，7 文件资料包已提交） | 法务合规 | 法务部门审核 → 通过后执行 `node scripts/migrate-legal-to-production.mjs --execute`（自动备份到 `.tmp-legal-backup/` 并改 5 文件 / 15 处：移除三页 `noindex` prop + 草稿横幅 + 站点配置 sitemap filter `/legal/` 排除 + footer 注释 + 双签编号记入页面）；随后 `pnpm verify:dist` + git commit 推送 | legal 页保持 noindex 草稿（带水印），不能对外宣称已合规；阻塞正式上线 | 2026-09-26（双签截止） | ✅ 切换已执行（决策提前推进）/ ⏳ 法务反馈 |
| M-01b | 项目负责人按 [docs/legal-submission-ready-pack.md](legal-submission-ready-pack.md) 手动转发法务部（替换占位符 → 复制邮件/飞书模板 → 发送 → 回填 dual-sign-todo） | 外部通讯 | 5 步自检 → 3 场景模板选一 → 发送 → 反馈回填；AI **不**代发任何邮件/飞书/微信 | 法务部未实际收到资料包前无法正式流转 DS-202609-08 | 2026-09-20 当日 | ⏳ |
| M-02 | GitHub 推送与 CI 首跑 | 外部凭据 | `git remote add origin <repo-url> && git push -u origin main`；确认 Actions 首跑全绿 | CI 防护网未生效，本地改动无远程备份 | 本周 | ✅ 推送 ✅ |
| M-02b | CI 首跑确认（GitHub Actions → workflow `CI` 跑完，失败则把日志发回） | 外部验证 | 用户在 Actions tab 核验 → 反馈结果 → 若失败 AI 排查 | CI 防护网未生效 | 本周 | ✅ 全绿 |
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
| M-02b | CI 首跑全绿（用户确认 `CI` workflow 全 5 步通过：Install/Verify/Build/Smoke/Assert） | 2026-09-20 | 远程回归网生效，后续 push/PR 自动触发 |
| M-01a | 法务切换落地（`migrate-legal-to-production.mjs --execute`）：5 文件 / 15 处修改；verify:dist 全绿（SMOKE 12/12）；sitemap 新增 legal 三页；commit `90eb9e1` 已推送 | 2026-09-20 | 备份存 `.tmp-legal-backup/`（gitignore 已加），回滚命令：`cp -r .tmp-legal-backup/* .` |

## 关联文档

- 主任务追踪：[AI-IMPROVEMENT-PROMPT.md](../AI-IMPROVEMENT-PROMPT.md)（P1-7②、P1-10）
- 部署清单：[pre-deploy-checklist.md](pre-deploy-checklist.md)
- 双签流程：[policy-verifications/dual-sign-todo.md](policy-verifications/dual-sign-todo.md)
- 提交清单：[legal-review/P1-10_DS-202609-08_提交清单_v1.0_20260920.md](legal-review/P1-10_DS-202609-08_提交清单_v1.0_20260920.md)
