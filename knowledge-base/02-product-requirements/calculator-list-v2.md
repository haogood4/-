---
project: calculator-site
doc_id: prd/calculator-list-v2
type: spec
domain: product
locale: zh-CN
version: v2.0.0
status: approved
effective_from: 2026-09-19
owner: 产品经理
last_updated: 2026-09-19
---

# 50 工具裁决清单 v2（大陆口径）

> 来源：`.trae/specs/strategy-50-calculators/spec.md`（已批准）。
> 评估口径：搜索需求 × 转化潜力 × 开发难度 × YMYL 风险 × 与既有 11 工具重叠度。
> 裁决状态：`approved`（实施） / `merged`（合并到既有） / `deferred`（延后） / `rejected`（驳回）。

---

## Tier 1（10 个 P0 工具 — 启动日 + 2 周内上线）

| # | 中文标题 | slug | 分类 | YMYL | 优先级 | 裁决 |
|---|---|---|---|---|---|---|
| 1 | 房贷计算器 | `mortgage-cn` | finance | 高 | P0 | **approved** |
| 2 | 贷款计算器 | `loan-cn` | finance | 高 | P0 | **approved** |
| 3 | 复利计算器 | `compound-interest-cn` | finance | 中 | P0 | **approved** |
| 4 | 基金定投计算器 | `fund-dca-cn` | finance | 中 | P0 | **approved** |
| 5 | 股票佣金计算器 | `stock-commission-cn` | finance | 中 | P0 | **deferred**（实时行情延后，仅支持用户输入费率） |
| 6 | 个税计算器 | `income-tax-cn` | finance | 高 | P0 | **approved** |
| 7 | 五险一金计算器 | `social-insurance-cn` | finance | 高 | P0 | **approved** |
| 8 | BMI 计算器 | `bmi-cn` | health | 中 | P0 | **merged** → 复用既有 BMI YAML，新页面 `/health/bmi/` |
| 9 | 汇率换算计算器 | `currency-exchange-cn` | finance | 低 | P0 | **approved** |
| 10 | 单位换算计算器 | `unit-converter-cn` | efficiency | 低 | P0 | **merged** → 既有 `/unit/length/` 等 |

**Tier 1 实际开发量**：7 个新工具 + 0 个 merged 重写 + 1 个 deferred（费率模式）+ 2 个 merged 复用。工时估算：7 × 1.5 = **10.5 人天**。

---

## Tier 2（15 个工具 — 启动日 + 5 周内上线）

| # | 中文标题 | slug | 分类 | YMYL | 优先级 | 裁决 |
|---|---|---|---|---|---|---|
| 11 | 提前还款计算器 | `prepayment-cn` | finance | 高 | P1 | **merged** → 既有 `prepayment-cn.yaml` 已存在，复用公式 |
| 12 | 等额本息计算器 | `equal-installment-cn` | finance | 高 | P1 | **approved**（与房贷计算器共用等额本息公式；独立页面） |
| 13 | 车贷计算器 | `auto-loan-cn` | finance | 中 | P1 | **approved** |
| 14 | 存款利息计算器 | `deposit-interest-cn` | finance | 中 | P1 | **approved** |
| 15 | 年化收益率计算器 | `annualized-return-cn` | finance | 中 | P1 | **approved** |
| 16 | IRR 内部收益率计算器 | `irr-cn` | finance | 中 | P1 | **approved** |
| 17 | 养老金计算器 | `pension-cn` | finance | 中 | P1 | **approved** |
| 18 | 社保缴费计算器 | `social-security-cn` | finance | 中 | P1 | **merged** → 与五险一金合并，UI 中作为子模块 |
| 19 | 年终奖个税计算器 | `bonus-tax-cn` | finance | 高 | P1 | **approved** |
| 20 | 信用卡分期计算器 | `credit-installment-cn` | finance | 中 | P1 | **approved** |
| 21 | 装修预算计算器 | `renovation-budget-cn` | renovation | 低 | P1 | **approved** |
| 22 | 瓷砖数量计算器 | `tile-quantity-cn` | renovation | 低 | P1 | **approved** |
| 23 | 乳胶漆用量计算器 | `paint-quantity-cn` | renovation | 低 | P1 | **approved** |
| 24 | 房屋面积计算器 | `floor-area-cn` | renovation | 低 | P1 | **approved** |
| 25 | 油耗计算器 | `fuel-consumption-cn` | daily | 低 | P1 | **approved** |

**Tier 2 实际开发量**：11 个新工具 + 3 个 merged + 1 个子模块。工时估算：11 × 1.5 = **16.5 人天**。

