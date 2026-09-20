# 项目治理、协作与变现文档集 Spec

## Why

第一轮整改（`remediate-foundation`）只解决"地基"问题：撤销虚假可信度、修复 MCP JSON、初始化 Astro 工程、交付 1 个端到端样板计算器。但用户后续提出的 6 类需求——基础信息补充、团队协作、员工职责、广告变现、风险与应急、验收交付——本质都是"项目治理层"的产物，与代码层解耦，适合作为独立 change-id 推进，便于单独审批与单独验收。

本规格只交付 6 份 Markdown 文档与 1 份 Excel/CSV 可导入的输入表，全部位于 `docs/` 目录，不涉及应用代码。代码层动作（计算器扩展、监控接入、广告脚本注入）保留在后续 change-id。

## What Changes

- 新建 6 份 `docs/` 文档，每份是**已填写示例值的模板**：不留给 PM 空白文档，而是先由 AI 写入合理默认值与注释，再由你审核修改。
- 不修改任何 `knowledge-base/`、`mcp-config/`、`mcp-manual/`、`src/`、`tests/`、`package.json` 等已有或即将创建的文件。
- 不绑定任何代码产出；本规格全部工作产物是 Markdown 与可选 CSV。
- 不引入新的第三方依赖、不修改 `package.json` 或 `astro.config.mjs`。

## Impact

- 受影响能力：项目治理、协作机制、团队定义、风险与应急、广告变现前置条件、验收与交付清单。
- 受影响文件：
  - 新建：`docs/project-charter-inputs.md`、`docs/project-charter-inputs.csv`、`docs/collab-board.md`、`docs/team-jds.md`、`docs/incident-runbook.md`、`docs/launch-checklist.md`、`docs/revenue-model.md`
- 与 `remediate-foundation` 的边界：本规格不重复定义"工程基线"或"计算器样板"等已在那份 spec 中立项的事项；只输出治理层文档。

---

## ADDED Requirements

### Requirement: 项目基础信息采集表

系统 SHALL 提供一份带默认值与填写说明的输入表 `docs/project-charter-inputs.md`，覆盖 PM 推进项目必需的全部业务约束。

#### Scenario: 必填字段齐全
- **WHEN** 打开 `docs/project-charter-inputs.md`
- **THEN** 该文件至少包含 8 项必填决策：目标市场、一次性预算上限、月度运营预算上限、启动日、最晚上线日、广告平台账户状态、6 名员工各自实际能力、是否引入外部专业审核；每项含说明、影响范围、未填后果与 AI 推荐的默认值（含理由）

#### Scenario: 同时提供 CSV 导入版
- **WHEN** 打开 `docs/project-charter-inputs.csv`
- **THEN** 该 CSV 与 Markdown 同源，可被 GitHub Issues 表格或 Notion 数据库直接导入；首列 `字段`，其余列依次为 `当前值`、`推荐默认值`、`填写人`、`填写时间`、`备注`

#### Scenario: BLOCKED 状态显式标注
- **WHEN** 任一决策项保持默认值或未填写
- **THEN** 该项末尾必须显示 `BLOCKED: true` 并列出因此被阻塞的下游任务（引用 `remediate-foundation` 与本 spec 的任务编号）

### Requirement: 团队协作机制

系统 SHALL 在 `docs/collab-board.md` 中定义单一任务跟踪系统、看板列、命名规范与沟通节奏。

#### Scenario: 看板列定义完整
- **WHEN** 打开 `docs/collab-board.md`
- **THEN** 该文件列出 6 列状态：待梳理 / 待开发 / 进行中 / 待评审 / 待验收 / 完成，每列含进入条件、退出条件、负责人

#### Scenario: 任务命名规范可执行
- **WHEN** 创建一个新任务
- **THEN** 标题遵循 `<工具ID或模块> · <动词> · <期望结果>` 三段式；规范中给出 3 条符合规范的示例与 2 条反例

