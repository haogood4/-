---
project: calculator-site
doc_id: ops/event-dict
type: sop
domain: ops
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: FE + 数据
last_updated: 2025-01-01
---

# GA4 事件字典（标准字段）

| event_name | trigger | 必传参数 |
|---|---|---|
| `calc_view` | 进入计算器页面 | `calculator_id`, `category` |
| `input_change` | 输入值变化 | `calculator_id`, `field_name` |
| `input_error` | 校验失败 | `calculator_id`, `field_name`, `error_code` |
| `calc_submit` | 点击计算按钮 | `calculator_id` |
| `calc_complete` | 结果计算成功 | `calculator_id`, `latency_ms` |
| `result_copy` | 复制结果 | `calculator_id` |
| `result_share` | 分享 | `calculator_id`, `method` |
| `cross_tool_click` | 点击相关工具 | `from_id`, `to_id` |
| `disclaimer_view` | 免责声明曝光 | `calculator_id` |
| `disclaimer_expand` | 展开免责声明 | `calculator_id` |

## 参数规范

- `calculator_id` 必须与 `03-formulas/` 中的 YAML ID 一致。
- `category` ∈ {finance, health, daily, math}。
- `latency_ms` 是计算耗时（端到端）。
- `method` ∈ {native_share, copy_url, image, wechat, weibo, other}。

## 隐私

- 不上报用户输入值（如贷款金额、身高）。
- 不存储 IP、用户标识。

---