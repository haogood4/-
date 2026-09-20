---
project: calculator-site
type: sop
domain: product
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
---

# 02 · 产品需求知识库

```
02-product-requirements/
├── README.md                      ← 当前文件
├── calculator-list.md             ← MVP 15 个计算器总览
├── calculator-template.md         ← 计算器统一需求模板（必读）
├── requirements/
│   ├── finance-mortgage.md        ← 示例：房贷计算器需求（已完成）
│   ├── finance-tax.md
│   ├── health-bmi.md
│   ├── daily-age.md
│   └── ...                        ← 每个计算器一份
└── cross-cutting/
    ├── mobile-interaction.md      ← 移动端交互通用规范
    └── empty-state-and-errors.md  ← 空状态与错误信息规范
```

> 每个计算器的需求文件命名：`{领域}-{slug}.md`，与 `03-formulas/` 内的 YAML ID 对齐。
---