# 计算器网站项目地基整改与 MVP 立项 Spec

## Why

本次核查发现三项事实，使"全面改进规划"无法按常规的"现状→目标"方式编写：

1. 仓库中**没有任何应用代码**。`package.json`、`app/`、`lib/`、`tests/` 均不存在。全部内容是 96 个 Markdown/YAML 文档。
2. `mcp-config/` 下 **10 个 JSON 文件全部语法错误**，无法被 `json.load` 解析（每个文件末尾多出一行 `---`）。该配置当前不可加载，因此"MCP 三级权限"从未生效。
3. 知识库中 **81 处 `human-verified` 状态、审核人姓名、以及 `decision-log.md` 中的历史决策条目均无真实依据**，由上一轮 AI 直接写入。

因此，功能完整性、性能、代码质量、测试覆盖率四个方向的"现状"为空；而文档与安全方向的首要问题不是"不完善"，而是**存在误导性断言**。本规格的目标是先消除虚假可信度，建立可验证的公式与测试基线，再交付一个端到端可用的计算器。

第二轮扩展：在第一轮基础上，纳入用户提出的 6 大类补充要求（基础信息、团队协作、员工职责、广告变现、风险与应急、验收交付）。其中"预算、市场、平台账户、员工实际能力、上线日期"等 5 项业务约束仍未提供，无法写成已确认事实，相关任务以"待决策后激活"形式列出，不在事实层面落地。

## What Changes

- **BREAKING**：撤销全部无依据的 `human-verified` / `review_status` / `reviewer` 标记，统一降级为 `draft`，并移除虚构的审核人姓名。
- **BREAKING**：删除 `decision-log.md`、`change-log.md`、`issue-register.md` 中虚构的历史条目，保留文件与模板结构。
- 修复 10 个 MCP JSON 的语法错误，并加入 CI 语法校验；明确文档中的权限分级是**约定**，不是已生效的技术管控。
- 修正 `daily/age.yaml` 中错误的周岁算法（不得用天数除以 365.2425）。
- 将全部 `test_vectors` 标记为 `unverified`，改由代码中的独立实现重新推导并固化。
- 初始化最小工程骨架（构建、类型检查、单元测试、格式化），交付 1 个端到端计算器作为样板。
- 补齐性能预算、可访问性、安全基线的**可执行检查**，而非仅文档描述。
- 新增 6 个数字员工的 JD 模板、协作看板规范、阶段定义、风险矩阵、验收与运维清单，所有内容均以**模板**形式落地，参数（人名、预算、日期）由用户在补齐信息后填写。
- 明确广告位方案、变现前置条件、收益测算模型；**不预设 CPM/CPC/CPA 数值**，仅提供公式与盈亏平衡测算。

## Impact

- 受影响能力：公式可信度、文档可信度、MCP 配置可用性、工程基线、测试基线、协作机制、广告变现前置条件、风险与应急、验收交付。
- 受影响文件：
  - `knowledge-base/03-formulas/**`（状态与公式修正）
  - `knowledge-base/01-project-management/{decision-log,change-log,issue-register,risk-register}.md`
  - 全部含 front-matter 的知识库文档（`status` 字段）
  - `mcp-config/**.json`（语法）
  - 新增：`docs/project-charter-inputs.md`、`docs/team-jds.md`、`docs/collab-board.md`、`docs/launch-checklist.md`、`docs/incident-runbook.md`、`docs/revenue-model.md`
  - 新增工程文件：`package.json`、`tsconfig.json`、`astro.config.mjs`、`.gitignore`、`.editorconfig`、`src/lib/**`、`src/pages/**`、`tests/**`、`scripts/check-mcp-json.mjs`、`scripts/check-bundle-size.mjs`

---

## ADDED Requirements

### Requirement: 文档状态可信性

系统 SHALL 保证任何标记为已审核的文档都存在可追溯的审核记录。

#### Scenario: 无审核记录的文档
- **WHEN** 某文档的 front-matter 含 `status: human-verified` 但仓库中不存在对应的审核记录（PR 评审、签署记录或外部审核意见）
- **THEN** 该文档的 `status` 必须为 `draft`，且 `reviewer` 字段必须为空或标记 `未指派`

#### Scenario: 引用未审核公式
- **WHEN** 实现代码引用 `status: draft` 的公式文档
- **THEN** 该计算器不得进入发布候选，页面需标注"计算规则待复核"

### Requirement: MCP 配置可解析

系统 SHALL 保证所有 MCP 配置文件是合法 JSON。

#### Scenario: JSON 语法校验
- **WHEN** 对 `mcp-config/` 下任一 `.json` 文件执行标准 JSON 解析
- **THEN** 解析成功，无 `Extra data` 或其他语法错误

