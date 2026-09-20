# Tasks — A 知识库 P0 实施

- [x] Task 1: Astro Content Collections 基础设施
  - [x] 1.1 安装 `@astrojs/mdx`（按需；现用 marked + 同步 data 模式绕过 Astro 7 content+bypass bug）
  - [x] 1.2 `src/content.config.ts` 定义 articles collection schema（Astro 7 路径）
  - [x] 1.3 `src/styles/global.css` 增加 `.article-*` / `.prose` 样式（复用设计令牌）
  - 验证：`pnpm build` 通过 ✓

- [x] Task 2: 详情页与列表页模板
  - [x] 2.1 `src/pages/articles/[slug].astro`：BaseLayout + JSON-LD + 上一篇/下一篇 + 相关工具
  - [x] 2.2 `src/pages/articles-list.astro`：按分类分组、卡片网格（移出 articles/ 目录避免 [slug] 被吞）
  - [x] 2.3 `src/components/ArticleCard.astro`：列表复用卡片（带分类色边）
  - 验证：手动访问 `/articles-list/` 列表 + 单篇可渲染 ✓

- [x] Task 3: 导航与 sitemap
  - [x] 3.1 SiteHeader 增加 CONTENT_ITEMS（知识库 + 场景指南）
  - [x] 3.2 首页分类网格加入「知识库 + 场景指南」入口
  - [x] 3.3 sitemap 集成（默认 + build hook）已含 `/articles/*` 和 `/hub/*`
  - 验证：`pnpm build` 后 sitemap 包含 5 articles + 5 hubs ✓

- [x] Task 4: 首批 5 篇内容
  - [x] 4.1 等额本息 vs 等额本金（finance，1500+ 字、含 LaTeX 公式）
  - [x] 4.2 个税专项附加扣除 2026 全解析（finance）
  - [x] 4.3 五险一金缴费基数与比例（finance）
  - [x] 4.4 BMI 标准双对照（health）
  - [x] 4.5 装修瓷砖用量怎么算（renovation）
  - 验证：每篇含 3 工具内链 + 3-4 FAQ + 合规免责 ✓

- [x] Task 5: 质量门禁
  - [x] 5.1 `pnpm verify` 全绿（typecheck + 231 测试 + prettier + mcp:check + bundle:check）
  - [x] 5.2 `pnpm build` 构建 64 页，sitemap 收录 60+ URLs（含 articles/hubs）
  - [x] 5.3 preview 验证：home/articles-list/article/hub-list/hub 全部 200
  - 验证：所有 CHECK PASS ✓

# Task Dependencies

- Task 2 依赖 Task 1（schema 先行）
- Task 3 部分依赖 Task 2（sitemap 收录需先有内容）
- Task 4 可与 Task 1/2/3 并行（内容独立）
