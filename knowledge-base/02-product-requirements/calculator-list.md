---
project: calculator-site
doc_id: prd/calculator-list
type: spec
domain: product
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
---

# MVP 计算器清单（15 个）

> 评估口径：搜索需求 × 用户痛点 × 开发难度 × SEO 潜力 × YMYL 风险。
> 标 ⭐ 为"必做 P0"；标 ○ 为"可做 P1"。

| 编号 | 工具 | slug | 分类 | 法务等级 | 搜索需求 | 开发难度 | 优先级 |
|---|---|---|---|---|---|---|---|
| C-001 | 房贷计算器 | finance/mortgage | 金融 | YMYL-高 | 高 | 中 | ⭐ P0 |
| C-002 | 提前还款计算器 | finance/prepayment | 金融 | YMYL-高 | 高 | 中 | ⭐ P0 |
| C-003 | 个税计算器 | finance/income-tax | 金融/税务 | YMYL-高 | 高 | 中 | ⭐ P0 |
| C-004 | 公积金贷款计算器 | finance/housing-fund | 金融 | YMYL-中 | 中 | 中 | ○ P1 |
| C-005 | 利息计算器 | finance/interest | 金融 | YMYL-中 | 中 | 低 | ⭐ P0 |
| C-006 | 汇率换算器 | finance/exchange | 金融 | YMYL-低 | 高 | 低 | ⭐ P0 |
| C-007 | BMI 计算器 | health/bmi | 健康 | YMYL-中 | 高 | 低 | ⭐ P0 |
| C-008 | BMR / TDEE 计算器 | health/bmr | 健康 | YMYL-中 | 高 | 中 | ○ P1 |
| C-009 | 孕期计算器 | health/pregnancy | 健康 | YMYL-高 | 中 | 中 | ○ P1 |
| C-010 | 年龄计算器 | daily/age | 日常 | 非 YMYL | 高 | 低 | ⭐ P0 |
| C-011 | 日期差计算器 | daily/date-diff | 日常 | 非 YMYL | 高 | 低 | ⭐ P0 |
| C-012 | 工作日计算器 | daily/workday | 日常 | 非 YMYL | 中 | 低 | ⭐ P0 |
| C-013 | 时间戳转换 | daily/timestamp | 日常/开发 | 非 YMYL | 中 | 低 | ⭐ P0 |
| C-014 | 百分比计算器 | math/percentage | 数学 | 非 YMYL | 高 | 低 | ⭐ P0 |
| C-015 | 单位换算 | math/unit-converter | 数学 | 非 YMYL | 高 | 中 | ⭐ P0 |

## 分类汇总

| 分类 | 数量 | 主推流量词 |
|---|---|---|
| 金融 | 6 | 房贷、个税、利息、汇率 |
| 健康 | 3 | BMI、BMR、孕期 |
| 日常 | 4 | 年龄、日期、时间戳 |
| 数学 | 2 | 百分比、单位换算 |
| **合计** | **15** | — |

## 选择标准

- **必须做**：搜索量 > 1000/月、开发 < 3 天、YMYL 风险可控。
- **不做**：极低搜索量、合规无法满足、或需要持续维护的"动态数据"。

## 后续 v2 候选

- 退休规划计算器
- 复利 / 单利计算器
- 信用评分估算
- 心率区间计算器
- 油耗计算器
- 房贷 vs 全款对比计算器

---