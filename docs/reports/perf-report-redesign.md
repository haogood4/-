---
project: calculator-site
doc_id: docs/reports/perf-report-redesign
type: report
domain: performance
locale: zh-CN
version: v1.0.0
status: final
last_updated: 2026-09-19
owner: Eng
---

# 性能测试报告 —— 前端 UI/UX 重设计（redesign-frontend-uiux）

**日期**：2026-09-19 · **构建**：`pnpm build`（52 页，1.03s，无报错）· **统计方式**：node 读取 `dist/` 实测，gzip level 9。

**测试环境**：Chromium（浏览器代理）+ `astro preview` @ 127.0.0.1:4321。
**指标性质声明**：本机无 Chrome，无法运行真实 Lighthouse/PageSpeed Insights（需部署公网后补测）。本报告为**传输量代理指标**（字节数 + 3G 推算），非 Lighthouse 分数。

## 1. 实测数据（重设计后）

| 资源 | 文件 | 未压缩 | gzip |
| --- | --- | --- | --- |
| 首页 HTML | `dist/index.html` | 13,384 B | **3,765 B** |
| 全站 CSS | `dist/_astro/BaseLayout.R_K40_bW.css` | 17,251 B | **3,732 B** |
| 菜单脚本 | `dist/menu.js` | 3,076 B | **1,534 B** |
| SW 注册脚本 | `dist/register-sw.js` | 410 B | 337 B（body 末尾异步，不阻塞 FCP） |
| Favicon | `dist/favicon.svg` | 723 B | 284 B |
| **关键路径合计（HTML+CSS+menu.js+favicon.svg）** | — | **34,434 B（33.6 KiB）** | **9,315 B（9.1 KiB）** |

## 2. 前后对比（基线为重设计前实测值）

| 指标 | 重设计前（基线） | 重设计后 | 变化 | 判定 |
| --- | --- | --- | --- | --- |
| 首页 HTML gzip | 4,013 B（无 header 版） | 3,765 B | −248 B（−6.2%） | ↓ 更优 ✓ |
| CSS gzip | 1.99 KB | 3.73 KB | +1.74 KB | 预算内 ✓ |
| 首页 JS | 0 | menu.js 1.53 KB gzip（新增）+ register-sw.js 0.33 KB（既有） | +1.53 KB 新增 | 预算内 ✓ |
| 关键路径（gzip） | ~5 KB | 9.32 KB | +4.3 KB | 预算内 ✓ |

## 3. 预算判定（对照 spec「性能预算」需求）

| 预算项 | 阈值 | 实测 | 判定 |
| --- | --- | --- | --- |
| CSS gzip | ≤15 KB（硬上限 30 KB 门禁不变） | 3.73 KB | **✓**（余量 75%） |
| 新增 JS gzip（仅菜单脚本） | ≤2 KB | 1.53 KB | **✓** |
| 关键路径 gzip（HTML+CSS+必要 JS+favicon） | ≤25 KB | 9.32 KB | **✓** |
| 网络字体/位图装饰 | 0 | 0（system-ui 字体栈；装饰为内联 SVG） | **✓** |
| bundle:check 门禁（JS≤100KB、CSS≤30KB） | 通过 | 未压缩 CSS 17.25 KB / JS 合计 3.5 KB | **✓** |

## 4. 3G 推算（FCP 估算）

按任务约定公式：`总传输 × 8 bit ÷ 400 kbps + RTT 500 ms`

- 总传输（关键路径 gzip）= 9,315 B → 74,520 bit
- 下载耗时 = 74,520 ÷ 400,000 ≈ **186 ms**
- FCP 估算 ≈ 186 ms + 500 ms（RTT，含 DNS/TLS 简化计一次往返）≈ **0.69 s**
- 判定：**< 2 s ✓**（阈值余量大）

## 5. 结论与遗留

- 重设计在 CSS +1.74 KB、新增 1.53 KB JS 的代价下，三项预算全部通过且余量充足；HTML 反而瘦身 6.2%。
- 真实 Lighthouse / PSI（FCP、CLS、LCP 实测分）**待部署公网后补测**；本报告数字均为本机 `dist/` 实测，未虚构任何 Lighthouse 分数。
