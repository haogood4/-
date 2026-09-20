# B 场景 Hub P0 实施 Spec

## Why

[content-direction-strategy.md](../../../../docs/content-direction-strategy.md) v1.0.0 将「B 场景 Hub」评为 **P0（4.05 分）**：低资源 + 工具直接互补 + 流量回流清晰。本 spec 在 6 周内落地首批 5 个场景 Hub 页（首次买房、装修 10 万预算、30 岁养老、个税申报、健身减脂），串联 3-7 个现有工具，提升单次访问工具使用次数。

## What Changes

- **BREAKING（URL）**：新增 `/hub/` 路径（如 `/hub/first-home-buying/`）
- 新增 `src/pages/hub/[slug].astro` Hub 模板
- 新增首批 5 个 Hub 页 frontmatter 配置
- SiteHeader 与首页分类网格增加「场景指南」入口
- sitemap 收录 hub 路径

## Impact

- Affected specs：与 [content-knowledge-base](../content-knowledge-base/spec.md) 并行；SiteHeader 入口需合并避免重复
- Affected code：
  - `src/pages/hub/[slug].astro`（新增模板）
  - `src/data/hubs.ts`（新增配置：每 Hub 含 title/scenario/steps/tools/timeline）
  - `src/components/SiteHeader.astro` + `SiteFooter.astro`（入口）
  - `src/pages/index.astro`（首页分类网格）
- 不受影响：工具页、计算逻辑、知识库 articles

## ADDED Requirements

### Requirement: Hub 数据模型
每 Hub 含：title / scenario 描述（用户场景一句话）/ steps 数组（3-7 步骤，每步含 description + tools[] + 注意事项）/ estimatedTime（如「30 分钟」）/ difficulty（简单/中等/进阶）。

### Requirement: Hub 页面布局
页面 SHALL 含：H1、场景描述、所需时间与难度徽章、分步骤卡片（每步含描述 + 工具 CTA + 注意事项）、底部 FAQ（≥3）、免责声明。
步骤卡片 SHALL 内联跳转至对应工具页（href 来自 tools[]）。

### Requirement: 首批 5 个 Hub

| # | slug | 场景 | 串联工具 |
|---|---|---|---|
| 1 | first-home-buying | 首次买房决策 | 房贷 → 提前还款 → 等额本息 → 月供压力测试 |
| 2 | renovation-100k | 10 万装修预算 | 装修预算 → 瓷砖用量 → 乳胶漆用量 → 面积计算 |
| 3 | retirement-30 | 30 岁养老金规划 | 复利 → 基金定投 → 年化收益率 → IRR |
| 4 | tax-annual-filing | 个税年度申报 | 个税 → 五险一金 → 公积金贷款（如有） |
| 5 | fitness-fat-loss | 健身减脂计算 | 卡路里消耗 → BMI → 复利（无）→ 工具数 2-3 |

每 Hub 必含 ≥3 步骤、≥3 工具 CTA。

### Requirement: 内链策略
Hub 页 SHALL 在每个工具 CTA 后加「为何需要这一步」一句话理由；FAQ 至少 1 条涉及「工具使用顺序」。

#### Scenario: Hub → 工具转化
- **WHEN** 用户进入 Hub 页
- **THEN** 页面渲染步骤卡片 ≥3，含工具 CTA；CTR 目标 ≥30%

## MODIFIED Requirements

### Requirement: SiteHeader 入口合并
「场景指南」与「知识库」合并为同一父菜单「内容中心」或独立两入口，避免重复。

## REMOVED Requirements

无。
