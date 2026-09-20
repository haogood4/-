---
project: calculator-site
doc_id: docs/project-plan
type: plan
domain: governance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 项目经理（你）
last_updated: 2025-01-01
---

# 项目整体开发计划（PM 总览）

## 0. 范围限定

本计划是 PM 的**总览文档**，只聚合并引用既有 spec / docs 文件的产出。**不替代**以下任一规格的定义：

- `.trae/specs/remediate-foundation/` — 代码层与工程基线
- `.trae/specs/docs-and-team-setup/` — 治理层文档（本计划所属 spec）
- 未来 UX 评估 spec — 设计可行性（已并入 `docs-and-team-setup` 的 Requirement 7–9 / Task 8–10，产出 `docs/ux-tech-review.md` / `docs/design-system.md` / `docs/ux-test-strategy.md`）

任何与既有 spec 冲突的内容，**以既有 spec 为准**；发现冲突时，回到对应 spec 修改，不在本计划二次编辑。

---

## 0.1 关联文档一览表

| 文件 | 一句话职责 |
|---|---|
| `.trae/specs/remediate-foundation/spec.md` | 代码实现与工程基线（Astro + TypeScript、计算器样板、撤销虚假可信度） |
| `.trae/specs/docs-and-team-setup/spec.md` | 治理层文档的规格来源（6 份 docs + 1 份 CSV + 1 份聚合计划） |
| `docs/project-charter-inputs.md` | 8 项必填决策的输入表 |
| `docs/team-jds.md` | 6 名数字员工的 JD 与协作接口 |
| `docs/collab-board.md` | 看板、任务命名规范、沟通节奏、负载保护 |
| `docs/revenue-model.md` | 盈亏平衡公式、行业参考区间、广告位骨架 |
| `docs/incident-runbook.md` | 风险分级、应急流程、回滚演练、业务连续性 |
| `docs/launch-checklist.md` | 10 阶段验收、交付物清单、上线后运维 |
| `knowledge-base/05-technical/tech-stack.md` | 技术栈与备选对比 |
| `knowledge-base/05-technical/performance-budget.md` | 性能预算与 Core Web Vitals |

---

## 第 1 章 项目背景与目标

**1.1 背景**

本项目定位为**中文工具类计算器网站**，核心特性：

- **移动端优先**：首屏布局、信息架构、交互控件全部以 320–480px 宽度为基线
- **无账号、无后端持久化**：MVP 阶段不接入数据库、不要求用户注册；计算在浏览器内完成，输入值不上传
- **自然搜索获客**：每个计算器页面对应独立 SEO 关键词；首屏无干扰计算的展示广告
- **不干扰计算的展示广告变现**：移动端与桌面端各预留 1 个固定尺寸广告位；广告加载失败不阻塞计算、复制、分享
- **6 名数字员工 + 你**：产品 / UX / 前端 / 计算平台 / QA / SEO 内容共 6 名数字员工承担执行，你负责最终审批、范围裁决与外部沟通

**1.2 目标**

| 目标 | 描述 | 当前状态 |
|---|---|---|
| MVP 上线 | 至少 1 个计算器（百分比）端到端可用 + 通过 10 阶段验收 | 依赖 `remediate-foundation` Task 6–10 全部完成 |
| SEO 基线 | 首批 10 个计算器全部可被 GSC 收录且 0 错误 | `BLOCKED: true`（需 GSC 验证账号 + 域名就位） |
| 性能基线 | LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤ 0.1（第 75 百分位） | 实验室口径已在 `performance-budget.md` 量化；线上口径 `BLOCKED: true`（需真实流量样本） |
| 上线里程碑 | 启动日 / 最晚上线日 | `BLOCKED: true`（等你提供，见 `project-charter-inputs.md` 第 4、5 项） |
| 盈亏平衡 | 达到月度运营预算覆盖 | `BLOCKED: true`（公式见 `revenue-model.md`；需真实 RPM 数据回填） |

**1.3 与既有 spec 的引用**

- 背景与定位 → `knowledge-base/01-project-management/project-charter.md`
- 变现模型 → `docs/revenue-model.md`
- 性能预算 → `knowledge-base/05-technical/performance-budget.md`

---

