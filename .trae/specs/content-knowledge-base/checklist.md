# Checklist — A 知识库 P0 验收

- [ ] `src/content/config.ts` 含 articles schema
- [ ] `src/content/articles/*.md` 5 篇齐全
- [ ] 每篇 ≥1500 字（中文）
- [ ] 每篇 frontmatter `tools` 字段含 ≥3 工具 URL
- [ ] 每篇含 ≥3 FAQ
- [ ] 每篇含「结果仅供参考」类免责（金融/健康）
- [ ] `src/pages/articles/[slug].astro` 详情页正常
- [ ] `src/pages/articles/index.astro` 列表页正常
- [ ] 详情页 Article JSON-LD 注入正确
- [ ] 详情页底部「相关工具」卡片 ≥3
- [ ] SiteHeader 含「知识库」入口
- [ ] 首页分类网格含「知识库」入口
- [ ] sitemap 收录 `/articles/`
- [ ] `pnpm verify` 全绿
- [ ] `pnpm build` 全绿
- [ ] 浏览器代理验证 3 页可渲染
