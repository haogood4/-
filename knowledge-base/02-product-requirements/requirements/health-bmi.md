---
project: calculator-site
doc_id: prd/health-bmi-v1
type: requirement
domain: health
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
sources:
  - title: WHO BMI classification
    url: https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight
    type: official
---

# BMI 计算器 · PRD

## 1. 基本信息

- 工具 ID：`bmi`
- URL slug：`/health/bmi`
- 法务等级：YMYL 中
- 公式源：`03-formulas/health/bmi.yaml`

## 2. 输入字段

| 字段名 | 标签 | 类型 | 单位 | 默认 | 必填 | 范围 |
|---|---|---|---|---|---|---|
| `height` | 身高 | number | cm | 170 | ✅ | 50–250 |
| `weight` | 体重 | number | kg | 65 | ✅ | 10–300 |
| `unit_system` | 单位制 | radio | — | 公制 | ✅ | 公制 / 英制 |

## 3. 输出

- BMI 数值（主）
- 分类（偏瘦 / 正常 / 超重 / 肥胖）
- 理想体重区间

## 4. 异常

- height ≤ 0 → 提示
- weight ≤ 0 → 提示
- BMI > 60 → 警告并显示"可能存在数据错误"

## 5. 免责声明

> BMI 是群体级健康指标，不能用于个体临床诊断。
> 请结合医生建议判断。

---