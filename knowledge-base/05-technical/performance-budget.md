---
project: calculator-site
doc_id: tech/perf-budget
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
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

JS 卡口口径：`scripts/check-bundle-size.mjs` 统计 `dist/` 全部 `.js` 的 gzip 总和（即所有页面脚本之和，含共享 chunk）。

| 资源 | 预算（gzip） | 当前实测（2026-09-20 构建） |
|---|---|---|
| 全站 JS | **≤ 100KB 硬限**（CI 卡口）；**65KB 软红线**（越过即须治理） | 60.37KB ✅ |
| 全站 CSS | **≤ 30KB 硬限**（CI 卡口） | 6.40KB ✅ |
| 单页 JS（含懒加载） | ≤ 200KB | 单页仅 1 个页面脚本 + 共享 kit chunk |
| 图片（首屏） | ≤ 80KB / 张 | og-image 除外（非渲染关键路径） |

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

- 架构：零框架水合、零运行时第三方依赖；交互仅靠 esbuild 预打包的页面脚本。
- JS：跨页共享样板提取为单一 `kit-[hash]` chunk（浏览器跨页缓存）；新脚本必须走 `public/scripts/` 预打包管线，禁止内联。
- CSS：单文件设计 token（`global.css`，gzip 6.4KB）；禁止内联样式。
- 缓存：`/_astro/*` 与 `/scripts/kit-*` 一年 immutable 强缓存；HTML 协商缓存。
- CDN：Cloudflare Pages 边缘缓存。

## 监控

- `pnpm verify` 内置 `bundle:check`（`scripts/check-bundle-size.mjs`）：PR/部署前自动跑，作为**实验室口径**的 JS/CSS 体积硬卡口（100KB / 30KB）。
- `scripts/smoke-dist.mjs`：构建产物 12 组断言（页数、CSP 红线、a11y、JSON-LD 等），守住渲染关键路径。
- Sentry Performance 未接入：**线上口径**（RUM p75）暂无数据源，待正式域名上线接入后按 p75 汇报；每周 SEO 报告附带性能趋势。

---

## 修订记录

- 2026-09-20 v1.1.0：资源预算对齐实际——JS 100KB 硬限 + 65KB 软红线（当前 60.37KB）、CSS 30KB 硬限（当前 6.40KB）；优化手段与监控按零水合静态架构 + esbuild 预打包管线 + bundle:check 卡口重写。
