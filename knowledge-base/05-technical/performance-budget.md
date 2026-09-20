---
project: calculator-site
doc_id: tech/perf-budget
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 性能预算

## 口径说明

性能指标区分两类测量口径，**分别考核、不得混用**：

- **实验室口径**：在受控环境（Lighthouse / 本地构建，移动端仿真 + Slow 4G 网络）下测量，用于开发回归与 CI 卡口。
- **线上口径**：基于真实用户监控（RUM）数据的第 75 百分位（p75），用于衡量线上真实用户体验。

实验室达标不等于线上达标；上线考核以线上口径为准。

## 实验室口径（Lighthouse / 本地构建测量）

### Core Web Vitals

| 指标 | 目标（移动端仿真 + Slow 4G） |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| TTFB | ≤ 800ms |

### 资源预算

| 资源 | 预算（gzip） |
|---|---|
| 首屏 JS | ≤ 100KB |
| 首屏 CSS | ≤ 30KB |
| 单页 JS（含懒加载） | ≤ 200KB |
| 图片（首屏） | ≤ 80KB / 张 |

## 线上口径（RUM / 真实用户第 75 百分位）

| 指标 | 目标（p75） |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |

## 「页面加载 < 3 秒」定义

"页面加载 < 3 秒"指：在约定测试条件（**中端移动设备 + Slow 4G 网络**）下，**核心表单可见且可操作 < 3 秒**。

注意：这不是全页资源加载完成的时间。统计口径为用户可开始与核心表单交互的时刻，对应上述 LCP 与可交互性指标的综合表现，不以全量资源下载完成为准。

## 优化手段

- 图片：WebP / AVIF；`loading="lazy"`；首屏关键图 `priority`。
- 字体：`font-display: swap`；自托管子集化字体。
- JS：路由级 code-splitting；动态 `import()`。
- CSS：Tailwind purge。
- CDN：Cloudflare 边缘缓存 + Brotli。

## 监控

- Lighthouse CI：PR 自动跑，作为**实验室口径**卡口（含资源预算校验）。
- Sentry Performance：采集真实用户 INP / LCP，作为**线上口径**（p75）数据来源。
- 每周 SEO 报告附带性能趋势，按两类口径分别汇报。

---
