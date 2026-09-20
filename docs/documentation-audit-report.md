---
project: calculator-site
doc_id: docs/documentation-audit-report
type: audit-report
locale: zh-CN
version: v1.0
status: final
audit_date: 2026-09-20
owner: 项目经理
---

# 文档体系全面审计报告（2026-09-20）

## 一、结论（先行）

文档体系总体骨架完整（150+ 份 Markdown，覆盖需求/技术/PM/测试/SEO/运维六域），但存在**三类系统性问题**：

1. **技术文档严重过时**：`knowledge-base/05-technical/` 下 6 份文档仍停留在被否决的 Next.js + Vercel + Supabase 方案，与实际 Astro 7 + Cloudflare Pages 静态站严重脱节（P0）。
2. **PM 登记册从未更新**：`knowledge-base/01-project-management/` 下 6 份登记册 `last_updated` 均为 2025-01-01、状态均为 draft，项目 9 个月的实际进展（含已关闭的重大风险）零登记（P0）。
3. **数字快照过时**：主追踪文档记录测试 271 例，实际 272/272 全过（P1）。

**无问题确认**：CHANGELOG v0.1.0 覆盖完整；AI-IMPROVEMENT-PROMPT.md 任务勾选与 git 记录一致；法务 P1-10 提交链条完整（双签编号 DS-202609-08，截止 2026-09-26）；50 个计算器页面与清单 v2 完全吻合（实测 50/50）。

## 二、背景与假设

- 审计基准：git main 分支 `ef65004`（2026-09-20），工作区干净。
- 实测基准：61 个 astro 页面（含 50 个计算器页）、54 个测试文件 272 用例全过、JS bundle 65.97KB（上限 65KB 软限）、sitemap 75 页。
- 审计方法：三路并行探查（需求类 / 技术类 / 进度与 PM 类）+ 本地基准核实。
- 假设：本站为纯静态站，无后端 API，"API 文档"按工具/脚本约定文档口径评估。

## 三、逐类审计发现

### 3.1 需求文档（完整性：清单级 100%，规格级 6%）

| 发现 | 证据 | 评级 |
|---|---|---|
| 47/50 个计算器缺少单页详细需求文档，仅 3 份（finance-mortgage / finance-tax / health-bmi） | `knowledge-base/02-product-requirements/requirements/` 仅 3 文件 | 缺失 P1 |
| `calculator-list.md`（v1，15 工具）与 v2 并存，未标注废弃 | v1 L14-35 vs v2 L117-124（37 approved/10 merged/1 deferred/3 rejected） | 不一致 P1 |
| 50 计算器页面与清单 v2 完全吻合 | 实测 finance 16 / investment 10 / health 5 / math 5 / daily 4 / efficiency 4 / renovation 4 / unit 2 = 50 | ✅ 无问题 |
| tier1-tier4 规格排期（Tier 1 截止 10-03，Tier 5 截止 11-28）仍有效 | `.trae/specs/strategy-50-calculators/schedule.md` | ✅ 无问题 |

### 3.2 技术规格与 API 文档（过时重灾区）

| 发现 | 证据 | 评级 |
|---|---|---|
| architecture.md 仍画 Next.js/Vercel/Cloudflare Workers/Supabase 架构 | `05-technical/architecture.md` L16-47 | 过时 P0 |
| deployment.md 仍写 `next build` | `05-technical/deployment.md` L25-38 | 过时 P0 |
| repo-structure.md 按 Next.js App Router 组织（`app/`、`workers/`） | `05-technical/repo-structure.md` L16-75 | 过时 P0 |
| ADR-0001 记录框架决策为 Next.js 14（实际已切 Astro 7）；ADR-0002 记录 Vercel+Supabase（实际 Cloudflare Pages，无后端） | `adr/0001-framework.md`、`adr/0002-hosting.md` | 过时 P0（应补「已否决/已变更」标记 + 新 ADR） |
| tech-stack.md 无实际版本号（Astro ^7.3.3、TS 6.0.3+7.0.2 双轨、ESLint 10、Vitest 5、wrangler 4） | `05-technical/tech-stack.md` L14-29 | 需更新 P1 |
| performance-budget.md 首屏 JS 上限写 100KB，实际门禁 65KB 软限 | `05-technical/performance-budget.md` L36-43 | 不一致 P1 |
| ADR-0003（Git-as-CMS，不引 Headless CMS）与现状一致 | `adr/0003-cms.md` | ✅ 无问题 |
| 无独立 API 文档；mcp-manual/ 11 份工具手册 + mcp-config/ 权限模型承担了工具链约定职责，但**构建脚本约定**（build-public-scripts.mjs、kit-* chunk 策略）无文档 | 全库检索 | 缺失 P2 |