## 第 2 章 功能需求分析

本章 4 项功能逐项独立成节，**纳入阶段字段由你裁决**，AI 不替代。每节固定 7 字段，初始 `纳入阶段` 均为 `待你决定 BLOCKED: true`。

### 2.1 FN-001 基础计算

- **需求编号**：FN-001
- **功能简述**：以百分比计算器（求百分数 / 占比 / 变化率）为锚点，覆盖首批 10 个高频日常与数学计算器（详见 `knowledge-base/02-product-requirements/calculator-list.md` 与 `remediate-foundation` Task 18）
- **输入字段与校验**：各计算器按各自 PRD；通用校验为空值、非法字符、NaN / Infinity、负数
- **计算或交互规则**：纯浏览器端计算；内部不提前舍入；展示层 round-half-up 保留 6 位有效数字
- **输出**：主结果 + 公式代入过程 + 复制 / 分享按钮
- **对应计算器 ID**：`percentage`（已规划）+ 待定的 9 个（参考 `calculator-list.md`）
- **AI 建议**：MVP 必选；理由是首期 10 个工具中至少 6 个属"基础计算"类
- **纳入阶段**：待你决定 `BLOCKED: true`

### 2.2 FN-002 科学计算

- **需求编号**：FN-002
- **功能简述**：待你决定计算范围 — 是基础算术（含括号与优先级）、函数（三角 / 对数 / 指数）、单位换算、进制转换之一还是组合
- **输入字段与校验**：待你决定
- **计算或交互规则**：待你决定（如选择基础算术，需要决定是否支持 `^`、百分号、`e` 等特殊符号）
- **输出**：待你决定
- **对应计算器 ID**：待规划
- **AI 建议**：`纳入阶段: 待你决定`；AI 倾向 `延后` 但不替代你裁决
- **纳入阶段**：待你决定 `BLOCKED: true`

### 2.3 FN-003 历史记录

- **需求编号**：FN-003
- **功能简述**：待你决定存储位置（LocalStorage / IndexedDB / 远端 API / 不做）与可见范围（仅当前设备 / 跨设备同步）
- **输入字段与校验**：待你决定
- **计算或交互规则**：待你决定（如选择 LocalStorage，需要决定保留上限、是否暴露清除按钮、是否加密）
- **输出**：历史列表（条目数、字段、排序方式）
- **对应计算器 ID**：跨计算器通用能力，无单一 ID
- **AI 建议**：`纳入阶段: 待你决定`；AI 倾向 `延后` 但不替代你裁决（与"不收集用户计算输入"产品定位存在张力）
- **纳入阶段**：待你决定 `BLOCKED: true`

### 2.4 FN-004 主题切换

- **需求编号**：FN-004
- **功能简述**：待你决定主题维度（仅配色 / 含字号 / 含布局 / 含品牌色）与持久化范围（系统偏好 / 用户选择 / 不持久化）
- **输入字段与校验**：待你决定
- **计算或交互规则**：待你决定（如选择多主题，需决定切换动画、过渡时长、是否在切换瞬间产生 CLS）
- **输出**：主题选择器 UI
- **对应计算器 ID**：跨计算器通用能力，无单一 ID
- **AI 建议**：`纳入阶段: 待你决定`；AI 倾向 `延后` 但不替代你裁决（dark mode 对 SEO 与品牌识别收益不显著）
- **纳入阶段**：待你决定 `BLOCKED: true`

---

## 第 3 章 技术栈选型

**本章以最新 `.trae/specs/remediate-foundation/` 为准，本节不二次编辑技术栈文档。**

**3.1 已确定**

| 类别 | 选型 | 出处 |
|---|---|---|
| 前端框架 | Astro + TypeScript（实施时受支持的版本） | `remediate-foundation` Task 5 |
| 测试 | Vitest（单元）+ Playwright（E2E） | `remediate-foundation` Task 5、Task 10 |
| 托管 | `remediate-foundation` Task 10 决定（Vercel / Cloudflare Pages / 其他候选 — 待 `project-charter-inputs.md` 第 1 项"目标市场"决策后回填） |
| 监控 | Sentry（线上错误） + GA4 + GSC（分析与 SEO） | `mcp-config/servers/` |
| MCP 工具 | GitHub、Linear、Notion、Web Search、Playwright、Postgres（deferred）、GA4、GSC、Sentry | `mcp-config/mcp.json` |