#### Scenario: 沟通节奏可执行
- **WHEN** 工作日 18:00（Asia/Shanghai）到达
- **THEN** 6 名数字员工中由 PM 角色（产品）按模板生成日报并提交到你审阅；模板字段含：完成 / 进行 / 阻塞 / 待决策 / 下一动作
- **WHEN** 周五 18:00 到达
- **THEN** 生成周报，附加字段：里程碑进度、范围变化、预算消耗、质量指标、流量与广告表现

#### Scenario: 负载保护规则
- **WHEN** 任一员工"进行中"任务数 ≥ 2
- **THEN** 该员工卡片在看板中标红，新任务分配前必须先关闭其一；规则文档中给出"如何重排"的 3 步流程

### Requirement: 6 名数字员工 JD

系统 SHALL 在 `docs/team-jds.md` 中提供产品 / UX / 前端 / 计算平台 / QA / SEO内容 共 6 份 JD，每份包含具体职责、技能要求、工作产出、协作接口与禁止行为。

#### Scenario: JD 字段完整
- **WHEN** 打开 `docs/team-jds.md`
- **THEN** 每份 JD 含 9 个固定小节：角色名、汇报对象、核心职责、必备技能、工作产出、协作对象、输入物与交付物、质量门槛、禁止行为

#### Scenario: 协作接口可执行
- **WHEN** 跨角色交付完成
- **THEN** JD 中明确"上游交付物的具体格式 + 下游验收标准"；例如：UX 给前端的交付物是 Figma 链接 + 组件状态列表 + 响应式断点；前端给 QA 的交付物是 PR 链接 + 验证清单 + 测试用例覆盖说明

#### Scenario: 能力等级字段
- **WHEN** 任一 JD 中标注员工能力
- **THEN** 该字段使用 `高 / 中 / 低` 三档，并在 `project-charter-inputs.md` 中找到对应填写；未填写时该 JD 默认 `中` 并在文档中显式说明

#### Scenario: 禁止行为清单
- **WHEN** 阅读任一 JD
- **THEN** 至少包含 4 条禁止行为：伪造审核状态、代签审批、绕过分支保护、替用户确认外部邮件

### Requirement: 风险矩阵与应急响应

系统 SHALL 在 `docs/incident-runbook.md` 中定义风险等级、响应时效、升级路径与回滚演练要求。

#### Scenario: 风险分级表
- **WHEN** 打开 `docs/incident-runbook.md`
- **THEN** 该文件含 4 级表格：P0（阻断服务，1h 内响应）、P1（重大功能失效，2h）、P2（次要问题，8h）、P3（计划内优化，24h）；每级含触发条件示例与第一响应人占位

#### Scenario: 升级路径
- **WHEN** 风险未被首响人在时效内处理
- **THEN** 自动升级路径为：员工 → 产品（PM）→ 你；超时默认升级，文档中给出"如何确认升级已生效"的判定方法

#### Scenario: 应急流程 5 步
- **WHEN** 风险发生
- **THEN** 执行流程：检测 → 通知 → 评估等级 → 执行预案 → 复盘；每步含责任人占位、产出物、判定"该步完成"的标准

#### Scenario: 回滚演练要求
- **WHEN** 任一重大版本上线前
- **THEN** 至少完成 1 次回滚演练并附演练记录；MVP 阶段以前 1 个计算器（百分比）为演练对象，演练结果必须进入 `incident-runbook` 附录

#### Scenario: 业务连续性声明
- **WHEN** 阅读该文档的"备份与恢复"节
- **THEN** 明确声明当前 MVP 为纯前端 + 静态托管，备份策略 = 仓库 + 构建产物；引入数据库后必须重新评估 RPO/RTO

### Requirement: 验收与发布清单

系统 SHALL 在 `docs/launch-checklist.md` 中定义 10 阶段验收清单、交付物清单与上线后运维计划。

#### Scenario: 10 阶段验收
- **WHEN** 任一计算器进入"待验收"
- **THEN** 验收单覆盖 10 个阶段：功能、公式、边界、日期时间、兼容性、自动化、可访问性、SEO、广告、发布；每阶段含 2–4 个可量化阈值

