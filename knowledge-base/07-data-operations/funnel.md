---
project: calculator-site
doc_id: ops/funnel
type: sop
domain: ops
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 数据
last_updated: 2025-01-01
---

# 转化漏斗

```
搜索曝光 (GSC impressions)
  ↓ 点入 (clicks / organic uv)
页面浏览 (calc_view)
  ↓ 开始输入 (input_change)
点击计算 (calc_submit)
  ↓ 计算成功 (calc_complete)
结果互动 (result_copy / result_share)
  ↓ 跳到关联工具 (cross_tool_click)
```

## 关键转化率

| 阶段 | 公式 | 目标 |
|---|---|---|
| CTR | clicks / impressions | ≥ 4% |
| 输入完成率 | calc_submit / calc_view | ≥ 70% |
| 计算成功率 | calc_complete / calc_submit | ≥ 90% |
| 复制率 | result_copy / calc_complete | ≥ 8% |
| 跨工具率 | cross_tool_click / calc_complete | ≥ 10% |

## 优化策略

- 输入完成率低 → 简化字段、默认值合理
- 计算成功率低 → 增强错误提示、给出示例
- 复制率低 → 一键复制按钮、视觉吸引
- 跨工具率低 → 关联推荐更精准

---