---
project: calculator-site
doc_id: prd/finance-mortgage-v1
type: requirement
domain: finance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
---

# 房贷计算器（中国）· PRD

> 这是模板的"实例化"版本，参照 `calculator-template.md` 编写。
> 实际 PRD 必须按模板结构补全，本示例仅展示完整度。

## 1. 基本信息

- 工具 ID：`mortgage-cn`
- URL slug：`/finance/mortgage`
- 法务等级：YMYL 高
- 公式源：`03-formulas/finance/mortgage-cn.yaml`
- 测试用例：`06-testing-compliance/test-cases/mortgage-cn.md`

## 2. 用户与场景

- 目标用户：准备贷款买房的个人；想对比不同贷款方案。
- 关键问题：月供多少？哪种还款方式划算？

## 3. 输入字段

| 字段名 | 中文标签 | 类型 | 单位 | 默认值 | 必填 | 范围 |
|---|---|---|---|---|---|---|
| `loan_amount` | 贷款金额 | number | 元 | — | ✅ | 10000–100000000 |
| `annual_rate` | 年利率 | number | % | 4.20 | ✅ | 0–30 |
| `loan_years` | 贷款年限 | number | 年 | 30 | ✅ | 1–30 |
| `repayment_method` | 还款方式 | select | — | 等额本息 | ✅ | 等额本息 / 等额本金 |

## 4. 公式

引用 `03-formulas/finance/mortgage-cn.yaml`（等额本息 + 等额本金）。

## 5. 输出

- 月供（主）
- 还款总额
- 支付利息（主）
- 首期本金/利息
- 还款明细表（前 12 期）

## 6. 异常

- `loan_amount ≤ 0` → 提示"请输入大于 0 的贷款金额"。
- `annual_rate > 30` → 警告但不阻断。
- `loan_years > 30` → 提示"最长 30 年"。

## 7. 免责声明

> 本结果仅供参考，不构成任何投资或贷款建议。
> 实际月供以贷款机构最终审批为准。

## 8. SEO 关键词

- 主：房贷计算器
- 次：房贷月供计算器；等额本息计算器
- 长尾：房贷 100 万 30 年每月还多少

## 9. 验收标准

参见模板第 14 节；额外要求：必须显示 LPR 来源注释。

---