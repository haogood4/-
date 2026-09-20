# Tasks — B 场景 Hub P0 实施

- [x] Task 1: Hub 模板
  - [x] 1.1 `src/pages/hub/[slug].astro`：步骤卡片 + 工具 CTA + FAQ + 免责声明
  - [x] 1.2 `src/data/hubs.ts`：5 个 Hub 配置数据
  - [x] 1.3 `src/styles/global.css`：`.hub-step` `.hub-tools` 样式（复用令牌）
  - 验证：`pnpm build` 通过 ✓

- [x] Task 2: 首批 5 个 Hub 数据
  - [x] 2.1 first-home-buying（首套房 · 5 步骤 · 6 工具）
  - [x] 2.2 renovation-100k（10 万装修 · 5 步骤 · 5 工具）
  - [x] 2.3 retirement-30（30 年退休规划 · 5 步骤 · 5 工具）
  - [x] 2.4 tax-annual-filing（年度报税 · 5 步骤 · 4 工具）
  - [x] 2.5 fitness-fat-loss（健身减脂 · 5 步骤 · 5 工具）
  - 验证：每个 ≥3 步骤 + ≥3 工具 CTA ✓

- [x] Task 3: 导航与 sitemap
  - [x] 3.1 SiteHeader 增加「场景指南」入口（与 articles 协调）
  - [x] 3.2 首页分类网格加入「场景指南」入口
  - 验证：sitemap 收录 5 个 `/hub/*` URL ✓

- [x] Task 4: 质量门禁
  - [x] 4.1 `pnpm verify` 全绿（typecheck + 231 测试 + prettier + mcp:check + bundle:check）
  - 验证：所有 CHECK PASS ✓
