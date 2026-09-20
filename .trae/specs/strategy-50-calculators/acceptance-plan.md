# 50 工具矩阵验收与发布计划

> 来源：`.trae/specs/strategy-50-calculators/spec.md`（已批准）。
> 本文档定义总规 spec 的验收清单、5 档上线日的发布 checklist 与监控埋点。
>
> **升级说明**（2026-09-19）：本文档中的发布 checklist 已升级为 [`docs/pre-deploy-checklist.md`](../../../../docs/pre-deploy-checklist.md) v1.0.0（12 类 80+ 检查项 + P0/P1/P2 分级 + GO/HOLD/BLOCKED 决策规则）。本文档保留总体验收清单、5 档发布计划与监控埋点；具体部署前最终检查请使用新清单。

---

## 1. 总体验收清单

### 1.1 定位与合规切换

- [ ] [project-charter-inputs.md](file:///home/arch/项目/计算器网站开发/docs/project-charter-inputs.md) §1 目标市场状态为"已批准事实：大陆中文用户 + PIPL"
- [ ] [market-strategy-cn.md](file:///home/arch/项目/计算器网站开发/docs/market-strategy-cn.md) 存在
- [ ] [privacy-policy.md](file:///home/arch/项目/计算器网站开发/knowledge-base/06-testing-compliance/privacy-policy.md) 切换到 PIPL
- [ ] [terms-of-service.md](file:///home/arch/项目/计算器网站开发/knowledge-base/06-testing-compliance/terms-of-service.md) 管辖法律改为中国大陆
- [ ] [disclaimer.md](file:///home/arch/项目/计算器网站开发/knowledge-base/06-testing-compliance/disclaimer.md) 明示"仅供参考"
- [ ] [revenue-model.md](file:///home/arch/项目/计算器网站开发/docs/revenue-model.md) 切换到百度联盟 / 穿山甲

### 1.2 50 工具裁决

- [ ] [calculator-list-v2.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list-v2.md) 存在
- [ ] 50 个工具逐项裁决（4 态）
- [ ] 命名规范化（中英混排已重命名）

### 1.3 5 档排期

- [ ] [schedule.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/schedule.md) 存在
- [ ] Tier 1-5 工具数 / 工时 / 起讫日 / 验收标准齐全

### 1.4 SEO 关键词库

- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/finance.md` ≥ 30 主词 + 100 长尾
- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/health.md` ≥ 30 主词 + 100 长尾
- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/renovation.md` ≥ 30 主词 + 100 长尾
- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/investment.md` ≥ 30 主词 + 100 长尾
- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/efficiency.md` ≥ 30 主词 + 100 长尾
- [ ] `knowledge-base/04-seo-content/keyword-bank/v2/daily.md` ≥ 30 主词 + 100 长尾

### 1.5 首页与既有工具回写

- [ ] [index.astro](file:///home/arch/项目/计算器网站开发/src/pages/index.astro) 6 大类导航就位
- [ ] 既有 11 工具的 URL 与功能完全保留
- [ ] lead 文案大陆口径

### 1.6 风险矩阵

- [ ] [risk-matrix.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/risk-matrix.md) 存在
- [ ] ≥ 30 项风险登记

### 1.7 工程基线

- [ ] `pnpm verify` 通过
- [ ] bundle 体积 JS ≤ 100KB / CSS ≤ 30KB
- [ ] sitemap.xml 生成
- [ ] robots.txt 配置
- [ ] `_headers` 安全头配置

---

## 2. 5 档上线 checklist（每档上线前）

### Tier 1 上线前

- [ ] 7 个新工具库 + 单测通过
- [ ] 10 个工具的页面 + 脚本就位
- [ ] 草稿标注在金融工具页面显示完整
- [ ] 百度统计 ID 占位（暂时不接入）
- [ ] sitemap.xml 含 10 个新 URL
- [ ] 1 次 `pnpm verify` + `pnpm build` 全绿
- [ ] 1 次本地预览 + 浏览器实测

### Tier 2 上线前

- [ ] 11 个新工具库 + 单测通过
- [ ] 25 个工具的页面 + 脚本就位
- [ ] 装修工具走"装修家居"分类导航
- [ ] 关键词矩阵 `renovation.md` 与工具页面 title/description 对齐
- [ ] sitemap.xml 含 25 个 URL
- [ ] `pnpm verify` + `pnpm build` 全绿

### Tier 3 上线前

- [ ] 4 个新工具库 + 单测通过
- [ ] 健康工具的"医生诊断替代"声明完整
- [ ] YMYL-高工具（预产期、排卵）有显著"参考"标注
- [ ] sitemap.xml 更新

### Tier 4 上线前

- [ ] 10 个投资工具库 + 单测通过
- [ ] 工具页面 lead 显著标注"参考"
- [ ] 关键词矩阵 `investment.md` 同步生成
- [ ] sitemap.xml 更新

### Tier 5 上线前

- [ ] 5 个新工具库 + 单测通过
- [ ] 4 个合并裁决在 calculator-list-v2.md 中链接到既有工具
- [ ] 3 个驳回工具在首页"未上线"声明区说明原因
- [ ] sitemap.xml 更新到 50 个 URL

---

## 3. 发布计划

### Tier 1：2026-10-03

| 时段 | 工作项 |
|---|---|
| T-3 天 | 代码合并到 main；sitemap/robots 更新；`_headers` 部署 |
| T-1 天 | 灰度发布到 10% 流量 |
| **T-0** | **公开访问**（如果域名 + ICP 已就位） |
| T+1 天 | 检查 GSC 索引 |
| T+3 天 | 百度搜索"房贷计算器"等关键词测试排名 |

### Tier 2-5：每档 +3 周

每档采用相同节奏：T-3 / T-1 / T-0 / T+1 / T+3。

---

## 4. 监控埋点

### 4.1 流量统计

| 平台 | ID 占位 | 启用条件 |
|---|---|---|
| 百度统计 | `b9882xxxxxxxxxxxxxxxx`（占位） | 域名 ICP 备案完成后接入 |
| 友盟 Umeng | 待申请 | T+30 评估是否需要 |

### 4.2 错误监控

| 平台 | DSN 占位 | 启用条件 |
|---|---|---|
| Sentry | 待申请 | T+7 启用 |

### 4.3 性能监控

- Lighthouse CI：每次 PR 触发；性能 ≥ 80，无障碍 ≥ 95
- Web Vitals：LCP / INP / CLS 每周聚合

### 4.4 内容 KPI 监测点（2026-09-19 追加）

> 详见 [`docs/content-direction-strategy.md`](../../../../docs/content-direction-strategy.md) v1.0.0 §5 监测机制。

| 指标 | 基线（未知） | 90 天目标 | 12 月目标 |
|---|---|---|---|
| 平均停留时长 | 未知 | ≥60s | ≥120s |
| 跳出率 | 未知 | ≤60% | ≤45% |
| 复访率 | 未知 | ≥15% | ≥30% |
| 工具页点击率（来自内容页） | 0 | ≥8% | ≥20% |
| 长尾关键词覆盖率 | 600+ | 1,000+ | 2,000+ |
| 内容页 SEO 流量占比 | 0 | ≥10% | ≥25% |

**复评节奏**：每月末 PM 收集指标对照；偏差 >30% 触发方向降级；每季度重新评分 5 方向。

---

## 5. 关键里程碑

| 里程碑 | 日期 | 验收标准 |
|---|---|---|
| Tier 1 上线 | 2026-10-03 | 10 个 P0 工具 URL 全部 200 |
| Tier 2 上线 | 2026-10-24 | 25 个工具 URL 全部 200 |
| Tier 3 上线 | 2026-10-31 | 健康长尾上线 |
| Tier 4 上线 | 2026-11-14 | 投资专业上线 |
| Tier 5 上线 | 2026-11-28 | 50 工具矩阵完整 |
| 第一次内容复审 | 2026-12-15 | GSC 数据 review；公式复审 |
| 百度联盟接入 | 待 ICP 完成 | 账户开通 + 嵌入 SDK |
| 盈亏平衡点 | 2027-03 | 月 PV ≥ 100,000 |

---

## 6. 5 档 change-id 引用

- [tier1-finance-health/](file:///home/arch/项目/计算器网站开发/.trae/specs/)（待创建）
- [tier2-finance-renovation/](file:///home/arch/项目/计算器网站开发/.trae/specs/)（待创建）
- [tier3-longtail/](file:///home/arch/项目/计算器网站开发/.trae/specs/)（待创建）
- [tier4-pro/](file:///home/arch/项目/计算器网站开发/.trae/specs/)（待创建）
- [tier5-efficiency/](file:///home/arch/项目/计算器网站开发/.trae/specs/)（待创建）

> 5 份分档 spec 在本总规 spec 批准后产出，各自独立审批与排期。

---

## 7. 关联文档

- [.trae/specs/strategy-50-calculators/spec.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/spec.md)
- [checklist.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/checklist.md)
- [schedule.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/schedule.md)
- [risk-matrix.md](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/risk-matrix.md)
- [calculator-list-v2.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list-v2.md)
