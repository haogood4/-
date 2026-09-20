# 50 工具 SEO 矩阵总规 Spec

## Why

你下达的"50 个计算器分 5 档实施"任务在 5 个维度上与既有项目发生根本冲突：

1. **市场定位**：现有 4 份已批准 spec 锁定「海外华人 + GDPR/CCPA」；50 工具里的基金定投、股票佣金、个税、五险一金是大陆金融税务专属工具，需要「大陆中文 + PIPL + 银保监会/国税口径」。
2. **YMYL 审核**：`remediate-foundation` 规定金融/税务/健康类必须经外部专业审核方可上线；当前没有审核流程与预算。
3. **命名规范**：既有 11 个工具统一为「英文 slug + 中文标题」；任务中"F Fund定投""Five Insurances and One Fund"中英混排。
4. **重复开发**：折扣、百分比两个工具已经在 `/math/` 路由下。
5. **工具类型偏差**：「亲缘称谓计算器」「QR 码生成器」与"工具型网站"定位弱相关；股票佣金依赖实时数据，打破"无第三方 API"约束。

**你已拍板**（2026-09-19）：

- 市场定位：**切到大陆中文用户**（PIPL + 银保监会/国税口径）
- YMYL 处理：**接受"草稿/参考"标注上线**（不要求外部审核）
- 实施节奏：**先总规后分档**（先批准本 spec，再产出 5 份分档 spec）

本规格目的：在不删除任何已上线工具的前提下，**裁决 50 个工具的逐项去留、统一命名与合规口径、规划分档排期与回写既有 11 工具**，作为后续 5 份 change-id 实施的唯一前置依据。

## What Changes

