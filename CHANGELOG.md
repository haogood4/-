# 更新日志

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式与 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 待人工处理

- legal 三页（隐私政策/用户协议/免责声明）法务审核；通过后移除 noindex 并同步 sitemap filter（P1-10）
- 暗色模式方案批复（P1-7，第一期纯 CSS 方案已产出）
- 初始化 Git 仓库并推送 GitHub，跑通 CI 首次运行

### 验证

- 浏览器代理实测通过（P1-6b 关闭）：IRR/年化/年龄计算、收藏与最近使用闭环、搜索、迁移页抽查、console 无错误
- DoD 审计（第三节 24 项验收标准）：32 页 FAQ 补足至 ≥3 条、5 个金融/健康页补「仅供参考」声明，门槛固化进冒烟断言
- SEO 巡检：40 页 title/description 差异化重写（消除「X — 在线 X」模板同质化）、40 页相关工具内链补足至 ≥3（51/51 复检通过），desc 长度与内链数固化进冒烟断言 4；4 篇文章尾部补「相关工具」CTA，11/11 文章工具内链 ≥2
- 性能巡检：产物健康（HTML 最大 17KB、全 SVG 无位图、系统字体、SW 策略合理）；`_headers` 为 `/scripts/kit-*` 共享 chunk 补一年 immutable 强缓存
- 结构化数据深化：51 计算器页与 11 文章页新增 BreadcrumbList JSON-LD（全站 114→176 块），smoke 断言 10 升级双守卫（总块数 ≥175 + BreadcrumbList ≥62）

## [0.1.0] - 2026-09-20

首个可部署版本：全站功能 + AI 自主改进专项（P0/P1/P2 可自主项全部完成）。

### 新增

- 51 个在线计算器（金融理财/健康/装修/投资/效率/日常六大类）、11 篇知识库文章、5 个场景指南 Hub
- 站内搜索（P2-9）：构建期 `search-index.json`（67 条）+ 前端分词匹配（AND 优先/OR 回退/加权排序），`/search/` 页 noindex
- 收藏与最近使用（P2-10）：`src/lib/tool-store.ts`（localStorage、损坏数据与隐私模式兜底）+ 计算器页收藏按钮注入 + 首页「我的工具」区块
- JSON-LD 结构化数据（P1-9）：全站 114 块——计算器页 SoftwareApplication + FAQPage（`CalcJsonLd.astro`）、首页 WebSite、文章 Article/BlogPosting
- RSS feed（P2-12）：`/rss.xml` 11 条按更新倒序，全站 `<link rel="alternate">` 可发现
- 404 页、Web App Manifest、严格 CSP（`script-src 'self'`）+ `nosnippet` 等安全响应头（`public/_headers`）
- legal 三页骨架（noindex 草稿，待法务）
- 质量工具链：ESLint flat config（0 error 门禁）、Prettier、vitest 271 用例、组件 container 测试（P2-11）、`pnpm bundle:check` 体积门禁、`scripts/smoke-dist.mjs` 10 组产物冒烟断言
- CI（P1-4）：GitHub Actions 执行 verify + build + 冒烟 + 关键产物存在性检查

### 变更

- JS 体积去重专项（P2-8）：51 页交互样板收敛至共享 `src/scripts/_page-kit.ts`，esbuild esm+splitting 统一外置管线；JS gzip 68.36 → 59.75KB（重回 65KB 软红线内）
- 首页分类导航与文章/指南计数改为数据源构建期生成（`src/data/nav.ts` 唯一来源，P2-13）
- sitemap 排除 noindex 页（legal/搜索页），并新增「noindex 页不得进 sitemap」冒烟守卫

### 修复

- Astro 7 内联脚本 bug 触发 CSP 拦截：9 个受影响页面脚本外置（workaround，Astro 修复后按 P3-15 回归）
- IRR/年化收益率页结果恒空（`as any` 债务清理时发现的真 bug，P1-6）
- SiteFooter 死锚点、404 页缺失 `id="main"`、legal 页误入 sitemap、`pnpm verify` corepack 假绿等 6 项（P1-8 冒烟捕获）

### 移除

- 全部 `as any`（33 → 0）与一次性 codemod 遗留死代码
