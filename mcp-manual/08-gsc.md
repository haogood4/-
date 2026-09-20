---
project: calculator-site
doc_id: mcp/manual-gsc
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: SEO
last_updated: 2025-01-01
---

# Search Console MCP 使用手册

## 能力

- 查询：收录、点击、展现、排名。
- 索引检查：`urlInspection.index.inspect`。
- 草稿：提交 sitemap。

## 调用示例

### Top 查询（带点击 + 排名）

```json
{
  "tool": "gsc.searchanalytics.query",
  "args": {
    "siteUrl": "https://example.com/",
    "startDate": "2025-01-06",
    "endDate": "2025-01-12",
    "dimensions": ["query"],
    "rowLimit": 25
  }
}
```

### URL 检查（房贷页面是否被收录）

```json
{
  "tool": "gsc.urlInspection.index.inspect",
  "args": {
    "siteUrl": "https://example.com/",
    "inspectionUrl": "https://example.com/finance/mortgage"
  }
}
```

## 安全规则

- 只读 + sitemap 草稿。
- 不允许直接 `request indexing` 单 URL（防滥用配额）。
- AI 不允许关闭任何索引问题。

## 与 Notion 的联动

每周末：

1. `gsc.searchanalytics.query` 取 Top 50 queries。
2. 通过 `notion.create_page_draft` 写入"本周 SEO 简报"。

---