- **BREAKING**：既有 4 份 spec 的"海外华人 + GDPR"口径降级为参考。本规格覆盖之：market / compliance / library directory naming。**既有工具的代码与页面**保持不变，仅首页导航与法务文档按大陆口径重写。
- 新增 1 份 `docs/market-strategy-cn.md`：市场定位、合规口径、用户画像、流量渠道、变现路径、风险矩阵。
- 修改 `src/pages/index.astro`：首页导航分组改为大陆口径分类（金融理财 / 健康生活 / 装修家居 / 投资专业 / 效率工具 / 日常工具）；既有 11 个工具按新分类重新挂载。
- 修改 [knowledge-base/06-testing-compliance/privacy-policy.md](file:///home/arch/项目/计算器网站开发/knowledge-base/06-testing-compliance/privacy-policy.md) / `terms-of-service.md` / `disclaimer.md`：从 GDPR/CCPA 切换到 PIPL + 银保监会 + 国税口径；新增"金融信息服务备案"声明位。
- 新增 `knowledge-base/02-product-requirements/calculator-list-v2.md`：50 工具完整清单（含 slug、分类、YMYL 等级、SEO 主关键词、优先级、去留裁决）。
- 新增 `knowledge-base/04-seo-content/keyword-bank/v2/`：分档关键词库（金融 / 健康 / 装修 / 投资 / 效率 / 日常）。
- 修改 `docs/revenue-model.md`：盈亏平衡公式按大陆 CPM/CPC 区间更新；广告平台从 AdSense 切到**百度联盟 + 穿山甲**候选。
- **不引入**服务端、数据库、第三方 API（股票行情、实时汇率除外但**留为 P2 占位**）。

## Impact

- 受影响能力：市场定位、合规口径、SEO 关键词库、首页导航、工具命名、变现路径。
- 受影响代码：
  - 修改：`src/pages/index.astro`（导航分组）
  - 修改：`docs/project-charter-inputs.md` §1 目标市场（从推荐默认值切到已批准事实）
  - 修改：`knowledge-base/06-testing-compliance/{privacy-policy,terms-of-service,disclaimer}.md`
  - 修改：`docs/revenue-model.md`
  - 新增：`docs/market-strategy-cn.md`
  - 新增：`knowledge-base/02-product-requirements/calculator-list-v2.md`
  - 新增：`knowledge-base/04-seo-content/keyword-bank/v2/*.md`
  - 后续 change-id 各自新建工具的 `src/lib/calculators/*.ts` / `src/pages/<category>/<slug>.astro` / `src/scripts/<slug>-page.ts`
- 不影响：既有 11 个工具的库函数、单元测试、页面与样式（按"大陆口径重写文案但不改逻辑"原则）。

## ADDED Requirements

### Requirement: 市场定位切换

系统 SHALL 将目标市场从「海外华人 + GDPR/CCPA」切换为「大陆中文用户 + PIPL + 银保监会/国税口径」，并以"草案/参考"标注形式上线所有金融/税务/健康类工具。

#### Scenario: 定位切换生效
- **WHEN** 用户访问首页 `/`
- **THEN** 首页 lead 文案、相关工具链、FAQ、相关文档均以大陆中文表述；既有 11 个工具按新分类重新挂载

#### Scenario: 金融工具标注
- **WHEN** 用户访问任意金融/税务类工具（如 `/finance/mortgage/`）
- **THEN** 页面顶部或结果区含显著提示「计算结果仅供参考，不构成投资建议」；不显示"GDPR"或"CCPA"措辞

### Requirement: 50 工具逐项裁决

系统 SHALL 在 `knowledge-base/02-product-requirements/calculator-list-v2.md` 给出 50 工具的逐项裁决，每个工具必须包含：slug、分类、YMYL 等级、SEO 主关键词（≥ 5 个）、优先级、去留决定。

#### Scenario: 工具裁决四态
- **WHEN** 任意工具出现在清单
- **THEN** 该工具的去留决定 ∈ { `approved`（P0/P1/P2 实施） / `merged`（合并到既有工具） / `deferred`（P2 延后） / `rejected`（驳回，附理由） }

#### Scenario: 重复工具合并
- **WHEN** 工具与既有 11 个工具功能重叠（如 Discount / Percentage）
- **THEN** 该工具的去留决定 = `merged`，指向既有工具的 slug，不重新开发

#### Scenario: 超出范围的工具驳回
- **WHEN** 工具与"计算器"定位无关（如「亲缘称谓计算器」「QR 码生成器」「Kinship Term」）
- **THEN** 去留决定 = `rejected`，理由指出定位偏差

### Requirement: 命名与目录规范

系统 SHALL 统一命名规范：slug 为全小写英文（连字符分隔），中文标题 ≤ 8 字，分类目录使用单数英文（`finance`、`health`、`renovation`、`investment`、`efficiency`、`daily`）。

#### Scenario: 工具命名示例
- **WHEN** 创建一个新工具（如"房贷计算器"）
- **THEN** slug = `mortgage-cn`，分类 = `finance`，标题 = "房贷计算器"；不得出现 "Fund定投""Five Insurances and One Fund"等中英混排

### Requirement: 5 档分档排期

系统 SHALL 将 50 工具按 Tier 1-5 分档实施，每档对应一个独立 change-id spec。每档的工时上限按 6 人团队 1-2 周切分。

#### Scenario: 排期对照表
- **WHEN** 查看总规 spec
- **THEN** 文档含 5 档 × 工具数 × 工时 × 起讫日 × 验收标准的对照表

#### Scenario: 启动日对齐
- **WHEN** 计算各档上线日
- **THEN** Tier 1 上线日 ≤ 已批准启动日（2026-09-19）+ 2 周；Tier 5 上线日 ≤ 启动日 + 12 周

### Requirement: 既有 11 工具的回写

系统 SHALL 在保持既有 11 工具的库函数、单元测试、页面骨架不变的前提下，仅重写：首页导航分组、相关工具链接、合规口径文案、单位与货币显示。

#### Scenario: 既有工具保留
- **WHEN** 重写首页导航
- **THEN** 既有 11 个工具的 URL 与功能完全保留；只是被挂到新分类下

### Requirement: SEO 矩阵

系统 SHALL 在 `knowledge-base/04-seo-content/keyword-bank/v2/` 给出 6 类（金融 / 健康 / 装修 / 投资 / 效率 / 日常）的关键词库；每类至少 30 个主关键词、100 个长尾关键词。

#### Scenario: 关键词矩阵完整
- **WHEN** 打开 v2 关键词库
- **THEN** 每个分类下含搜索量估算（来自公开数据范围）、竞争度评级、目标页面 slug、内容大纲

### Requirement: 变现路径更新

系统 SHALL 将变现路径从「AdSense」切到「百度联盟 / 穿山甲 / 360 联盟」候选，并按大陆 CPM/CPC 区间更新盈亏平衡公式。

#### Scenario: 盈亏平衡公式可复算
- **WHEN** 在 `docs/revenue-model.md` 填入月度运营预算（人民币）与页面 RPM
- **THEN** 公式 `月 PV 盈亏平衡 = (月度运营预算 / 页面 RPM) × 1000` 立即给出所需月 PV

### Requirement: 风险矩阵

系统 SHALL 在总规 spec 末尾给出 50 工具矩阵的风险表：合规风险（YMYL / ICP / 金融信息服务备案）、SEO 风险（关键词堆砌、竞品挤压）、运营风险（公式过时、汇率波动）、法律风险（个税公式准确性、利率合规）。

#### Scenario: 风险显式登记
- **WHEN** 查看风险矩阵
- **THEN** 每项风险含概率、影响、缓解措施、Owner；YMYL 风险标注"已采纳草稿标注缓解措施"

## MODIFIED Requirements

### Requirement: 既有 4 份 spec 的合规口径

`docs-and-team-setup` 中规定的"海外口径"（GDPR/CCPA + 13 岁年龄限制 + 用户所在地管辖法律）降级为"参考版本"。本规格生效后，所有法务文档以 PIPL 口径重写。**不影响** `remediate-foundation` 的工程基线、技术栈、性能预算、UI 规范——这些保持不变。

### Requirement: 首页分类

原首页 4 个分类（数学计算 / 日期与时间 / 单位换算 / 开发者工具 / 日常小工具）按大陆口径重排为 6 类：

| 新分类 | 容纳工具（既有 11 + 新增） |
|---|---|
| 金融理财 | 房贷、贷款、复利、定投、股票佣金、个税、五险一金、提前还款、等额本息、车贷、存款利息、年化收益、IRR、养老金、社保、年终奖、信用卡分期 |
| 健康生活 | BMI、BMR、孕期、心率、卡路里、排卵 |
| 装修家居 | 装修预算、瓷砖、乳胶漆、面积、油耗 |
| 投资专业 | 仓位（海龟）、加密货币、期货保证金、期权定价、跨境电商利润、Amazon FBA、毛利率、盈亏平衡、ROAS、转化率 |
| 效率工具 | 四则运算、百分比、折扣、单位换算、科学计算器、进制转换、时间戳、IP 子网、颜色代码、QR 码、字数 |
| 日常工具 | 年龄、日期差、节拍、预产期、排卵 |

#### Scenario: 首页重排生效
- **WHEN** 用户访问 `/`
- **THEN** 11 个新分类按上述顺序展示；既有 11 工具在对应分类下重新挂载

## REMOVED Requirements

### Requirement: 工具命名"F Fund定投"
**Reason**: 中英混排破坏既有命名规范。
**Migration**: 工具名定为「基金定投计算器」，slug = `fund-dca-cn`。

### Requirement: "Five Insurances and One Fund"
**Reason**: 中文应统一为「五险一金」，英文 slug 命名。
**Migration**: 工具名定为「五险一金计算器」，slug = `social-insurance-cn`。

### Requirement: 「亲缘称谓计算器」「QR 码生成器」
**Reason**: 与"计算器网站"定位无关；QR 码属于生成器类，不是计算。
**Migration**: 列入 `rejected`，在 calculator-list-v2.md 标注驳回理由。

### Requirement: 重复工具（Discount、Percentage）
**Reason**: 既有 11 工具已实现。
**Migration**: 列入 `merged`，指向 `/math/discount/` 与 `/math/percentage/`。

### Requirement: 股票佣金的实时行情接入
**Reason**: 违反"无第三方 API"约束；引入实时数据需额外合规与稳定性投入。
**Migration**: 工具保留但仅支持用户**手动输入佣金费率与交易金额**；不接入实时行情。

---

## 关联

- 本规格**仅裁决**，不实施任何工具代码。
- 5 份分档 spec 各自独立 change-id、独立审批、独立排期：
  - `.trae/specs/tier1-finance-health/`（Tier 1，10 个工具）
  - `.trae/specs/tier2-finance-renovation/`（Tier 2，15 个工具）
  - `.trae/specs/tier3-longtail/`（Tier 3，5 个工具）
  - `.trae/specs/tier4-pro/`（Tier 4，10 个工具）
  - `.trae/specs/tier5-efficiency/`（Tier 5，10 个工具）
- 与 `remediate-foundation`（已批准）：保留工程基线、技术栈、性能预算、UI 规范。
- 与 `launch-10-mvp`（已批准）：既有 11 工具保留，导航分组重排。
- 与 `docs-and-team-setup`（已批准）：合规口径从海外改为大陆，但治理层文档（团队定义、看板、风险响应）保持不变。
- 与 `basic-arithmetic-calculator`（已批准）：四则运算工具保留并迁移到"效率工具"分类。

## 待你决策的阻塞项

1. 域名（来自上一 Goal，已要求你提供）
2. 一次性预算、月度运营预算
3. 6 名数字员工能力等级
4. 百度联盟 / 穿山甲 / 360 联盟账户申请状态
5. ICP 备案主体（个人 vs 企业）
