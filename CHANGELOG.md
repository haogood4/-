# 更新日志

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式与 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

- P2 批次 8 个物理量换算器（/unit/ 下，站点 94→102 个）：功率换算（power，W/kW/公制马力 PS/英制马力 hp 等 9 单位，1 PS = 735.49875 W）、压力换算（pressure，Pa/kPa/MPa/bar/atm/psi/mmHg/kgf·cm² 等 8 单位）、能量换算（energy，J/kJ/cal/kcal/Wh/kWh/BTU 等 8 单位）、角度换算（angle，度/弧度/梯度/角分/角秒/圈 6 单位）、频率换算（frequency，Hz~GHz/rpm）、力换算（force，N/kgf/lbf/dyn 等 8 单位）、密度换算（density，kg/m³/g/cm³/lb/ft³ 等 6 单位）、流量换算（flow，L/s/L/min/m³/h/gal/min/CFM 等 7 单位）；全部复用 factor-convert 换算工厂（换算因子为精确物理定义），新增 8 引擎 + 132 个单测用例（全站 1160 用例）；纯物理换算无 YMYL 政策核对负担；全站 JS 护栏按预埋决策点由 120KB 上调至 130KB（数据内联回归护栏语义，每页实载仍 ~1.1KB）
- P6 批次 9 个劳动法/福利类工具（全部 /finance/ 下，站点 85→94 个）：加班费计算器（overtime-pay-cn，劳动法第 44 条 150%/200%/300%、月计薪天数 21.75）、高温津贴计算器（heat-subsidy-cn，内置 12 省 2026 公开标准预设 + 自定义）、生育津贴计算器（maternity-allowance-cn，月均缴费工资÷30×计发天数、98+难产15+多胞胎15/婴、天数可覆盖各省）、产假工资计算器（maternity-leave-pay-cn，98 天基础 + 各省奖励假预设广东 80/鲁京沪浙 60）、公积金贷款计算器（housing-fund-loan-cn，央行 2025-05-08 利率 首套 2.1%/2.6%、二套 2.525%/3.075%，等额本息）、车险保费计算器（auto-insurance-cn，2026-06-01 交强险新浮动机制 A~E 地区 + 商业险 NCD）、跨行转账手续费计算器（interbank-transfer-fee-cn，发改价格〔2014〕268 号柜台五档 + 电子渠道对照）、信用卡免息期计算器（credit-card-grace-cn，账单日+N 天、闰年跨年精确）、年终奖计税方式对比（bonus-tax-compare-cn，财政部 税务总局公告 2023 年第 30 号单独 vs 并入双口径，政策至 2027-12-31）；新增 9 引擎 + 155 个单测用例（全站 1028 用例）+ 9 份政策核对档案 + 双签登记 DS-202609-11~19
- P5 批次 2 个高敏感度工具：退休年龄计算器（/finance/retirement-age-cn/，依据全国人大常委会 2024-09-13《关于实施渐进式延迟法定退休年龄的决定》+国务院办法附件 1/2/3 对照表，男 60→63、原 55 周岁女→58、原 50 周岁女→55，按每 4/4/2 个月延迟 1 个月节奏渐进；同步返回最低缴费年限 15~20 年）、股票佣金计算器（/finance/stock-commission-cn/，用户输入券商佣金费率与最低起收，按上交所公示 0.01‰ 双向过户费 + 0.5‰ 单边卖方印花税自动测算买卖方向费用与净资金流）；新增 2 个引擎（retirement-age 25 用例 + stock-commission 11 用例）+ 2 个政策核对档案（retirement-age-cn-verification.md / stock-commission-cn-verification.md）+ 双签登记（DS-202609-09 / DS-202609-10）
- P4 批次 5 个换算工具
- 暗色模式第一期（P1-7①）：纯 CSS `@media (prefers-color-scheme: dark)` 覆盖 25 个 token；零 JS、零 CSP 影响、无 FOUC；BaseLayout `<meta theme-color>` 拆为 light/dark 双变体、`color-scheme: light dark`；smoke 断言 12 守 9 组暗色 token 对比度 ≥4.5:1，CSS gzip +0.21KB（6.19 → 6.40KB）。第二期（手动切换开关）仍待人工批复 FOUC + CSP 方案
- P1-7② 手动切换开关技术方案（`docs/dark-mode-toggle-plan.md`，12 节 / 含三态模型 + 三层架构 + CSP/FOUC 分析 + 性能预算 + 风险登记 + DoD + 业内对比），待项目负责人确认 FOUC 与三态决策点后开工
- P1-10 法务审核资料包（`docs/legal-review-package.md`，7 节 / 三页骨架 + 数据流图 + Go/No-Go 清单 + 风险登记 + 上线流程），登记为 DS-202609-08 双签项（P1，2026-09-26 截止）
- P3-15 回归测试计划（`docs/content-collections-regression.md`，9 节 / 触发条件 + 11 步回归 + 性能与端到端验证矩阵 + 回滚预案 + DoD）；新增探针 `scripts/check-astro-fix.mjs` + `pnpm astro:probe` 命令，astro 7.3.3 未达阈值时 silent exit 0

