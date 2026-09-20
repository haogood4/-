---
project: calculator-site
doc_id: mcp/wf-incident
type: workflow
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 工作流 · 异常事件响应

## 触发

- Sentry 高频错误
- GA4 流量异常下跌 > 30%
- GSC 收录下跌 > 30%
- 用户投诉邮件

## 步骤

```
1. sentry.list_issues  ← 定位异常
   ↓
2. github.get_file  ← 定位代码版本
   ↓
3. playwright.navigate + screenshot  ← 复现
   ↓
4. linear.create_issue_draft  ← 创建修复任务（含复现 / 截图 / 建议修复）
   ↓
5. slack / 邮件通知 PM + 技术负责人
   ↓
6. 修复 PR → merge → deploy → 监控 24h
   ↓
7. 写入 risk-register.md（如新风险）
```

## 等级要求

| 事件 | 行动 | 等级 |
|---|---|---|
| 公式错误 | 立即回滚 + 公告 + 修复 | approve（人工） |
| 服务挂 | 回滚到上一个稳定 release | approve |
| 数据泄露 | 立刻下线 + 通知法务 | approve |
| 单条 Sentry | 转 backlog | propose |

## 失败处理

- MCP 全挂：使用人工 on-call。
- 紧急修复 PR：必须由 Tech Lead 在审批队列中通过。

---