---

## Tier 3（5 个长尾内容工具 — 启动日 + 7 周内上线）

| # | 中文标题 | slug | 分类 | YMYL | 优先级 | 裁决 |
|---|---|---|---|---|---|---|
| 26 | 节拍计算器 | `pace-cn` | health | 低 | P2 | **approved** |
| 27 | 卡路里消耗计算器 | `calorie-burn-cn` | health | 低 | P2 | **approved** |
| 28 | 预产期计算器 | `due-date-cn` | health | 高 | P2 | **approved** |
| 29 | 排卵期计算器 | `ovulation-cn` | health | 高 | P2 | **approved** |
| 30 | 日期差计算器 | `date-diff-cn` | daily | 低 | P2 | **merged** → 既有 `/daily/date-diff/` |

**Tier 3 实际开发量**：4 个新工具 + 1 个 merged。工时估算：4 × 1.0 = **4 人天**。

---

## Tier 4（10 个专业投资工具 — 启动日 + 9 周内上线）

| # | 中文标题 | slug | 分类 | YMYL | 优先级 | 裁决 |
|---|---|---|---|---|---|---|
| 31 | 海龟交易法仓位计算器 | `turtle-position-cn` | investment | 中 | P2 | **approved** |
| 32 | 加密货币仓位计算器 | `crypto-position-cn` | investment | 中 | P2 | **approved** |
| 33 | 期货保证金计算器 | `futures-margin-cn` | investment | 中 | P2 | **approved** |
| 34 | 期权定价计算器 | `option-pricing-cn` | investment | 中 | P2 | **approved** |
| 35 | 跨境电商利润计算器 | `cross-border-profit-cn` | investment | 低 | P2 | **approved** |
| 36 | Amazon FBA 费用计算器 | `amazon-fba-cn` | investment | 低 | P2 | **approved** |
| 37 | 毛利率计算器 | `gross-margin-cn` | investment | 低 | P2 | **approved** |
| 38 | 盈亏平衡点计算器 | `break-even-cn` | investment | 低 | P2 | **approved** |
| 39 | 广告 ROAS 计算器 | `roas-cn` | investment | 低 | P2 | **approved** |
| 40 | 转化率计算器 | `conversion-rate-cn` | investment | 低 | P2 | **approved** |

**Tier 4 实际开发量**：10 个新工具。工时估算：10 × 1.0 = **10 人天**。

---

## Tier 5（10 个效率/补充工具 — 启动日 + 12 周内上线）

| # | 中文标题 | slug | 分类 | YMYL | 优先级 | 裁决 |
|---|---|---|---|---|---|---|
| 41 | 折扣计算器 | `discount-cn` | efficiency | 低 | P0 | **merged** → 既有 `/math/discount/` |
| 42 | 百分比计算器 | `percentage-cn` | efficiency | 低 | P0 | **merged** → 既有 `/math/percentage/` |
| 43 | 在线科学计算器 | `scientific-cn` | efficiency | 低 | P1 | **approved** |
| 44 | 进制转换计算器 | `base-converter-cn` | efficiency | 低 | P1 | **approved** |
| 45 | 时间戳转换计算器 | `timestamp-cn` | efficiency | 低 | P1 | **merged** → 既有 `/dev/timestamp/` |
| 46 | IP 子网计算器 | `ip-subnet-cn` | efficiency | 低 | P2 | **approved** |
| 47 | 颜色代码转换器 | `color-code-cn` | efficiency | 低 | P2 | **rejected** → 与"计算器"定位无关；属于生成器/转换器 |
| 48 | QR 码生成器 | `qrcode-cn` | efficiency | 低 | P2 | **rejected** → 属于生成器类，不是计算器 |
| 49 | 字数统计计算器 | `word-count-cn` | efficiency | 低 | P2 | **approved** |
| 50 | 亲缘称谓计算器 | `kinship-cn` | daily | 低 | P3 | **rejected** → 文化/族谱工具，与工具型网站定位无关 |

**Tier 5 实际开发量**：5 个新工具 + 4 个 merged + 3 个 rejected。工时估算：5 × 1.0 = **5 人天**。

---

## 裁决汇总

| 裁决状态 | 数量 | 工具 |
|---|---|---|
| `approved` | 37 | 全部真正开发 |
| `merged` | 10 | 复用既有工具或公式 |
| `deferred` | 1 | 股票佣金（实时行情延后） |
| `rejected` | 3 | 颜色代码、QR 码、亲缘称谓 |
| **合计** | **50** | — |

---

## 命名规范

