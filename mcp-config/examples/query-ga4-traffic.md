# 示例：用 GA4 MCP 查询上周自然流量

```json
{
  "tool": "ga4.runReport",
  "args": {
    "property": "properties/123456789",
    "dateRanges": [{"startDate": "2025-01-06", "endDate": "2025-01-12"}],
    "dimensions": [{"name": "sessionDefaultChannelGroup"}],
    "metrics": [{"name": "sessions"}, {"name": "engagementRate"}]
  }
}
```

## 期望返回

```json
[
  {"channel": "Organic Search", "sessions": 12480, "engagementRate": 0.62},
  {"channel": "Direct",         "sessions": 2200,  "engagementRate": 0.71},
  {"channel": "Referral",       "sessions": 480,   "engagementRate": 0.55}
]
```

## AI 输出示例

> 上周自然搜索 12,480 次会话（占比 ~82%），环比 +12%。
> 互动率 62% 略低于目标 65%，建议优化首屏钩子。

## 下一步

- 对低互动页面拉取 LCP / CLS（`page_view` 维度）。
- 写入 `weekly-report-template.md`。
---