#### Scenario: 权限表述准确
- **WHEN** 阅读 MCP 权限相关文档
- **THEN** 文档明确声明三级权限为团队约定，实际管控依赖服务端令牌作用域与仓库分支保护，而非配置文件中的 `tier` 字段

### Requirement: 公式独立验证

系统 SHALL 为每个计算器提供由代码独立推导、可复现的测试向量。

#### Scenario: 测试向量来源
- **WHEN** 新增或修改任一 `test_vectors` 条目
- **THEN** 该条目的期望值由仓库内的单元测试实际运行得出，并在 YAML 中标注 `derivation: unit-test`

#### Scenario: 周岁计算
- **WHEN** 计算出生日期 `2000-02-29` 在目标日期 `2025-02-28` 的周岁
- **THEN** 结果为 24（按公历年月日比较，未到生日不进位），不得使用天数除以年均长度

#### Scenario: 金融类边界
- **WHEN** 年利率为 0
- **THEN** 等额本息退化为本金均摊，总利息为 0，且不产生除零错误

### Requirement: 最小工程基线

系统 SHALL 提供可运行的构建、类型检查与测试命令。

#### Scenario: 一键校验
- **WHEN** 在干净环境执行依赖安装后运行校验命令
- **THEN** 类型检查、单元测试、格式检查全部通过，退出码为 0

#### Scenario: 计算逻辑与界面分离
- **WHEN** 单元测试导入计算函数
- **THEN** 无需启动浏览器或渲染组件即可完成断言

### Requirement: 端到端样板计算器

系统 SHALL 交付 1 个完整计算器，覆盖输入、校验、结果、无障碍与广告预留位。

#### Scenario: 正常计算
- **WHEN** 用户在百分比计算器填入合法数值并点击计算
- **THEN** 展示主结果与公式代入过程，并可复制结果

#### Scenario: 校验失败
- **WHEN** 任一必填字段为空或含非法字符
- **THEN** 保留已填输入，聚焦首个错误字段，展示字段级错误文案，不产生计算结果

#### Scenario: 输入变更后的旧结果
- **WHEN** 已有结果且用户修改任一输入
- **THEN** 旧结果标记为需重新计算，不自动更新为新值

#### Scenario: 键盘与朗读
- **WHEN** 仅使用键盘完成一次计算
- **THEN** 所有控件可达、焦点可见，结果区通过 `aria-live="polite"` 播报

#### Scenario: 广告位不干扰
- **WHEN** 广告脚本加载失败或被拦截
- **THEN** 计算、复制、分享功能仍完全可用，且布局不发生偏移

> 第二轮扩展的 6 类治理层需求（项目基础信息采集、协作看板、风险与应急、验收与发布、广告变现模板）已拆为独立 change-id
> `.trae/specs/docs-and-team-setup/`，本规格不再包含。代码层 Task 19 / 20 的监控与广告位 B 仍留在本规格的"阶段五"。

---

## MODIFIED Requirements

### Requirement: 性能预算

性能目标 SHALL 以可测量条件表述，并区分实验室与线上两类口径。

实验室口径（CI 中 Lighthouse 移动端模拟，节流固定）：首屏 JS ≤ 100KB（gzip）、CSS ≤ 30KB、LCP ≤ 2.5s。
线上口径（真实用户，第 75 百分位）：LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1。
"页面加载 < 3 秒"重新定义为：在约定移动设备与网络条件下，**核心输入表单可见且可操作** < 3 秒。

有广告与无广告两种状态分别测量，广告加载不得阻塞计算路径。

### Requirement: 舍入与精度

金额类计算 SHALL 使用十进制运算，仅在展示层舍入。

移除"银行家舍入"的笼统表述，改为明确：展示保留 2 位小数，采用四舍五入（round-half-up），舍入后的展示值标注"约"。内部计算不得提前舍入。

### Requirement: 项目章程
原 `project-charter.md` 中的"团队 1 PM + 1 PO + 1 UX + 1–2 FE + 1 BE + 1 SEO + 1 QA"调整为"6 名数字员工（产品、UX、前端、计算/平台、QA、SEO/内容）+ 项目经理 1 名（你）"。实际人数按 `docs/team-jds.md`（`docs-and-team-setup` 产物）中标注的能力与负载约束确定。

### Requirement: 计算按钮定位

`knowledge-base/02-product-requirements/cross-cutting/mobile-interaction.md` 当前规定"计算按钮吸底"。吸底按钮在 iOS Safari 软键盘弹出时存在视口高度变化导致按钮被遮挡或跳动的已知行为，且与"广告不得遮挡计算按钮"的既有约束叠加后风险升高。

