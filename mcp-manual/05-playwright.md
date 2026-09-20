---
project: calculator-site
doc_id: mcp/manual-playwright
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# Playwright MCP 使用手册

## 能力

- 浏览器自动化：导航、截图、获取文本、执行 JS。
- 草稿：填表 + 点击的 dry-run（不真正提交）。
- 审批：生产页面交互、提交表单。

## 何时使用

| 场景 | 工具 | 等级 |
|---|---|---|
| 截图某个页面（移动 / 桌面） | `navigate` + `screenshot` | read |
| 校验 SEO 标签 | `get_attribute` | read |
| 自动化跑计算器 smoke | `fill_dry_run` + `click_dry_run` + `assert` | propose |
| 在生产环境填真实数据 | `submit_form_live` | approve（**默认禁止**） |

## 调用示例：自动 smoke test

```json
{
  "tool": "playwright.navigate",
  "args": { "url": "https://staging.example.com/finance/mortgage", "viewport": {"width":390,"height":844} }
}
{
  "tool": "playwright.fill_dry_run",
  "args": { "selector": "input[name='loan_amount']", "value": "1000000" }
}
{
  "tool": "playwright.fill_dry_run",
  "args": { "selector": "input[name='annual_rate']", "value": "4.2" }
}
{
  "tool": "playwright.fill_dry_run",
  "args": { "selector": "input[name='loan_years']", "value": "30" }
}
{
  "tool": "playwright.click_dry_run",
  "args": { "selector": "button[data-action='calculate']" }
}
{
  "tool": "playwright.assert",
  "args": { "selector": "[data-result='monthly_payment']", "text_matches": "4,887" }
}
```

## 安全规则

- 默认环境：staging。
- 生产域名（example.com）下，所有"写操作"必须 `approve`。
- 截图归档到 `06-testing-compliance/screenshots/{date}/`。
- 不上传真实用户数据到截图。

## 失败时

- 元素找不到 → 检查选择器 + 截图排查。
- 网络 5xx → 自动写入 Sentry；进入 incident 流程。

---