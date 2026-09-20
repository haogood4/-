# 示例：用 GitHub MCP 读取本周 Bug

```json
{
  "tool": "github.list_issues",
  "args": {
    "labels": ["bug"],
    "state": "open",
    "since": "2025-01-13T00:00:00Z"
  }
}
```

## 期望返回

```json
[
  {"id": 42, "title": "BMI 输入身高 0 不报错", "assignee": "wang5", "created_at": "2025-01-14"},
  {"id": 47, "title": "汇率 API 超时无降级", "assignee": "li4", "created_at": "2025-01-15"}
]
```

## AI 接下来要做的

1. 拉每个 bug 的详细信息（get_issue）。
2. 与 `06-testing-compliance/test-cases/` 对应模板匹配，定位遗漏。
3. 在 Linear MCP 创建修复任务（propose 等级）。
4. 给出风险评级并提示 PM。
---