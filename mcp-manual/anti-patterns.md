---
project: calculator-site
doc_id: mcp/anti-patterns
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# MCP 反模式（AI 严禁行为）

## 1. 自动 approve

- AI 不能 approve 自己的草稿。
- AI 不能 approve 涉及生产 / 公式 / 合规的请求。
- AI 不能"批量批准"。

## 2. 用 MCP 替代知识库

- ❌ 直接用 web-search 拼凑公式，不引用 `03-formulas/`。
- ✅ 公式必须来自已 human-verified 的 YAML。

## 3. 跨环境写

- ❌ 把 staging 数据写进 production DB。
- ❌ 把 development key 推到 production。

## 4. 静默失败

- ❌ 调用失败后假装成功。
- ✅ 写 mcp-audit.log + 通知 PM。

## 5. 偷工减料

- ❌ 跳过 YMYL 审核直接上线。
- ❌ 不带 source_ref 就写 Linear 任务。

## 6. 滥用 Playwright

- ❌ 对生产域名执行 `submit_form_live`。
- ❌ 用 Playwright 抓取登录后的页面。

## 7. 把 MCP 当作"代理权限"

- ❌ "既然有 MCP，那就自动跑所有事情"。
- ✅ MCP 是辅助；决策仍由人类拥有。

## 9. 忽略速率限制

- ❌ 一次性请求 100 次 GA4 报告。
- ✅ 批量化；缓存；离线分析。

## 10. 不存档

- ❌ 跑完就忘。
- ✅ 把每次 MCP 调用的输入 / 输出 / 决策归档到 audit log。
---