#### Scenario: 验收单模板可填写
- **WHEN** 打开该文档的"验收单模板"节
- **THEN** 模板以表格形式给出字段：检查项 / 通过标准 / 实际结果 / 通过 Y/N / 责任人 / 时间戳；每个计算器复制一份填写

#### Scenario: 交付物清单完整
- **WHEN** 阶段性里程碑结束
- **THEN** 交付物对照清单至少 11 项：代码与 lockfile、10 份工具 PRD、公式与测试数据、设计稿、SEO 规格、政策草案、埋点字典、广告位清单、测试报告、部署与回滚步骤、账号权限清单、运维手册

#### Scenario: 运维计划可执行
- **WHEN** 阅读"上线后运维"节
- **THEN** 至少含 5 项监控指标（可用性、JS 异常率、计算失败率、性能 P75、广告政策通知）、故障处理流程（响应、定位、修复、复盘四步）、日常维护计划（依赖升级、Lighthouse CI、定期 YMYL 复核）

### Requirement: 广告变现模板

系统 SHALL 在 `docs/revenue-model.md` 中提供盈亏平衡测算模型、广告位骨架与前置条件清单，**不预设任何具体收益目标**。

#### Scenario: 盈亏平衡公式可复算
- **WHEN** 在文档中填入月度运营预算与页面 RPM
- **THEN** 公式 `月 PV 盈亏平衡 = (月度运营预算 / 页面 RPM) × 1000` 立即给出所需月 PV；文档同时提供 3 组示例（如 RPM=1/5/10 元），每组展示计算过程与最终 PV

#### Scenario: 行业参考区间
- **WHEN** 阅读"行业参考"节
- **THEN** 给出经验区间（中文工具站首屏展示广告 RPM 通常 ¥1–¥10/千次，CPC 通常 ¥0.10–¥1.00，搜索广告 RPM 通常 ¥3–¥30），明确标注"区间来自公开经验，非承诺"，并提示实际值需上线后回填

#### Scenario: 广告位骨架完整
- **WHEN** 阅读"广告位骨架"节
- **THEN** 含 3 个候选位置（结果后、FAQ 后、页脚前），尺寸参考（移动端 300×250，桌面端 728×90 / 336×280），明确"先启用 1 个，根据真实数据再加"，并给出各位置对计算完成率的假设影响范围

#### Scenario: 加载策略可执行
- **WHEN** 渲染任一计算器页面
- **THEN** 广告加载遵循 4 条策略：预留固定尺寸避免 CLS、可视区域外懒加载、同意管理触发后再加载第三方脚本、加载失败不阻塞计算

#### Scenario: 前置条件清单与 BLOCKED 联动
- **WHEN** 任一前置条件未就位（账户未开通、合规未审、隐私政策未发布、同意管理未配置）
- **THEN** 文档中对应项标记 `BLOCKED: true`，并在末尾汇总"已 BLOCKED 项"列表；任一项 BLOCKED 时不得注入广告脚本

### Requirement: 项目整体开发计划

系统 SHALL 在 `docs/project-plan.md` 中输出一份**聚合性**项目计划，覆盖项目背景与目标、功能需求、技术栈、阶段划分、时间节点、资源分配、预算、风险、质量保障 9 个章节，作为 PM 的总览文档。该文档 SHALL **仅聚合并引用**既有 3 份 spec（`remediate-foundation` / `docs-and-team-setup` / 未来的 UX 评估 spec）的产出，不重新定义已有任务、不二次编辑既有文档。

#### Scenario: 9 个必备章节齐全
- **WHEN** 打开 `docs/project-plan.md`
- **THEN** 文档包含且仅包含以下 9 章（顺序固定）：项目背景与目标、功能需求分析（含基础计算、科学计算、历史记录、主题切换）、技术栈选型、开发阶段划分（需求分析 / 设计 / 开发 / 测试 / 部署）、时间节点安排、资源分配、预算规划、风险评估及应对、质量保障计划