**3.2 BLOCKED**

| 项 | 阻塞原因 |
|---|---|
| 样式方案（Tailwind / 原生 CSS Modules / 其他） | 待你确认；UX 评估 spec（未来）出具建议 |
| Postgres / Supabase 接入 | MVP 不接入，`remediate-foundation` REMOVED Requirements 已明确 |
| Cloudflare Workers 后端 | MVP 不接入 |
| Meilisearch 站内搜索 | MVP 不接入 |

**3.3 与既有 spec 的引用**

- 技术栈总览 → `knowledge-base/05-technical/tech-stack.md`
- 性能预算 → `knowledge-base/05-technical/performance-budget.md`
- 部署流程 → `knowledge-base/05-technical/deployment.md`

---

## 第 4 章 开发阶段划分

5 个阶段，每阶段固定 3 栏。**交付物清单引用 `remediate-foundation` 已立项 Task 编号**。

### 4.1 阶段 1：需求分析

- **交付物清单**：`remediate-foundation` Task 1（撤销虚假可信度）+ Task 3（修正公式）+ `docs-and-team-setup` Task 1（`docs/project-charter-inputs.md` + CSV）
- **验收标准**：8 项决策项有默认值与 `BLOCKED: true` 标记；公式 YAML 全部 `derivation: unverified`
- **依赖前置**：无

### 4.2 阶段 2：设计

- **交付物清单**：`remediate-foundation` Task 8（页面模板与百分比页面）+ Task 9（无障碍与响应式）+ `docs-and-team-setup` Task 8（`docs/ux-tech-review.md`）+ Task 9（`docs/design-system.md`）+ Task 10（`docs/ux-test-strategy.md`）
- **验收标准**：1 个端到端计算器（百分比）通过 10 阶段验收中的「功能 / 公式 / 边界 / 可访问性」4 个阶段
- **依赖前置**：阶段 1 完成 + 至少 1 项 `project-charter-inputs.md` 决策回填（影响样式方案与目标市场）

### 4.3 阶段 3：开发

- **交付物清单**：`remediate-foundation` Task 5（Astro 工程初始化）+ Task 6（百分比逻辑）+ Task 7（年龄与日期逻辑）+ Task 10（性能与安全基线）+ Task 18（扩展至首批 10 个计算器）
- **验收标准**：10 个计算器代码 + 单元测试 + 构建产物均通过 `pnpm verify`
- **依赖前置**：阶段 2 完成

### 4.4 阶段 4：测试

- **交付物清单**：`remediate-foundation` Task 10（性能与安全）+ `docs-and-team-setup` Task 4（应急流程演练）+ `docs-and-team-setup` Task 5（验收清单落地）
- **验收标准**：10 阶段验收全部通过；至少 1 次回滚演练并归档记录
- **依赖前置**：阶段 3 完成 + 至少 1 项 `project-charter-inputs.md` 决策回填（决定是否做真机云测）

### 4.5 阶段 5：部署

- **交付物清单**：`remediate-foundation` Task 10（构建与安全响应头）+ `docs-and-team-setup` Task 6（广告前置条件审核）
- **验收标准**：域名 + 索引就位 + 广告前置条件全部解锁（如不解锁则延后注入广告）
- **依赖前置**：阶段 4 完成 + `project-charter-inputs.md` 第 1、2、3、5、6 项决策回填

**4.6 与既有 spec 的引用**

- 任务清单 → `.trae/specs/remediate-foundation/tasks.md`
- 验收门槛 → `docs/launch-checklist.md`

---

## 第 5 章 时间节点安排

**本章不写入虚构日期**。每行为「阶段 N · 依赖前置完成 + 验收通过后启动」占位，末尾 `BLOCKED: true`，待 `project-charter-inputs.md` 第 4 项（启动日）与第 5 项（最晚上线日）回填后回填具体日期。

