---
project: calculator-site
doc_id: mcp/manual-linear
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: PM
last_updated: 2025-01-01
---

# Linear MCP 使用手册

## 能力

- 读取任务、团队、项目、里程碑。
- 草稿任务。
- 审批：创建/更新/删除任务。

## 何时使用

| 场景 | 工具 | 等级 |
|---|---|---|
| 周报统计：本周完成 / 过期任务 | `list_issues` | read |
| 从 GitHub bug 自动派生任务 | `create_issue_draft` | propose |
| 把"快过期"任务升级 | `update_issue_draft` | propose |
| 删除任务 | `delete_issue` | approve |

## 调用示例

### 查询过期任务

```json
{
  "tool": "linear.list_issues",
  "args": { "filter": "dueDate < now AND state = \"In Progress\"" }
}
```

### 草稿：从 Sentry 高频错误自动派生修复任务

```json
{
  "tool": "linear.create_issue_draft",
  "args": {
    "team": "ENG",
    "title": "[BUG] 房贷页面 Sentry 错误 S-123 出现 50 次/日",
    "labels": ["bug", "sentry"],
    "priority": 2,
    "estimate": 4,
    "description": "错误堆栈：…\n影响页面：/finance/mortgage\n建议方案：…",
    "source_ref": "sentry://S-123"
  }
}
```

## 安全规则

- 所有任务必须带 `source_ref`，便于追溯。
- AI 不允许直接 `update_issue_status = Done`。
- 删除任务必须经 PM 审批。

## 与 GitHub MCP 的配合

```
GitHub Issue 创建 → AI 解析 → Linear create_issue_draft（propose）
  → PM 在 Linear 批准 → 真实创建 → 关联 GitHub PR（propose）
  → Code Review 通过 → 合并（approve）→ 自动 close Linear
```

---