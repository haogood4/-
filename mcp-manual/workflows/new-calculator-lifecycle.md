---
project: calculator-site
doc_id: mcp/wf-new-calc
type: workflow
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: PO + BE
last_updated: 2025-01-01
---

# 工作流 · 新计算器全生命周期

## 1. 调研

- `web-search.search`：竞品 / 法规 / 关键词
- `04-seo-content/keyword-bank/`：确认主关键词

## 2. 立项

- 创建 Linear 任务（propose）
- 创建 Notion 需求页（propose）

## 3. 公式建库

- 在 `03-formulas/{domain}/{slug}.yaml` 起草
- 用 `web-search.fetch` 复核来源
- 至少 5 个 test_vectors

## 4. 审核（必经）

- 公式审核人 review
- PR 通过 GitHub MCP 提交（propose）
- CI 全绿 + reviewer 通过 → merge（approve）

## 5. 实现

- `lib/calculators/{slug}.ts`
- `app/{category}/{slug}/page.tsx`
- 配套单元测试与 E2E

## 6. 验证

- `playwright.fill_dry_run` + `click_dry_run` 跑 smoke
- 截图归档到 `06-testing-compliance/screenshots/`
- `playwright.assert` 校验结果与 YAML test_vectors 一致

## 7. 上线

- PR 合并到 main
- Vercel 自动部署（CI 控制）
- `gsc.sitemaps.submit_draft` 提交新 URL
- 监控 24 小时

## 8. 复盘

- 1 周后拉 GA4 完成率与跳出率
- 写入月度报告
- 公式 / 文案微调进入下一轮

---