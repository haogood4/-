# 示例：用 Linear MCP 创建任务草稿

```json
{
  "tool": "linear.create_issue_draft",
  "args": {
    "team": "ENG",
    "title": "[BUG] BMI 输入身高为 0 时未报错",
    "description": "在 Playwright 走查中发现……\n复现步骤：……\n影响：……\n建议修复：……",
    "labels": ["bug", "qa-found"],
    "priority": 2,
    "estimate": 2,
    "assignee_hint": "wang5",
    "related_calc": "bmi",
    "source": "playwright-mcp"
  }
}
```

## 期望返回

```json
{
  "status": "draft",
  "id": "DRAFT-2025-001",
  "review_url": "https://linear.app/.../issue/DRAFT-1",
  "reviewer_hint": "QA"
}
```

## 流程

1. AI 生成草稿 → 进入人类审批队列（Slack 通知）。
2. 人类在 24 小时内 review。
3. 通过 → `linear.create_issue` 真正落地（approve 等级）。
4. 写一条 `decision-log` 记录。

> 严禁 AI 直接 approve 自己的草稿。
---