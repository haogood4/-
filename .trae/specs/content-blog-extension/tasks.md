# Tasks — D 内容营销博客 P1 实施

* [x] Task 1: 数据模型与样式扩展

  * [x] 1.1 `src/data/articles.ts` 新增 `type: 'article'|'blog'` 与 `expiresAt` / `sources` / `relatedArticles` 字段 + `isArticleExpired` 函数

  * [x] 1.2 `src/styles/global.css` 增加 `.blog-section` `.blog-timeline` `.ymyl-banner` `.article-card--blog` `.related-articles` `.article__sources` `.article__expiry` `.article-section-nav` 等样式

  * 验证：typescript 通过 ✓

* [x] Task 2: 详情页与列表页扩展

  * [x] 2.1 `src/pages/articles/[slug].astro` 增加 BlogPosting JSON-LD 分支 + 顶部"政策资讯"横幅 + 文末"延伸阅读"区 + 政策来源区 + 过期日期

  * [x] 2.2 `src/pages/articles-list.astro` 增加「政策资讯」分组（时间线样式、按发布时间降序）

  * 验证：手动访问 `/articles-list/` 可见 6 篇博客 ✓

* [x] Task 3: 导航与 sitemap

  * [x] 3.1 `src/components/SiteHeader.astro` CONTENT\_ITEMS 新增「政策资讯」入口（指向 `/articles-list/#policy-news`）

  * [x] 3.2 sitemap 自动收录 6 篇 blog URL（@astrojs/sitemap 默认 + articles 数据源）

  * 验证：`pnpm build` 后 sitemap 含 6 篇 blog ✓

* [x] Task 4: 首批 6 篇博客内容

  * [x] 4.1 2026 年 9 月 LPR 报价解读（finance-blog，\~1100 字 + 1 央行来源 + 3 工具 + 4 FAQ）

  * [x] 4.2 2027 个税年度汇算清缴手册（finance-blog，\~1400 字 + 1 税局来源 + 2 工具 + 4 FAQ）

  * [x] 4.3 医保个人账户改革落地（finance-blog，\~1100 字 + 1 医保局来源 + 2 工具 + 3 FAQ）

  * [x] 4.4 存量房贷利率批量调整 10 问（finance-blog，\~1100 字 + 1 央行来源 + 2 工具 + 4 FAQ）

  * [x] 4.5 个人养老金账户全面落地（finance-blog，\~1500 字 + 1 三部门来源 + 2 工具 + 4 FAQ）

  * [x] 4.6 跨境电商出口退税新规（investment-blog，\~1300 字 + 1 财政+税局来源 + 2 工具 + 5 FAQ）

  * 验证：每篇 ≥1100 字 + ≥1 官方来源 + ≥2 工具内链 + ≥3 FAQ + "仅供参考"声明 ✓

* [x] Task 5: 排期与文档

  * [x] 5.1 新增 `docs/content-calendar-blog.md` 12 周排期表（含已完成 6 篇 + 6 篇排期 + 月度主题 + 选题候补池 + KPI）

  * 验证：所有 CHECK PASS ✓

* [x] Task 6: 质量门禁

  * [x] 6.1 `pnpm typecheck` 0 error ✓

  * [x] 6.2 `pnpm test:run` 231 tests passed (51 files) ✓

  * [x] 6.3 `pnpm format:check` All matched files ✓

  * [x] 6.4 `pnpm build` 70 pages (从 64 → 70，新增 6 篇 blog) ✓

  * [x] 6.5 `pnpm mcp:check` 11 JSON + `pnpm bundle:check` JS 57.09 KB / CSS 5.02 KB ✓

  * [x] 6.6 preview 验证：home + /articles-list/ + 6 篇 blog + 知识库 + hub 全 200 ✓

  * 验证：所有 CHECK PASS ✓

# Task Dependencies

* Task 2 依赖 Task 1（数据模型先行）

* Task 4 依赖 Task 1（frontmatter schema）

* Task 6 依赖 Task 1-5 全部完成

* Task 3 部分依赖 Task 4（sitemap 收录需先有内容）