#### Scenario: 每章结构可执行
- **WHEN** 查看任一章节
- **THEN** 章节首行为「本章节正文」，紧随其后的固定三段：① 决策项 / 验收项清单；② 与既有 spec 的引用关系（指向具体文件 + 章节）；③ BLOCKED 状态标注（未确定条件必须显示 `BLOCKED: true`）

#### Scenario: 范围限定声明
- **WHEN** 文档开头
- **THEN** 含一段「范围限定」声明：本计划不替代 `remediate-foundation` 的代码实现任务定义、不替代 `docs-and-team-setup` 的治理层文档定义、不替代未来 UX 评估 spec；任何与既有 spec 冲突时，以既有 spec 为准

#### Scenario: 用户列出的功能需求逐项覆盖
- **WHEN** 阅读「功能需求分析」章
- **THEN** 4 类用户列出的功能（基础计算、科学计算、历史记录、主题切换）逐项独立成节；每节包含需求编号（如 `FN-001`）、输入字段与校验、计算或交互规则、输出、对应计算器 ID（已规划则引用 `knowledge-base/02-product-requirements/calculator-list.md`，未规划则留空）

#### Scenario: 纳入阶段由你裁决而非 AI 预设
- **WHEN** 查看任一功能小节
- **THEN** 该节含 `纳入阶段` 字段，值在 `MVP / 延后 / 不做` 三选一之间填写；任何小节都不得默认填充该字段——未填写时显示 `纳入阶段: 待你决定 BLOCKED: true` 并列出影响下游（关联到 `remediate-foundation` 的具体 Task）

#### Scenario: AI 给出建议但不强制
- **WHEN** 用户尚未对某功能表态
- **THEN** 该功能小节的 `AI 建议` 字段可填写，附 1 段简短理由；但 `纳入阶段` 必须保持 `待你决定 BLOCKED: true` 直至用户确认

#### Scenario: 阶段交付物与验收标准一一对应
- **WHEN** 阅读「开发阶段划分」或「时间节点安排」章
- **THEN** 每个阶段（需求分析 / 设计 / 开发 / 测试 / 部署）单独成节，含「交付物清单」「验收标准」「依赖前置」三栏，且交付物清单与 `remediate-foundation` 中已立项的 Task 编号一一对应（如 SubTask 8.1 对应"端到端样板页面"交付物）

#### Scenario: 时间节点未填时显式标记
- **WHEN** 用户尚未提供启动日与最晚上线日
- **THEN** 「时间节点安排」章不写入虚构日期，而是以「阶段 N · 依赖前置完成 + 验收通过后启动」的占位描述，每行末尾标注 `BLOCKED: true`

#### Scenario: 资源、预算、风险、质量不二次重定义
- **WHEN** 查看「资源分配」「预算规划」「风险评估」「质量保障」章
- **THEN** 内容是「指向性摘要 + 引用」，而不是把 `team-jds.md`、`revenue-model.md`、`incident-runbook.md`、`launch-checklist.md` 里的内容复制一遍；每节至少 1 处指向对应文档具体章节

#### Scenario: 关联文档顶部一览表
- **WHEN** 打开文档
- **THEN** 顶部含「关联文档一览表」，列出全部被聚合的 spec / docs 文件路径与一句话职责说明，方便 PM 跳转核对

#### Scenario: 风险与质量章节联动 BLOCKED
- **WHEN** 阅读「风险评估及应对」或「质量保障计划」章
- **THEN** 任一风险或质量门槛涉及未确定条件（如外部专业审核、真机云测预算、目标市场），对应条目末尾显示 `BLOCKED: true` 并指明等待的具体决策项编号

### Requirement: UX/UI 设计技术可行性评估

系统 SHALL 在 `docs/ux-tech-review.md` 中对 7 个评估域逐项给出可实现性裁决，每项含开发难度、技术栈匹配度、技术限制与裁决结论。该文档 SHALL 基于 `remediate-foundation` 已批准的技术方案静态分析，不引入新的代码产出。

