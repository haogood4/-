---
project: calculator-site
doc_id: mcp/wf-content-update
type: workflow
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: SEO + PO
last_updated: 2025-01-01
---

# 工作流 · 内容更新（FAQ / 法规）

## 触发

- LPR 利率更新（每年 / 季度）
- 节假日表变化
- 新政策 / 新法规
- YMYL 定期复核

## 步骤

```
1. web-search.fetch  ← 获取权威来源（央行 / 税务总局）
   ↓
2. 在 04-seo-content/ 起草 FAQ / 段落
   ↓
3. github.create_pr_draft  ← 提交 PR（propose）
   ↓
4. SEO + 公式审核人 review
   ↓
5. merge（approve）→ 自动部署
   ↓
6. gsc.urlInspection.index.inspect  ← 重新抓取
   ↓
7. 在 Notion 写决策日志条目
```

## 注意事项

- 涉及税务 / 利率 / 健康阈值 → 必须人工审核。
- 不修改已 `human-verified` 的 YAML，除非走 RFC。
- 必须在 PR 中引用 `web-search.fetch` 的结果链接。

---