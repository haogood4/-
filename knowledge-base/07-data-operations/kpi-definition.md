---
project: calculator-site
doc_id: ops/kpi
type: sop
domain: ops
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: PM
last_updated: 2025-01-01
---

# KPI 定义

## 用户指标（GA4）

| 指标 | 定义 | 目标 |
|---|---|---|
| UV | 独立访客数 | — |
| PV | 页面浏览量 | — |
| 新用户占比 | new / total | 健康流量结构 |
| 跳出率 | 单页会话占比 | < 60% |
| 平均停留时间 | engagement time | > 60s |
| 设备占比 | mobile vs desktop | 移动 > 70% |

## 工具指标（GA4 事件）

| 指标 | 定义 | 目标 |
|---|---|---|
| `calc_view` | 进入计算器页 | — |
| `calc_submit` | 用户点击"计算" | — |
| `calc_complete` | 成功得到结果 | ≥ 60% / calc_view |
| `input_error` | 校验失败 | < 10% / calc_submit |
| `result_copy` | 复制结果 | — |
| `result_share` | 分享 | — |
| `cross_tool_click` | 点击关联工具 | — |

## SEO 指标（GSC）

| 指标 | 定义 | 目标 |
|---|---|---|
| 收录页 | indexed pages | 上线 +30 天 ≥ 200 |
| 平均排名 | position | 主关键词 ≤ 10 |
| 展现 | impressions | 月环比 +20% |
| 点击 | clicks | CTR ≥ 4% |
| 外链 | referring domains | ≥ 30 |

## 变现指标

| 指标 | 定义 | 目标 |
|---|---|---|
| AdSense RPM | 千次展示收入 | ≥ $1.5 |
| CTR | 广告点击率 | 1%–3% |
| LTV | 终身价值（暂以 UV 估） | — |

---