该条 SHALL 改为：计算按钮置于输入区正下方的常规文档流中，不使用 `position: fixed`。若后续需要吸底，必须先完成 iOS Safari 与 Android Chrome 真机验证并记录结果。

### Requirement: 数值输入控件范围

`mobile-interaction.md` 当前要求所有数值字段提供滑块联动。滑块对金额、利率等需要精确输入的字段会降低精度可控性，增加状态同步复杂度与无障碍实现成本（需 `aria-valuenow` 等一整套属性），且首期 10 个计算器均无区间探索类需求。

MVP 阶段 SHALL 移除滑块要求，仅保留数字输入。待出现明确的区间探索需求（如贷款年限比较）时，按单个计算器单独评估后引入。

### Requirement: 空状态文案与移动优先一致

`knowledge-base/02-product-requirements/cross-cutting/empty-state-and-errors.md` 当前空状态文案为"请填写左侧字段以查看结果"，"左侧"属于桌面双列布局措辞，与移动优先单列布局矛盾。

该条 SHALL 改为不含方位词的表述："填写上方字段后显示结果"。

### Requirement: 结果区字号统一

`mobile-interaction.md` 规定移动端主结果 32px，`knowledge-base/06-testing-compliance/mobile-test-standards.md` 规定主结果 ≥ 28px，两处不一致会导致验收判定歧义。

两份文档 SHALL 统一为：移动端主结果 32px（验收下限 32px），桌面端 48px；`mobile-test-standards.md` 中的 28px 更正为 32px。

### Requirement: 技术栈一致性

`knowledge-base/05-technical/tech-stack.md` 当前记载 Next.js 14 + Tailwind + shadcn/ui + Supabase + Cloudflare Workers + Meilisearch，与本规格已批准的 Astro + TypeScript、Postgres 标记 `deferred` 相互冲突。

该文档 SHALL 更新为：前端 Astro + TypeScript；样式方案在 `docs/ux-tech-review.md` 中裁决；Supabase / Cloudflare Workers / Meilisearch 全部标记 `deferred`，并注明"MVP 不接入，需真实需求后重新评估"。备选对比表保留，但需更正 Astro 的"动态能力弱"表述——首期 10 个计算器为纯前端计算，动态能力不构成限制。

### Requirement: MVP 阶段接入站内搜索引擎

原 `tech-stack.md` 中的 Meilisearch 站内搜索 SHALL 标记 `deferred`。10 个计算器的检索需求可由静态 JSON 索引 + 客户端过滤满足，引入独立搜索服务带来部署与运维成本而无对应收益。工具数量超过 50 个或出现长尾检索需求后重新评估。

### Requirement: 可访问性验收口径

`knowledge-base/06-testing-compliance/accessibility.md` 当前以"Lighthouse Accessibility ≥ 95"作为测试手段之一，容易被理解为分数达标即合规。

该文档 SHALL 补充声明：自动化工具仅覆盖部分可机检规则，WCAG 2.1 AA 合规必须叠加键盘走查与屏幕阅读器人工验证；Lighthouse 分数作为回归监控指标，不作为合规结论。同时删除对 `screenshots/` 目录的引用或创建该目录，避免指向不存在的路径。

---

## REMOVED Requirements

### Requirement: 文档内的公式审核状态即生效
**Reason**: 上一轮写入的 `human-verified` 无任何真实审核依据，属于误导性断言，可能导致未经复核的金融/税务公式被当作已验证内容上线。
**Migration**: 全部降级为 `draft`；需要专业审核的条目（个税、房贷、健康类）在获得外部审核意见并将记录存入仓库后，方可重新标记，且必须附审核人与日期。

### Requirement: 虚构的历史决策与风险记录
**Reason**: `decision-log.md` 中的 DEC-001~003、`change-log.md` 中的 CHG-001~002、`issue-register.md` 中的 ISS-001 均为示例数据，与真实项目历史不符。
**Migration**: 清空条目，保留表头与填写规范作为模板；真实决策从本次整改开始记录。

### Requirement: MVP 阶段接入 Postgres / Supabase
**Reason**: 首期 10 个计算器均为纯前端计算，无持久化需求；引入数据库会带来运维、备份、合规成本而无对应收益。
**Migration**: 相关 MCP 配置与知识库条目标志为 `deferred`；待出现真实持久化需求（如用户收藏跨端同步）时重新评估。

### Requirement: 第二轮 6 类治理层任务混入本规格
**Reason**: 第一轮审批范围仅限"地基整改"，把治理层任务塞入同一份 spec 导致范围膨胀、单次审批负担过重。
**Migration**: 全部迁出至独立 change-id `.trae/specs/docs-and-team-setup/`，独立审批与独立验收；本规格仅保留代码层与测试层动作。