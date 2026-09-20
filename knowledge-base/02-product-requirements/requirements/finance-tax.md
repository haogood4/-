---
project: calculator-site
doc_id: prd/finance-tax-v1
type: requirement
domain: finance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
sources:
  - title: 国家税务总局
    url: https://www.chinatax.gov.cn/
    type: official
---

# 个税计算器 · PRD（草稿）

## 1. 基本信息

- 工具 ID：`income-tax-cn`
- URL slug：`/finance/income-tax`
- 法务等级：YMYL 高（涉税务）
- 公式源：`03-formulas/finance/income-tax-cn.yaml`（参考国家税务总局公告）

## 2. 输入字段

| 字段名 | 中文标签 | 类型 | 单位 | 默认 | 必填 | 范围 |
|---|---|---|---|---|---|---|
| `monthly_salary` | 月工资 | number | 元 | — | ✅ | 0+ |
| `social_insurance` | 五险一金 | number | 元 | 0 | ✅ | 0–monthly_salary |
| `special_deduction` | 专项附加扣除 | number | 元 | 0 | ✅ | 0+ |
| `city` | 所在城市 | select | — | 北京 | ✅ | 用于速算扣除数 |

## 3. 输出

- 月度应纳税额
- 年度累计应纳税额
- 适用税率
- 速算扣除数

## 4. 免责声明（强制）

> 本结果仅基于您输入的数据估算。实际申报请以国家税务总局官方系统为准。

## 5. 验收标准

- 与"个人所得税 APP"计算结果在 ±1 元以内视为通过。
- 税率每年初必须复核。

---