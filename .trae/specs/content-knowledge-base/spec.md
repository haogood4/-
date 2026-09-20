# A 知识库 P0 实施 Spec

## Why

[content-direction-strategy.md](../../../../docs/content-direction-strategy.md) v1.0.0 将「A 知识库」评为 **P0（4.40 分）**：高搜索需求 + 与工具页完美契合 + 静态 Markdown 低成本 + 长期可持续。本 spec 在 8 周内落地首批 5 篇（金融 3 / 健康 1 / 装修 1），建立 Astro Content Collections 基础设施与内链网络。

## What Changes

- **BREAKING（架构）**：启用 Astro Content Collections（Markdown + MDX），新增 `src/content/config.ts` schema
- 新增 `src/content/articles/` 首批 5 篇 Markdown（每篇 ≥1500 字）
- 新增 `src/pages/articles/[slug].astro` 详情页 + `src/pages/articles/index.astro` 列表页
- 新增 Article JSON-LD、面包屑、上一篇/下一篇、相关工具推荐区（内链核心）
- SiteHeader 与 SiteFooter 增加「知识库」入口
- sitemap 新增 `articles/` 路径

## Impact

- Affected specs：依赖「站内丰富内容」提升停留时长的所有目标
- Affected code：
  - `src/content/config.ts`（新增 schema）
  - `src/content/articles/*.md`（新增 5 篇）
  - `src/pages/articles/[slug].astro`（新增详情模板）
  - `src/pages/articles/index.astro`（新增列表）
  - `src/components/SiteHeader.astro` + `SiteFooter.astro`（入口）
  - `astro.config.mjs`（集成 sitemap）
- 不受影响：52 工具页、计算逻辑、部署清单、设计系统

## ADDED Requirements

### Requirement: Content Collections 基础
系统 SHALL 用 Astro Content Collections 管理文章：schema 必含 title / description / category / tools / publishedAt / updatedAt / author。`tools` 数组指向相关工具 URL，用于内链推荐。

### Requirement: 详情页与列表页
详情页 SHALL 含：H1、分类徽章、面包屑、导读、首屏 Article 元信息、目录（h2 锚点列表）、FAQ、相关工具推荐区（≥3）、免责声明、上一篇/下一篇。
列表页 SHALL 按分类分组、显示阅读量与发布时间。

### Requirement: JSON-LD 与 SEO
每篇文章 SHALL 自动注入 Article JSON-LD（含 author、datePublished、dateModified、articleSection、keywords）；canonical、OG、Twitter Card 自动派生。

### Requirement: 首批 5 篇内容

| # | 标题 | 分类 | 相关工具 | 关键词目标 |
|---|---|---|---|---|
| 1 | 等额本息 vs 等额本金：哪种还款方式更划算 | finance | mortgage-cn, equal-installment-cn, prepayment-cn | 等额本息 等额本金 区别 |
| 2 | 个税专项附加扣除 2026 全解析（3 岁以下婴幼儿照护、子女教育、住房贷款利息等 7 项） | finance | income-tax-cn, social-insurance-cn | 个税专项附加扣除 2026 |
| 3 | 五险一金缴费基数与比例：到手工资怎么算 | finance | social-insurance-cn, income-tax-cn | 五险一金 缴费基数 比例 |
| 4 | BMI 标准双对照：中国标准 vs WHO 标准 | health | bmi-cn | BMI 标准 中国 WHO |
| 5 | 装修瓷砖用量怎么算（含损耗与边角处理） | renovation | tile-quantity-cn, floor-area-cn | 瓷砖用量计算 |

每篇 ≥1500 字、含 ≥3 个工具内链、≥3 条 FAQ、合规免责。

### Requirement: 内链与导航
SiteHeader 增加「知识库」入口；文章详情页底部显示「相关工具」卡片组（来自 frontmatter tools 字段）；sitemap 自动收录。

#### Scenario: 用户从文章到工具
- **WHEN** 在知识库文章阅读 ≥30s 后
- **THEN** 页底「相关工具」区显示 ≥3 工具卡片，CTR 目标 ≥8%

## MODIFIED Requirements

### Requirement: 列表页导航
首页「分类卡片网格」末位加入「知识库」入口（指向 /articles）。

## REMOVED Requirements

无。
