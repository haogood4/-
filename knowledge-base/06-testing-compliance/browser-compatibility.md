---
project: calculator-site
doc_id: qa/browser-compat
type: sop
domain: compliance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# 浏览器兼容矩阵

| 浏览器 | 最低版本 | 等级 | 测试方式 |
|---|---|---|---|
| Chrome | 110+ | A | BrowserStack + Playwright |
| Safari (iOS) | 16+ | A | BrowserStack + 真机 |
| Safari (macOS) | 15+ | A | BrowserStack |
| Edge | 110+ | A | Playwright |
| Firefox | 110+ | B | Playwright |
| Android Chrome | 最新 | A | 真机 |
| 微信内置 | 最新 | B | 真机（兼容性优先） |
| 小程序 WebView | — | C | 不主动支持 |

> A = 必测；B = 抽样；C = 不保证。

## 不支持

- IE 全部版本
- Android < 8 的 Chrome
---