#### Scenario: 评估域覆盖完整
- **WHEN** 打开 `docs/ux-tech-review.md`
- **THEN** 包含 7 个评估域：移动端界面设计、表单元素设计、可访问性标准、广告布局方案、页面结构规划、组件状态定义、响应式设计标注

#### Scenario: 每项评估字段齐全
- **WHEN** 查看任一评估项
- **THEN** 含 6 个字段：设计要求原文引用（含文件路径）、开发难度（低/中/高）、技术栈匹配度（匹配/需改造/不匹配）、技术限制说明、裁决结论（可实现/需降级/不可实现）、降级方案（结论非"可实现"时必填）

#### Scenario: 冲突项显式登记
- **WHEN** 设计规范与 `remediate-foundation` 已批准的技术方案冲突
- **THEN** 该项在文档"冲突登记表"中单列，含冲突双方出处、影响范围、建议裁决、待确认标记；与既有 spec 的 MODIFIED Requirements 一致

### Requirement: 设计系统交付物

系统 SHALL 在 `docs/design-system.md` 中补齐设计令牌、组件状态机、响应式断点三类当前缺失的交接物，作为 UX→前端的正式交付。

#### Scenario: 设计令牌可映射到 CSS
- **WHEN** 查看"设计令牌"节
- **THEN** 含颜色、字号、间距、圆角、阴影 5 类令牌，每类以 CSS 自定义属性命名（如 `--color-text-primary`），颜色类标注对比度实测值

#### Scenario: 组件状态机完整
- **WHEN** 查看任一核心组件（数值输入框、计算按钮、结果区、错误提示、广告容器）
- **THEN** 该组件列出全部状态与状态转移条件；数值输入框至少 6 态：空、聚焦、有效、无效、禁用、只读

#### Scenario: 结果区状态覆盖"待重算"
- **WHEN** 查看结果区状态机
- **THEN** 至少 4 态：空状态、已计算、待重算（输入已变更）、计算失败

#### Scenario: 响应式断点可实现
- **WHEN** 查看"响应式断点"节
- **THEN** 断点数量 ≤ 3 个，每个断点标注布局变化、字号变化、广告尺寸变化；最小支持宽度 320px 且声明无横向溢出

### Requirement: UX 可测试性策略

系统 SHALL 在 `docs/ux-test-strategy.md` 中为每个设计元素与交互流程判定可测试性，并归属到具体测试层级（Vitest / 组件测试 / Playwright / 人工验证）。

#### Scenario: 不可自动化项显式声明
- **WHEN** 某设计要求无法通过自动化测试验证（如真机触控手感、屏幕阅读器实际朗读效果）
- **THEN** 标记为"人工验证"，并给出验证步骤、所需设备/工具、通过判定标准

#### Scenario: 可访问性测试分层
- **WHEN** 查看可访问性测试策略
- **THEN** 明确区分自动化可覆盖项与必须人工验证项，并声明"Lighthouse a11y 分数不等于 WCAG 合规"

#### Scenario: 交互流程测试用例可执行
- **WHEN** 查看核心交互流程测试
- **THEN** 至少覆盖 5 条流程：正常计算、字段校验失败并聚焦首个错误字段、修改输入后结果标记待重算、重置清空、广告脚本缺失时功能不受影响

---

## MODIFIED Requirements

无。本规格不修改任何已有 spec 的 Requirement。

---

## REMOVED Requirements

### Requirement: 任何预设的 CPM / CPC / CPA 目标值
**Reason**: 在没有真实流量、广告平台账户与历史数据时给出具体收益数字属于虚构。
**Migration**: 仅保留行业参考区间与盈亏平衡公式，由你在上线后回填实际值。

### Requirement: 第二轮扩展的 6 类任务被合并进 `remediate-foundation`
**Reason**: 第一轮审批的是"地基整改"，把"项目治理文档"混在同一份 spec 中导致范围膨胀、单次审批负担过重。
**Migration**: 本规格独立为 `docs-and-team-setup`，与 `remediate-foundation` 并列；后者已剔除原 Task 12–17。