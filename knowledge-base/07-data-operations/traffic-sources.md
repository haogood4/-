---
project: calculator-site
doc_id: ops/traffic-sources
type: sop
domain: ops
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: SEO
last_updated: 2025-01-01
---

# 流量来源分类

## 默认来源（GA4）

| source | medium | 含义 |
|---|---|---|
| google | organic | Google 自然搜索 |
| bing | organic | Bing 自然搜索 |
| baidu | organic | 百度自然搜索 |
| (direct) | (none) | 直接访问 / 书签 |
| t.co / weibo / weixin | social | 社媒 |
| github / csdn / zhihu | referral | 外链 |

## 自定义 utm 参数

```
?utm_source={src}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}
```

## 关注指标

- 自然搜索占比：≥ 70%（MVP）
- direct 占比：≤ 25%
- 单一来源 > 80% 视为"结构脆弱"，需拓展。

---