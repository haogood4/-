# 内容营销博客 P1 实施 Spec

## Why

[`content-direction-strategy.md`](../../../docs/content-direction-strategy.md) v1.0.0 将「D 资讯博客」评为 **P1（3.45 分）**：中合规风险 + 中实施难度 + 高搜索需求（政策解读 / LPR / 个税 / 医保） + 强时效性补 SEO 长尾缺口。A 知识库（已交付）与 B 场景 Hub（已交付）解决"概念解释与决策路径"，但**新闻型、政策型、热点型检索流量未被覆盖**——这是搜索大盘占比 30%+ 的稳定来源。

本 spec 在 A/B 已建立的 Content Collections 基础设施上扩展，新增「博客（news）」类别，与「知识库（article）」并列输出。

## What Changes

- **BREAKING（无）**：纯内容扩展，复用既有 Astro 7 + Content Collections + marked 同步数据模式
- **BREAKING（数据）**：在 `src/data/articles.ts` 中新增 `category === 'blog'` 的文章条目（与 article 共存同一列表）
- 新增 `src/styles/global.css` 博客专属样式（`.article-card--blog` 时间线/置顶样式）
- `src/pages/articles-list.astro` 增加"博客"分组（按发布时间倒序）
- `src/pages/articles/[slug].astro` 增加 BlogPosting JSON-LD 分支
- `src/components/SiteHeader.astro`「内容」下拉菜单新增"政策资讯"入口（指向 `/?cat=blog` 锚点）
- `docs/content-calendar-blog.md` 新增 12 周博客排期表

## Impact

- Affected specs：
  - `content-knowledge-base`（已交付的 A）—— 共用同一数据源与详情模板
  - `content-scenario-hubs`（已交付的 B）—— 共用导航菜单
  - `predeploy-checklist` —— 需新增「博客合规声明」检查项
- Affected code：
  - `src/data/articles.ts`（新增 6 篇 blog 条目）
  - `src/content/articles/*.md`（新增 6 篇 Markdown）
  - `src/pages/articles-list.astro`（分组显示）
  - `src/pages/articles/[slug].astro`（BlogPosting JSON-LD）
  - `src/components/SiteHeader.astro`（导航）
  - `src/styles/global.css`（样式）
  - `docs/content-calendar-blog.md`（新增）
- 不受影响：52 工具页 / 计算逻辑 / 设计令牌 / 部署脚本

## ADDED Requirements

### Requirement: 博客分类与 A/B 区分

系统 SHALL 在现有 `articles` 数据模型中通过 `category: 'blog'` 区分博客文章，与 `category: 'article'` 的知识库并存。同一详情页模板，但渲染差异：

- 详情页 H1 下显示「发布日期 + 阅读时长 + 政策来源」
- 详情页顶部红色横幅：「政策资讯 · 仅供参考，不构成专业建议」
- 详情页底部增加「资讯有效期」声明（≥180 天有效）
- 列表页博客分组按 `publishedAt` **降序**（新闻型），知识库分组按 `tools` 数量降序

### Requirement: BlogPosting JSON-LD

当 `category === 'blog'` 时，详情页 SHALL 注入 BlogPosting schema（替代默认 Article），必含字段：`@type: 'BlogPosting'`、`datePublished`、`dateModified`、`author`、`publisher`、`keywords`、`articleSection: 'policy-news'`。

#### Scenario: 政策资讯页面被 Google News 收录

- **WHEN** 抓取 `/articles/<blog-slug>/`
- **THEN** HTML head 含 `<script type="application/ld+json">` 内 `@type: 'BlogPosting'` 完整字段
- **AND** 页面顶部"政策有效期"声明可见

### Requirement: 首批 6 篇博客选题

| # | 标题 | 关键词目标 | 来源 | 关联工具 |
|---|---|---|---|---|
| 1 | 2026 年 9 月 LPR 报价出炉：你的房贷利率变了吗 | LPR 2026 9 月 / 房贷利率 调整 | 中国人民银行官网 / 央行月度公告 | mortgage-cn, equal-installment-cn, prepayment-cn |
| 2 | 2027 个税年度汇算清缴手册：7 项专项附加扣除填报详解 | 个税年度汇算 / 专项附加扣除 填报 | 国家税务总局公告 | income-tax-cn, bonus-tax-cn |
| 3 | 医保个人账户改革落地：2026 年起这 5 类变化与你相关 | 医保改革 2026 / 医保个人账户 | 国家医保局文件 | social-insurance-cn, income-tax-cn |
| 4 | 存量房贷利率批量调整常见 10 问 | 存量房贷 利率调整 / 转按揭 | 央行 + 银保监会答记者问 | mortgage-cn, prepayment-cn |
| 5 | 个人养老金账户全面落地：开户、缴费、抵税、领取全流程 | 个人养老金 2026 / 个人养老金 税收优惠 | 人社部 + 财政部 + 税务总局 三部门公告 | pension-cn, income-tax-cn |
| 6 | 跨境电商出口退税新规：2026 年小规模纳税人免征额提高 | 跨境电商 出口退税 / 跨境电商 小规模 | 财政部 + 税务总局公告 | cross-border-profit-cn, amazon-fba-cn |

每篇 ≥1200 字、≥2 个工具内链、≥3 FAQ、**强制声明**：「本文为政策资讯整理，仅供参考，请以官方公告为准」。

### Requirement: 时效性管理

博客 SHALL 含 `expiresAt` 字段（ISO 日期），详情页距今 > 180 天时：
- 顶部横幅由红色"政策资讯"变为黄色"政策可能已更新" + 跳转最新文章
- JSON-LD 增加 `expires` 字段
- sitemap 中该 URL `<priority>` 从 0.8 降为 0.5

### Requirement: 博客与知识库互链

每篇博客 SHALL 在文末"延伸阅读"区推荐 ≥1 篇相关知识库文章（来自 `relatedArticles` 字段），形成"新闻 → 概念解释 → 工具使用"的链路。

## MODIFIED Requirements

### Requirement: 列表页分组（`articles-list.astro`）

既有列表页 SHALL 在原有「知识库」分组后新增「政策资讯」分组，使用时间线样式（日期 + 时间戳前缀），且支持按年份折叠（2026/2025）。

### Requirement: 导航菜单（`SiteHeader.astro`）

既有 CONTENT_ITEMS SHALL 在「知识库」下新增「政策资讯」子项（路由 `/articles-list/?cat=blog`）。

### Requirement: 内容日历（`content-calendar-blog.md`）

新增 `docs/content-calendar-blog.md`，含 12 周（首期）排期表，列：周次、发布日、标题、分类、来源、负责人、状态。

## REMOVED Requirements

无（纯内容扩展）。

---

## KPI 监测（上线 30/60/90 天）

| 指标 | 基线 | 30 天目标 | 60 天目标 | 90 天目标 |
|---|---|---|---|---|
| 博客文章数 | 6 | 10 | 16 | 24 |
| 资讯类关键词覆盖 | 0 | 30 | 80 | 150 |
| 资讯页停留时长 | — | ≥45s | ≥50s | ≥55s |
| 资讯→工具 CTR | — | ≥5% | ≥8% | ≥10% |
| 资讯→知识库 CTR | — | ≥3% | ≥5% | ≥8% |

## 合规风险

- **中**：所有政策类文章须在首段声明「仅供参考、不构成专业建议」；禁止使用"权威""独家""首发"等新闻资质敏感词
- **时效性**：政策类文章 180 天后自动加过期警示
- **来源标注**：每篇须 ≥1 个官方来源（gov.cn / 央行 / 税局 / 医保局 / 银保监会）