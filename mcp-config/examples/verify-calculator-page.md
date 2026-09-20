# 示例：用 Playwright MCP 验证房贷计算器页面

```json
{
  "tool": "playwright.navigate",
  "args": {
    "url": "https://staging.example.com/finance/mortgage",
    "viewport": {"width": 390, "height": 844},
    "userAgent": "iPhone"
  }
}
{
  "tool": "playwright.screenshot",
  "args": { "name": "mortgage-mobile-fold" }
}
```

## 接下来

```json
{
  "tool": "playwright.fill_dry_run",
  "args": {
    "selector": "input[name='loan_amount']",
    "value": "1000000"
  }
}
{
  "tool": "playwright.fill_dry_run",
  "args": {
    "selector": "input[name='annual_rate']",
    "value": "4.2"
  }
}
{
  "tool": "playwright.fill_dry_run",
  "args": {
    "selector": "input[name='loan_years']",
    "value": "30"
  }
}
{
  "tool": "playwright.click_dry_run",
  "args": { "selector": "button[data-action='calculate']" }
}
{
  "tool": "playwright.get_text",
  "args": { "selector": "[data-result='monthly_payment']" }
}
```

## 期望输出

```
¥4,887.49
```

## 若失败

- 截图保存到 `06-testing-compliance/screenshots/`。
- 通过 `playwright.assert` 校验渲染。
- 给 Linear MCP 创建 Bug 任务（propose 等级）。
---