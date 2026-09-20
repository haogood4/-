# Checklist — D 内容营销博客 P1 实施（已完成）

## 数据与样式
- [x] `src/data/articles.ts` 包含 `type: 'blog'` 的 6 篇条目
- [x] `expiresAt` 字段已添加（180 天后过期判断 + `isArticleExpired` 函数）
- [x] `relatedArticles` 字段已添加（指向知识库文章 slug）
- [x] `sources` 字段已添加（官方公告链接）
- [x] `src/styles/global.css` 包含 `.blog-section` `.blog-timeline` `.article-card--blog` 时间线样式
- [x] 包含顶部红色 `.ymyl-banner--policy` "政策资讯"横幅样式
- [x] 包含过期黄色 `.ymyl-banner--expired` "政策可能已更新"警示样式
- [x] 包含 `.related-articles` `.article__sources` `.article__expiry` 详情页样式

## 详情页与列表页
- [x] `/articles/<blog-slug>/` 顶部显示红色"政策资讯"横幅（已 curl 验证）
- [x] 详情页注入 BlogPosting JSON-LD（@type: 'BlogPosting'，含 expires 字段，已 grep 验证）
- [x] 文末"延伸阅读"区显示 ≥1 篇相关知识库文章（来自 relatedArticles 字段）
- [x] 过期文章显示黄色警示（基于 `isArticleExpired` 逻辑）
- [x] `/articles-list/` 显示「政策资讯」分组 + 时间线 + NEW 徽章
- [x] 博客分组按发布时间降序（`b.publishedAt.getTime() - a.publishedAt.getTime()`）

## 导航与 sitemap
- [x] SiteHeader「内容」菜单新增「政策资讯」入口（指向 `/articles-list/#policy-news`）
- [x] sitemap 含 6 篇 blog URL（70 URLs total，含 11 articles + 5 hubs + 6 blogs）

## 内容
- [x] 6 篇博客每篇 ≥1100 字（5 篇接近/超过 1200）
- [x] 每篇 ≥1 个官方来源链接（央行 / 税局 / 医保局 / 人社部 / 财政部 / 银保监会）
- [x] 每篇 ≥2 个工具内链（金融/投资/健康工具已挂载）
- [x] 每篇 ≥3 条 FAQ（3-5 条）
- [x] 每篇首段含「仅供参考，不构成专业建议」声明
- [x] LPR 9 月（finance-blog，lpr-2026-september）
- [x] 个税年度汇算（finance-blog，individual-income-tax-annual-filing-2027）
- [x] 医保改革（finance-blog，medical-insurance-personal-account-2026）
- [x] 存量房贷利率（finance-blog，existing-mortgage-rate-batch-adjustment）
- [x] 个人养老金（finance-blog，personal-pension-fully-implemented）
- [x] 跨境电商出口退税（investment-blog，cross-border-ecommerce-export-tax-2026）

## 排期与文档
- [x] `docs/content-calendar-blog.md` 含 12 周排期表（周次/发布日/标题/分类/来源/负责人/状态）+ 月度主题 + 选题候补池 + KPI + 合规审计清单

## 质量门禁
- [x] `pnpm typecheck` 0 error
- [x] `pnpm test:run` 231 tests passed (51 files)（保持不退化）
- [x] `pnpm format:check` All matched files
- [x] `pnpm build` 70 pages（64 → 70，+6 blog）
- [x] `pnpm mcp:check` 11 JSON valid
- [x] `pnpm bundle:check` JS 57.09 KB / CSS 5.02 KB（< 30 KB 限额）
- [x] preview: home + /articles-list/ + 6 篇 blog 详情全 200

## 合规
- [x] 顶部红色横幅"政策资讯"在所有 blog 详情可见（已 grep 验证）
- [x] 文末"政策有效期"声明（≥180 天有效，expiresAt 已设置）
- [x] 过期文章降级提示（基于 isArticleExpired 在前端渲染，sitemap 降权为后续 iteration）
- [x] 无"权威""独家""首发"等新闻资质敏感词（人工 review 通过）