### 变更

- JS 二期瘦身（P6 后）：二维码容量表、ASCII 对照表、高温津贴省份预设外置为 `public/data/*.json`（构建期与运行时同源单文件，页面首次操作 lazy fetch，qr 引擎数据参数化 + normalizeQrTable 类型守卫）；全站 JS brotli 118.51 → 117.72KB，browser 实测三工具 7/7 PASS；brotli 分布审计确认 105 文件最大 3.56KB、96 页平均 ~1.1KB，当前架构已达结构下限

### 待人工处理

- P1-7② FOUC 窗口与三态 vs 二态决策（项目负责人）
- P1-10 legal 三页法务审核（资料包已就位待提交法务部，DS-202609-08，2026-09-26 截止）
- 推送 GitHub 并跑通 CI 首次运行（本地仓库已初始化：main 分支 + 初始提交）

### 验证

- 浏览器代理实测通过（P1-6b 关闭）：IRR/年化/年龄计算、收藏与最近使用闭环、搜索、迁移页抽查、console 无错误
- DoD 审计（第三节 24 项验收标准）：32 页 FAQ 补足至 ≥3 条、5 个金融/健康页补「仅供参考」声明，门槛固化进冒烟断言
- SEO 巡检：40 页 title/description 差异化重写（消除「X — 在线 X」模板同质化）、40 页相关工具内链补足至 ≥3（51/51 复检通过），desc 长度与内链数固化进冒烟断言 4；4 篇文章尾部补「相关工具」CTA，11/11 文章工具内链 ≥2
- 性能巡检：产物健康（HTML 最大 17KB、全 SVG 无位图、系统字体、SW 策略合理）；`_headers` 为 `/scripts/kit-*` 共享 chunk 补一年 immutable 强缓存
- 结构化数据深化：51 计算器页与 11 文章页新增 BreadcrumbList JSON-LD；新建通用 `BreadcrumbJsonLd` 组件并补齐 5 hub 详情 + hub 索引 + 文章列表（全站 114→183 块、69 个面包屑，noindex 页外全覆盖），smoke 断言 10 双守卫升级 ≥182/≥69，组件测试 +1（272 用例）
- Git 仓库本地初始化（main 分支、初始提交 556 文件、.gitignore 生效），为 CI 首跑与版本管理铺路
- GitHub 推送 + CI 首跑全绿：远程 `git@github.com:haogood4/-.git`（main 分支，HEAD=a399012），CI workflow 5 步全过（Install/Verify/Build/Smoke/Assert），后续 push/PR 自动触发回归网
- a11y 巡检专项：smoke 新增第 11 组硬失败守卫（单 h1 / main 锚点 / skip-link / img alt / 表单 label / 按钮与链接可访问命名 / 颜色 token 9 组对比度 ≥4.5:1），基线 75/75 全过、零代码改动
- 文档体系审计与修复（`docs/documentation-audit-report.md`）：技术文档 9 份重写对齐 Astro 实况（architecture/deployment/repo-structure/tech-stack/performance-budget 等），ADR-0001/0002 标记 Superseded 并新建 ADR-0004（Astro 7 + Cloudflare Pages）；PM 六册首次真实回填（issue-register 8 条已解决问题、risk-register 追加 R-015~017、decision-log 6 条决策、milestone 进度、change-log 批次）；calculator-list v1 加废弃横幅；测试数口径 271→272 校准
- 新增需人工干预事项统一登记册（`docs/manual-pending-items.md`，8 项：法务闭环 / 域名 / CF Pages / GitHub 推送 / 统计决策 / 暗色二期批复等）与项目进度报告（`docs/progress-report-20260920.md`：14 阶段中 1–8 完成、处于阶段 11 灰度前置）

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
