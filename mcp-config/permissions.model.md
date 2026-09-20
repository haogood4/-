---
project: calculator-site
doc_id: mcp/permissions
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# MCP 三级权限模型

| 等级 | 含义 | 触发机制 |
|---|---|---|
| `read` | 自动允许读取 | 直接调用 |
| `propose` | AI 可生成草稿 | 调用返回"草稿 + diff"，由人类在 UI 中确认后落地 |
| `approve` | 必须人工审批 | 调用进入"待审批队列"，由具备权限的人类点击同意后执行 |

## 工具 → 等级映射

| 工具 | read | propose | approve |
|---|---|---|---|
| GitHub | 读代码、Issue、PR、CI | 创建 Issue 草稿、PR 草稿 | 合并 main、删 branch、release |
| Linear | 读任务 | 创建 / 更新任务 | 删除任务、关闭里程碑 |
| Notion | 读文档 | 创建页 / 更新草稿 | 删除页 / 永久归档 |
| Postgres | 读表 | INSERT 草稿到 staging | UPDATE/DELETE 生产表 |
| Playwright | 自动跑测试 | 录屏、上传截图 | 修改生产页面 |
| Web Search | 搜索 | — | — |
| GA4 | 读取指标 | — | — |
| GSC | 读取指标 | 提交 sitemap 草稿 | 主动请求编入索引 |
| Sentry | 读 issue | 添加评论 | 关闭 issue / 删除 |

## 黑名单（任何等级都不允许开放）

- 生产数据库的 UPDATE / DELETE / DROP
- 任何 API Key、支付密钥、加密密钥
- 用户个人身份数据导出
- 没有审计日志的自动发布

## 审批工作流

```
AI propose → 生成 draft（JSON diff / Markdown） → 进入 PR 或审批队列
  → 人类在 24 小时内批准 / 拒绝
    → 通过：执行；记录到 mcp-audit.log
    → 拒绝：归档为 issue 草稿
```

## 审计

- 所有 `approve` 操作写入 `mcp-audit.log`：
  ```
  { timestamp, actor=AI, action=approve_trigger, target, approved_by, request_id }
  ```
- 每月审计一次。
---