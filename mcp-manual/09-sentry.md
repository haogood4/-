---
project: calculator-site
doc_id: mcp/manual-sentry
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: QA + 技术负责人
last_updated: 2025-01-01
---

# Sentry MCP 使用手册

## 能力

- 读取 issue、event、堆栈。
- 评论草稿。
- 审批：resolve / delete。

## 调用示例

### 拉今日新增 issue

```json
{
  "tool": "sentry.list_issues",
  "args": { "project": "calculator-site", "range": "24h", "level": "error" }
}
```

### 给 issue 写复现草稿

```json
{
  "tool": "sentry.add_comment_draft",
  "args": {
    "issue_id": "S-123",
    "text": "复现步骤：…\n影响：…\n建议修复 PR：#42"
  }
}
```

## 安全规则

- 默认不动 issue 状态。
- 修复完成后，由人类在 Sentry UI 中 resolve。
- 不允许删除 issue（即使长期未出现）。

## 与 Linear 的联动

```
sentry.list_issues（高频）→ Linear create_issue_draft
  → PM 批准 → Linear 真实任务 → 修复 → CI 通过 → merge → auto resolve
```

---