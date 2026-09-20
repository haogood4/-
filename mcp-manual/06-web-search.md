---
project: calculator-site
doc_id: mcp/manual-web-search
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: SEO + 公式审核人
last_updated: 2025-01-01
---

# Web Search / Fetch MCP 使用手册

## 能力

- 通用网页搜索。
- 单页面抓取（HTML → 文本）。

## 何时使用

| 场景 | 工具 |
|---|---|
| 查 LPR 公告 / 法规变化 | `search` |
| 查竞品页面结构（仅研究交互） | `fetch` |
| 查权威医学指南 | `fetch` |
| 关键词调研辅助 | `search` |

## 调用示例

### 查 LPR 最新公告

```json
{
  "tool": "web-search.search",
  "args": { "query": "site:pbc.gov.cn 贷款市场报价利率 2025", "top_k": 5 }
}
```

### 抓取并解析央行页面

```json
{
  "tool": "web-search.fetch",
  "args": { "url": "https://www.pbc.gov.cn/..." }
}
```

## 安全规则

- **不**抓取需要登录的页面。
- **不**绕开 robots.txt。
- 抓取结果**只能用于研究和复核**，不能直接复制他人内容。
- 竞品分析结果归档到 `04-seo-content/competitor-notes/`（仅内部参考）。

## 输出规范

每次抓取必须返回：

```
URL
标题
正文摘要（≤ 300 字）
关键事实（列表）
来源类型：official / institutional / academic / competitor
```
---