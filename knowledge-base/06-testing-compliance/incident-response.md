---
project: calculator-site
doc_id: ops/incident-response
type: sop
domain: compliance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 安全事件响应流程

## 等级

| 等级 | 示例 | 响应时效 |
|---|---|---|
| P0 | 公式错误且被广泛引用 | ≤ 1 小时 |
| P1 | 页面挂掉 / 数据泄露 | ≤ 2 小时 |
| P2 | 性能严重下降 / Sentry 告警激增 | ≤ 8 小时 |
| P3 | 单条 Sentry 异常 | ≤ 24 小时 |

## 流程

```
发现 → Sentry / 用户反馈 / MCP 自动告警
  → 安全负责人评估等级
    → 严重：回滚（vercel rollback）+ 公告
    → 一般：分配到 backlog
    → 关闭：归档
```

## 关键响应脚本

| 事件 | 操作 |
|---|---|
| 公式错误 | 1) 回滚公式 commit；2) 公告；3) 通知 SEO 改 snippet |
| 服务挂掉 | 1) 切回上一个稳定 release；2) 查 Sentry；3) 公告 |
| 数据泄露 | 1) 立刻下线；2) 通知法务；3) 用户公告；4) 报告监管 |
| SEO 处罚 | 1) 查 GSC；2) 审查 content；3) 修正后提交审核 |

## 通讯渠道

- 内部：Slack / 企业微信 #incident
- 外部：站内公告 + 状态页 status.example.com

---