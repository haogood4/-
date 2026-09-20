---
project: calculator-site
doc_id: mcp/manual-github
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# GitHub MCP 使用手册

## 能力

- 读取：仓库代码、Issue、PR、Commits、CI 状态、文件。
- 草稿：创建 Issue 草稿、PR 草稿、PR 评论草稿。
- 审批：合并、发布、删除 branch。

## 何时使用

| 场景 | 工具 | 等级 |
|---|---|---|
| 找本周打开的 Bug | `list_issues` | read |
| 查看某个计算器是否已实现 | `search_code` | read |
| 查 CI 是否挂 | `list_workflow_runs` | read |
| 给 Bug 自动写复现 + 修复思路 | `create_issue_draft` | propose |
| 创建 PR 草稿（含 diff） | `create_pr_draft` | propose |
| 合并 PR | `merge_pull_request` | approve |

## 调用示例

### 读取本周打开的 Bug

```json
{
  "tool": "github.list_issues",
  "args": { "labels": ["bug"], "state": "open", "since": "2025-01-13T00:00:00Z" }
}
```

### 创建修复任务的 PR 草稿

```json
{
  "tool": "github.create_pr_draft",
  "args": {
    "head": "fix/bmi-zero-height",
    "base": "develop",
    "title": "fix(bmi): 拦截身高 ≤ 0",
    "body": "## 背景\n\n…\n\n## 修复\n\n…\n\n## 测试\n\n— tests/unit/bmi.test.ts",
    "files": ["lib/calculators/bmi.ts", "tests/unit/bmi.test.ts"]
  }
}
```

## 安全规则

- **不**自动合并 PR。
- **不**触发 `release.yml`。
- **不**删除 branch，除非有专门的"清理任务"。
- 所有 propose 都必须经过 CI 通过 + 1 名人类 reviewer 通过。
- 涉及 `lib/calculators/**` 的 PR 必须额外 1 名公式审核人。

## 失败时

- API 限速 → 退避重试 ≤ 2 次。
- Token 失效 → 写入 audit log，通知技术负责人。
- CI 挂 → 不创建 PR；在 Issue 评论建议。

---