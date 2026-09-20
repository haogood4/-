---
project: calculator-site
type: sop
domain: formulas
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 后端负责人
last_updated: 2025-01-01
---

# 03 · 公式与专业规则知识库

> **最重要的知识库。** 决定计算器是否可信、合规、可被搜索收录。

```
03-formulas/
├── README.md                       ← 当前文件
├── formula-template.yaml           ← 公式文件标准模板（每条公式必须按此结构）
├── finance/
│   ├── mortgage-cn.yaml            ← 房贷（等额本息 + 等额本金）
│   ├── prepayment-cn.yaml          ← 提前还款
│   ├── income-tax-cn.yaml          ← 个税（参考用）
│   ├── interest-simple.yaml        ← 单利
│   └── exchange-rate.yaml          ← 汇率（仅展示换算，不内嵌汇率）
├── health/
│   ├── bmi.yaml                    ← BMI
│   └── bmr.yaml                    ← 基础代谢率
├── daily/
│   ├── age.yaml                    ← 年龄
│   └── date-diff.yaml              ← 日期差（含工作日）
└── math-unit/
    ├── percentage.yaml             ← 百分比
    └── unit-converter.yaml         ← 单位换算
```

---

## 公式文件管理铁律

1. **每个计算器一个 YAML 文件**，文件名 = `calculator_id`。
2. **必须包含**：来源链接 + 来源类型 + 生效日期 + 审核人 + 测试数据。
3. **状态机**：`draft → in-review → approved → deprecated`。
4. `approved`（经专业人工审核）文件只能由人类 PR 合并，AI 不得直接覆盖。
5. 任何版本变更必须更新 `version`、`last_updated` 并在 `decision-log.md` 留痕。
6. 来源类型优先级（高 → 低）：
   - 政府 / 央行 / 监管
   - 银行 / 金融机构 / 权威医疗机构
   - 国际组织（WHO、ISO、IEEE）
   - 行业协会
   - 知名学术期刊
   - 竞品网站（仅研究交互，不作为公式依据）

---