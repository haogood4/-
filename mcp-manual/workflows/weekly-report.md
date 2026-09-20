---
project: calculator-site
doc_id: mcp/wf-weekly-report
type: workflow
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: PM + SEO
last_updated: 2025-01-01
---

# 工作流 · 每周自动周报

## 触发

- 时间：每周一 09:00（本地时区 Asia/Shanghai）。
- 触发者：cron / GitHub Actions 通知 AI。

## 步骤

| 步骤 | 调用 | 等级 |
|---|---|---|
| 1. 拉本周流量 | `ga4.runReport` | read |
| 2. 拉自然搜索表现 | `gsc.searchanalytics.query` | read |
| 3. 拉本周完成事件 | `ga4.runReport` | read |
| 4. 拉本周 Sentry 异常 | `sentry.list_issues` | read |
| 5. 拉本周打开的 Bug | `github.list_issues` | read |
| 6. 拉本周完成 / 过期任务 | `linear.list_issues` | read |
| 7. 填入周报模板 | `notion.create_page_draft` | propose |
| 8. 通知 PM 审批 | Slack / 邮件 | propose |

## 输出

- Notion 草稿：`/reports/weekly/2025-W03`
- Slack 摘要：贴 Notion 链接

## 失败处理

- GA4 超时 → 重试 1 次；失败则写入 `incident log`。
- GSC 403 → 检查 OAuth。
- Notion 写入失败 → 退回 Markdown 文件 + 邮件给 PM。

---