| 阶段 | 起占位 | 止占位 | 状态 |
|---|---|---|---|
| 阶段 1：需求分析 | 启动日 + 0d | 启动日 + Xd（待你提供） | `BLOCKED: true`（待启动日回填） |
| 阶段 2：设计 | 阶段 1 完成日 + 0d | 阶段 1 完成日 + Xd | `BLOCKED: true` |
| 阶段 3：开发 | 阶段 2 完成日 + 0d | 阶段 2 完成日 + Xd | `BLOCKED: true` |
| 阶段 4：测试 | 阶段 3 完成日 + 0d | 阶段 3 完成日 + Xd | `BLOCKED: true` |
| 阶段 5：部署 | 阶段 4 完成日 + 0d | 最晚上线日（待你提供） | `BLOCKED: true` |

**5.1 与既有 spec 的引用**

- 风险升级路径 → `docs/incident-runbook.md`（超时未响应默认升级）

---

## 第 6 章 资源分配

**本章内容是「指向性摘要 + 引用」，不复制 JD 内容。**

- **6 名数字员工**职责、能力等级、负载保护 → `docs/team-jds.md`
- **能力字段填写位置** → `docs/project-charter-inputs.md` 第 7 项决策（6 名员工各自实际能力）
- **人均负载上限**：每人同时承担的"进行中"任务数 ≤ 1；触顶 2 时由产品（PM 角色）按 `docs/collab-board.md` 「4. 负载保护规则」中的 3 步流程重排
- **BLOCKED 项**：所有 6 名员工的能力等级默认 `中` 且 `BLOCKED: true`，直到你逐项填写

**6.1 与既有 spec 的引用**

- JD → `docs/team-jds.md`
- 协作看板 → `docs/collab-board.md`
- 风险矩阵（人因风险）→ `docs/incident-runbook.md`

---

## 第 7 章 预算规划

**本章金额字段全部 `BLOCKED: true`**，待 `project-charter-inputs.md` 第 2、3 项回填。

| 类别 | 项 | 默认推荐 | 状态 |
|---|---|---|---|
| 一次性 | 域名 | ¥100/年 × N 个 | `BLOCKED: true` |
| 一次性 | 工程脚手架与初始化 | ¥0（开源工具） | `BLOCKED: true` |
| 一次性 | 外部专业审核（金融 / 税务 / 健康公式） | ¥3,000–¥10,000 | `BLOCKED: true` |
| 一次性 | 设计与素材 | ¥0（自产） / ¥500（外包） | `BLOCKED: true` |
| 一次性 | 预留 | 剩余预算的 20% | `BLOCKED: true` |
| 月度 | 托管（按市场） | ¥0–¥200 | `BLOCKED: true` |
| 月度 | 分析与监控（Sentry / GA4） | ¥0–¥150 | `BLOCKED: true` |
| 月度 | 第三方 API（如有） | 按用量 | `BLOCKED: true` |
| 月度 | 预留 | 月度预算的 20% | `BLOCKED: true` |

**7.1 盈亏平衡测算**

公式与示例详见 `docs/revenue-model.md` 第 1 节；本计划不重复公式。任一金额未定 → 无法完成测算 → `BLOCKED: true`。

**7.2 与既有 spec 的引用**

- 预算输入表 → `docs/project-charter-inputs.md` 第 2、3 项
- 变现公式 → `docs/revenue-model.md`

---

## 第 8 章 风险评估及应对

**本章不二次定义风险等级**，只补充「与时间相关的项目级风险」并指向 `incident-runbook.md`。

| 风险 | 触发条件 | 应对 | 责任角色 | 状态 |
|---|---|---|---|---|
| 6 项 BLOCKED 决策被搁置超过 4 周 | 任意 2 项及以上连续 4 周无变更 | 触发项目计划重审（不删任务，标记 P3） | 产品（PM 角色）→ 你 | `BLOCKED: true`（依赖你定期反馈决策） |
| 阶段间阻断超过预期 | 任一阶段验收失败 ≥ 2 轮 | 缩小下一阶段范围 + 重排 SubTask | 计算平台 | 取决于实施 |
| 外部专业审核未到位导致金融类计算器无法上线 | 审核预算未定或拒绝接单 | 移除金融类计算器至延后项；不阻塞其他计算器 | 你 | `BLOCKED: true`（待 `project-charter-inputs.md` 第 8 项决策） |
| 广告平台账户审核失败 | 申请被拒 | 暂停广告位注入；继续无广告 MVP | SEO/内容 + 你 | `BLOCKED: true`（待 `project-charter-inputs.md` 第 6 项决策） |
| 目标市场变更触发整体重做 | 已上线后切换大陆↔海外 | 按 `incident-runbook.md` P0 处理 + 重新评估托管与合规 | 你 | 取决于决策 |

