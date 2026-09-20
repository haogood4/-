---
project: calculator-site
doc_id: seo/schema-org
type: sop
domain: seo
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: SEO 负责人
last_updated: 2025-01-01
---

# 结构化数据（Schema.org）

每个计算器页面必须输出以下 JSON-LD：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "房贷计算器",
  "alternateName": "Mortgage Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript",
  "inLanguage": "zh-CN",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CNY"
  },
  "creator": {
    "@type": "Organization",
    "name": "CalculatorPro",
    "url": "https://example.com"
  }
}
```

FAQ 部分额外输出 `FAQPage`：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "等额本息和等额本金有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "等额本息每月还款额固定；等额本金每月本金固定、利息递减……"
      }
    }
  ]
}
```

## BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"首页","item":"https://example.com/"},
    {"@type":"ListItem","position":2,"name":"金融","item":"https://example.com/finance"},
    {"@type":"ListItem","position":3,"name":"房贷计算器","item":"https://example.com/finance/mortgage"}
  ]
}
```

## 校验

- 上线前通过 https://search.google.com/test/rich-results 校验。
- 通过 Schema Markup Validator 二次确认。

---