所有工具统一遵循：

- **slug**：全小写英文 + 连字符；带 `-cn` 后缀以区分大陆口径与既有海外口径
- **中文标题**：≤ 8 字
- **分类目录**：单数英文（`finance` / `health` / `renovation` / `investment` / `efficiency` / `daily`）
- **页面路径**：`/src/pages/<category>/<slug>.astro`

### 命名变更对照

| 你下达时的名称 | 标准化后的名称 | slug |
|---|---|---|
| Fund定投 Calculator | 基金定投计算器 | `fund-dca-cn` |
| Stock Commission Calculator | 股票佣金计算器（用户输入费率版） | `stock-commission-cn` |
| Individual Income Tax Calculator | 个税计算器 | `income-tax-cn` |
| Five Insurances and One Fund Calculator | 五险一金计算器 | `social-insurance-cn` |
| Currency Exchange Calculator | 汇率换算计算器 | `currency-exchange-cn` |
| Unit Conversion Calculator | 单位换算计算器 | `unit-converter-cn` |
| Equal Principal and Interest/Equal Principal Calculator | 等额本息计算器 | `equal-installment-cn` |
| Auto Loan Calculator | 车贷计算器 | `auto-loan-cn` |
| Deposit Interest Calculator | 存款利息计算器 | `deposit-interest-cn` |
| Annualized Return Rate Calculator | 年化收益率计算器 | `annualized-return-cn` |
| IRR Internal Rate of Return Calculator | IRR 内部收益率计算器 | `irr-cn` |
| Pension Calculator | 养老金计算器 | `pension-cn` |
| Social Security Calculator | 社保缴费计算器 | `social-security-cn` |
| Year-end Bonus Tax Calculator | 年终奖个税计算器 | `bonus-tax-cn` |
| Credit Card Installment Calculator | 信用卡分期计算器 | `credit-installment-cn` |
| Renovation Budget Calculator | 装修预算计算器 | `renovation-budget-cn` |
| Tile Quantity Calculator | 瓷砖数量计算器 | `tile-quantity-cn` |
| Emulsion Paint Quantity Calculator | 乳胶漆用量计算器 | `paint-quantity-cn` |
| Floor Area Calculator | 房屋面积计算器 | `floor-area-cn` |
| Fuel Consumption Calculator | 油耗计算器 | `fuel-consumption-cn` |
| Pacing Calculator | 节拍计算器 | `pace-cn` |
| Calorie Burn Calculator | 卡路里消耗计算器 | `calorie-burn-cn` |
| Due Date Calculator | 预产期计算器 | `due-date-cn` |
| Ovulation Calculator | 排卵期计算器 | `ovulation-cn` |
| Date Difference Calculator | 日期差计算器 | `date-diff-cn` |
| Turtle Trading Method Position Size Calculator | 海龟交易法仓位计算器 | `turtle-position-cn` |
| Cryptocurrency Position Calculator | 加密货币仓位计算器 | `crypto-position-cn` |
| Futures Margin Calculator | 期货保证金计算器 | `futures-margin-cn` |
| Option Pricing Calculator | 期权定价计算器 | `option-pricing-cn` |
| Cross-border E-commerce Profit Calculator | 跨境电商利润计算器 | `cross-border-profit-cn` |
| Amazon FBA Fee Calculator | Amazon FBA 费用计算器 | `amazon-fba-cn` |
| Gross Profit Margin Calculator | 毛利率计算器 | `gross-margin-cn` |
| Break-even Point Calculator | 盈亏平衡点计算器 | `break-even-cn` |
| Advertising ROAS Calculator | 广告 ROAS 计算器 | `roas-cn` |
| Conversion Rate Calculator | 转化率计算器 | `conversion-rate-cn` |
| Online Scientific Calculator | 在线科学计算器 | `scientific-cn` |
| Base Converter | 进制转换计算器 | `base-converter-cn` |
| IP Subnet Calculator | IP 子网计算器 | `ip-subnet-cn` |
| Word Counter | 字数统计计算器 | `word-count-cn` |
| Color Code Converter | — | `color-code-cn`（已驳回） |
| QR Code Generator | — | `qrcode-cn`（已驳回） |
| Kinship Term Calculator | — | `kinship-cn`（已驳回） |

---

## 关联文档

- [.trae/specs/strategy-50-calculators/spec.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/spec.md)
- [.trae/specs/strategy-50-calculators/tasks.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/tasks.md)
- [.trae/specs/strategy-50-calculators/checklist.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/checklist.md)
- [calculator-list.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list.md)（v1 海外版，保留作为参考）
