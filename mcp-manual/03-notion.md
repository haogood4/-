---
project: calculator-site
doc_id: mcp/manual-notion
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: PM
last_updated: 2025-01-01
---

# Notion MCP 使用手册

## 能力

- 读取：知识库页面、数据库、blocks。
- 草稿：创建 / 更新页面。
- 审批：删除页面 / 永久归档。

## 何时使用

| 场景 | 工具 | 等级 |
|---|---|---|
| 查项目章程 | `get_page` | read |
| 列所有决策日志 | `list_databases` | read |
| 起草会议纪要 | `create_page_draft` | propose |
| 更新决策日志 | `update_page_draft` | propose |
| 删除过期页 | `delete_page` | approve |

## 调用示例

### 读取项目章程

```json
{
  "tool": "notion.get_page",
  "args": { "page_id": "PROJECT_CHARTER_ID" }
}
```

### 起草周会议纪要

```json
{
  "tool": "notion.create_page_draft",
  "args": {
    "parent": { "database_id": "MEETING_NOTES_DB_ID" },
    "title": "W3 站会 2025-01-15",
    "blocks": [
      {"type":"heading_2","text":"议程"},
      {"type":"bulleted_list_item","text":"MCP 接入进展"},
      {"type":"bulleted_list_item","text":"房贷公式复核"}
    ]
  }
}
```

## 安全规则

- 不允许删除任何 `human-verified` 状态的页面。
- 写入必须带 `effective_from` 与 `owner` 字段。
- 涉及"法律 / 税务 / 健康"页面更新需 PO 双签。

## 数据源映射

| Notion Database | 同步来源 | 同步频率 |
|---|---|---|
| Decision Log | GitHub `decision-log.md` | push 后自动 |
| Risk Register | GitHub `risk-register.md` | 每周一 |
| Meeting Notes | 会议结束 | 24 小时内 |

---