**8.1 与既有 spec 的引用**

- 风险分级与应急流程 → `docs/incident-runbook.md`
- 项目级风险登记册 → `knowledge-base/01-project-management/risk-register.md`

---

## 第 9 章 质量保障计划

**本章不二次定义验收门槛**，只补充「与发布节奏相关的质量门槛」并指向 `launch-checklist.md`。

| 节奏要求 | 量化阈值 | 责任角色 | 状态 |
|---|---|---|---|
| 每上线 1 个新计算器必须完成 1 次回滚演练 | 演练记录归档到 `docs/incident-runbook.md` 附录 A | 计算平台 + QA | 待首期 10 个上线时生效 |
| 每个 PR 必须通过 `pnpm verify` | 类型检查 + 单元测试 + 格式化 + MCP JSON 校验 + 体积检查 全部退出码 0 | 前端 + 计算平台 | 已纳入 `remediate-foundation` Task 5 |
| Lighthouse CI 每次 PR 必跑 | LCP / INP / CLS 三项不超阈值 | 前端 | 已纳入 `performance-budget.md` |
| 每月一次依赖升级与安全审计 | 依赖清单变更提交 PR；`npm audit` 0 高危 | 计算平台 | 待 MVP 上线后启动 |
| 每季度 YMYL 内容复核 | 金融 / 税务 / 健康类计算器抽样回看公式 | 产品 + 外部审核（`BLOCKED: true`） | 待外部审核决定后启动 |

**9.1 与既有 spec 的引用**

- 10 阶段验收 → `docs/launch-checklist.md` 第 1 节
- 移动端测试标准 → `knowledge-base/06-testing-compliance/mobile-test-standards.md`
- 可访问性 → `knowledge-base/06-testing-compliance/accessibility.md`

---

## 附录 A：全部 BLOCKED 项汇总

下表汇总全文出现的所有 `BLOCKED: true` 项，按决策编号排序，方便你一次性催办。

| 编号 | BLOCKED 项 | 来源章节 | 等待的决策 |
|---|---|---|---|
| 1 | 目标市场 | §1.2、§5、§7、§8 | `project-charter-inputs.md` 第 1 项决策 |
| 2 | 一次性预算上限 | §7 | `project-charter-inputs.md` 第 2 项决策 |
| 3 | 月度运营预算上限 | §7 | `project-charter-inputs.md` 第 3 项决策 |
| 4 | 启动日 | §5 | `project-charter-inputs.md` 第 4 项决策 |
| 5 | 最晚上线日 | §5 | `project-charter-inputs.md` 第 5 项决策 |
| 6 | 广告平台账户状态 | §8 | `project-charter-inputs.md` 第 6 项决策 |
| 7 | 6 名员工实际能力 | §6 | `project-charter-inputs.md` 第 7 项决策 |
| 8 | 是否引入外部专业审核 | §8、§9 | `project-charter-inputs.md` 第 8 项决策 |
| 9 | FN-001 基础计算 纳入阶段 | §2.1 | 你对 4 项功能需求的裁决 |
| 10 | FN-002 科学计算 纳入阶段 | §2.2 | 同上 |
| 11 | FN-003 历史记录 纳入阶段 | §2.3 | 同上 |
| 12 | FN-004 主题切换 纳入阶段 | §2.4 | 同上 |
| 13 | 样式方案（Tailwind / 原生 CSS / 其他） | §3.2 | UX 评估 spec 建议 + 你确认 |
| 14 | SEO 基线（GSC 收录验证） | §1.2 | GSC 账号 + 域名就位 |
| 15 | 性能线上口径 | §1.2 | 真实流量样本 |
| 16 | 数字员工值守时段与响应承诺 | `incident-runbook.md` 末尾 | 你确认 |