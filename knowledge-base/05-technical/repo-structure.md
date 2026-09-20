---
project: calculator-site
doc_id: tech/repo-structure
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 代码目录结构

```
.
├── app/                          # Next.js App Router
│   ├── (marketing)/              # 营销页（首页、关于、博客）
│   │   └── page.tsx
│   ├── finance/
│   │   ├── mortgage/page.tsx
│   │   ├── prepayment/page.tsx
│   │   └── income-tax/page.tsx
│   ├── health/
│   │   ├── bmi/page.tsx
│   │   └── bmr/page.tsx
│   ├── daily/
│   │   ├── age/page.tsx
│   │   └── date-diff/page.tsx
│   ├── math/
│   │   ├── percentage/page.tsx
│   │   └── unit-converter/page.tsx
│   ├── layout.tsx
│   └── sitemap.ts
│
├── components/
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── calculator/               # 计算器通用组件
│   │   ├── CalculatorLayout.tsx
│   │   ├── InputField.tsx
│   │   ├── ResultCard.tsx
│   │   └── Disclaimer.tsx
│   ├── seo/                      # Meta、Schema 组件
│   └── analytics/                # 事件追踪
│
├── lib/
│   ├── calculators/              # 计算逻辑（与公式 YAML 对应）
│   │   ├── mortgage.ts
│   │   ├── bmi.ts
│   │   └── age.ts
│   ├── formatters.ts             # 数字、货币、日期格式化
│   ├── seo.ts                    # Meta、Schema 生成
│   └── analytics.ts              # GA4 事件
│
├── content/                      # SEO 内容（Markdown / MDX）
│   ├── finance/mortgage.md
│   └── ...
│
├── knowledge-base/               # 项目知识库（本目录同层）
│
├── public/
│   ├── icons/
│   └── images/
│
├── tests/
│   ├── unit/
│   └── e2e/
│
├── workers/                      # Cloudflare Workers
│   └── api/
│
├── .github/workflows/            # CI/CD
└── package.json
```
---