### 3.3 进度报告与 PM 文档（时效性：两极分化）

| 发现 | 证据 | 评级 |
|---|---|---|
| AI-IMPROVEMENT-PROMPT.md 记录「vitest 271 用例」「271/271」，实测 272/272（54 文件全过） | L39、L99 | 过时 P1 |
| risk-register/issue-register/decision-log/change-log/milestone-roadmap/project-charter 全部 `last_updated: 2025-01-01`、`status: draft` | front-matter 逐文件核实 | 过时 P0 |
| issue-register 为空表，但近期已修复的 6+ 项问题（Corepack shim 假绿、sitemap 含法务页、anchor 死链等）均未登记 | `01-project-management/issue-register.md` | 缺失 P1 |
| risk-register 有 14 条风险条目，但 P1-10 法务复核、Astro v4 兼容坑等新风险未入册 | `risk-register.md` | 需更新 P1 |
| CHANGELOG v0.1.0（2026-09-20）覆盖 JSON-LD/RSS/404/manifest/CSP/法务三页/质量工具链，与 git 一致 | `CHANGELOG.md` L29-43 | ✅ 无问题 |
| 法务链条完整：DS-202609-08 双签登记 → 提交清单 v1.0（7 文件/MD5）→ 提交通知，截止 2026-09-26 | `docs/legal-review/` | ✅ 无问题 |
| a11y 报告日期 2026-09-19，早于 9-20 的 smoke 断言 11 专项，未回填 | `docs/reports/a11y-report-redesign.md` | 需更新 P2 |

### 3.4 用户手册 / 用户侧文档

| 发现 | 证据 | 评级 |
|---|---|---|
| 无任何面向最终用户的帮助中心/使用手册文档（站点已上线 50 工具 + 搜索页） | 全库检索「用户手册/使用手册/帮助中心」零命中 | 缺失 P2（MVP 后补齐即可，站点页内 FAQ 已部分承担） |

## 四、优先级汇总

| 级别 | 事项 | 建议工时 |
|---|---|---|
| **P0（本周）** | ① 重写 architecture.md / deployment.md / repo-structure.md 为 Astro 实际架构；② ADR-0001/0002 追加「Superseded」状态 + 补 ADR-0004（Astro 7 + CF Pages）决策记录；③ 6 份 PM 登记册完成首次真实回填（风险、议题、决策、里程碑进度） | 8–12h |
| **P1（下周）** | ④ calculator-list.md v1 标注废弃并指向 v2；⑤ tech-stack.md 补版本号、performance-budget.md 对齐 65KB；⑥ issue-register 补登记近期 6+ 已解决问题（沉淀经验）；⑦ 主追踪文档测试数 271→272 | 6–8h |
| **P2（两周内）** | ⑧ 新增《构建脚本与共享 chunk 约定》文档（kit-* 缓存策略、bundle 门禁）；⑨ a11y 报告回填 9-20 专项结果；⑩ 规划用户帮助中心首批 10 篇（对应 Tier 1 高流量工具） | 10–14h |
| P3 | 47 份单计算器详细需求文档按流量优先级分批补齐（每补一个新计算器时顺手产出，不专项冲刺） | 持续 |

## 五、风险与说明

- **风险 1**：技术文档误导。新人/AI 协作若按 architecture.md 理解会引入 Next.js 方案，造成返工。→ P0 立即修复。
- **风险 2**：PM 登记册空转导致决策无据可查（如「为何放弃 Next.js」只在 memory/会话中）。→ P0 回填。
- **风险 3**：47 份需求文档缺口。假设：list-v2 清单级规格 + calculator-template.md 模板 + 既有 3 份样板足以支撑近期开发，故列 P3 分批补齐；若法务复核要求 YMYL 类逐个出规格，则提级到 P1。
- 假设声明：测试数 271→272 差异来自 a11y 专项后新增用例，属正常演进，非数据错误。

## 六、下一步行动（可立即执行）

1. 重写 `05-technical/` 三份核心文档 + 补 ADR-0004（建议本会话直接执行，产出可验证）。
2. PM 六册首次真实回填：至少登记 5 条已关闭风险、6 条已解决问题、当前里程碑进度（14 阶段中处于阶段 9-10 之间）。
3. `calculator-list.md` 顶部加废弃横幅；主追踪文档测试数改 272 并注明口径（`pnpm test:run`）。
4. 法务侧：跟踪 DS-202609-08 反馈（截止 2026-09-26），期间不动 legal 三页。
5. 决策点请确认：47 份需求文档是按 P3 分批，还是因 YMYL 合规要求提级 P1？

---

审计执行：PM（本文档）；基准核实：git log + vitest 实跑 272/272 + 页面数实测；辅助探查：3 路文档扫描。
