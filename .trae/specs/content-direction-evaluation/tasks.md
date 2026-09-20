# Tasks — 内容方向评估与战略选择

> 约束：本 spec 仅做评估文档与方法论；不写任何代码、不创建任何页面内容、不动业务文件。

- [x] Task 1: 撰写评估方法论 `knowledge-base/04-seo-content/content-direction-eval.md`
  - [x] 1.1 头部：数据来源（6 关键词库 + 公开竞品 + 缺失项诚实声明）
  - [x] 1.2 5 维度加权评分定义与 0-5 分档说明
  - [x] 1.3 评分流程：单维度独立打分 → 加权求和 → 分级（P0≥4.0 / P1 3.0-3.9 / <3.0 deferred or rejected）
  - [x] 1.4 复用既有 `04-seo-content/README.md` 中 seo-standards / ymyl-rules / schema-org 三个子文档的约束
  - 验收：含数据来源表 + 评分公式 + 决策树

- [x] Task 2: 撰写 `docs/content-direction-strategy.md`（核心交付）
  - [x] 2.1 文档头：版本 v1.0.0 + 日期 2026-09-19 + 适用范围 + 与本 spec 的关系
  - [x] 2.2 现状基线：52 工具页、6 类导航、6 关键词库、PIPL 合规已切、无内容形态（信息型页）
  - [x] 2.3 5 方向详细分析（每方向含：定义、目标用户、形态、技术路径、合规风险、资源需求、短期 KPI、长期 KPI、阶段计划）
  - [x] 2.4 评分矩阵表（实际填分）
  - [x] 2.5 决策：基于评分推荐 P0（1-2 个）+ P1 + 明确 defer/reject 的方向
  - [x] 2.6 实施阶段：M1-M2 MVP / M3-M6 规模化 / M7-M12 自动化（仅 P0/P1 方向展开）
  - [x] 2.7 监测机制：核心指标（停留时长、跳出率、复访率、工具点击率、长尾关键词覆盖率、外链数）+ 90 天校正窗口
  - [x] 2.8 已知限制：缺失 GA 真实数据、缺失用户调研、依赖人工判断
  - 验收：行数 ≥250；含 5 方向完整章节 + 评分矩阵 + 决策段 + 实施阶段

- [x] Task 3: 追加 `knowledge-base/04-seo-content/content-calendar.md` 内容排期初稿
  - [x] 3.1 不重写原文件，仅在文末追加「2026 Q4 内容排期（基于 content-direction-strategy v1.0.0）」段
  - [x] 3.2 月度主题与每方向预计产出数量
  - [x] 3.3 引用 content-direction-strategy.md（相对路径）
  - 验收：原文件其他内容不变；新段含月份主题与产出数

- [x] Task 4: 交叉引用登记
  - [x] 4.1 在 `knowledge-base/04-seo-content/README.md`（如有且可改）登记两个新文档链接；不存在则跳过（不要新建 README）
  - [x] 4.2 在 `strategy-50-calculators/acceptance-plan.md` 监控埋点章节追加「内容 KPI 监测点」引用 content-direction-strategy.md
  - 验收：grep 能在 2 处找到「content-direction-strategy」字样

# Task Dependencies

- Task 1 与 Task 2 必须由同一 agent 串行（方法论与战略互引）
- Task 3 依赖 Task 2（排期基于决策结果）
- Task 4 依赖 Task 2、3
