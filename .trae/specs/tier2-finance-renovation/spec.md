# Tier 2 金融续集 + 装修 15 个工具 Spec

## Why

总规 spec 已批准 Tier 2（11 个新工具 + 3 个合并 + 1 个子模块），截止 2026-10-24。覆盖：
- 金融续集 8 个：等额本息、车贷、存款利息、年化收益率、IRR、养老金、年终奖个税、信用卡分期
- 装修家居 4 个：装修预算、瓷砖、乳胶漆、面积
- 日常 1 个：油耗
- merged 3 个：提前还款、社保缴费、与五险一金合并、日期差（既有）

## What Changes

- 新增 12 个工具代码（8 金融 + 4 装修 + 1 油耗）
- 新增 12 个页面 + 12 个脚本 + 12 个公式 YAML

## ADDED Requirements

### Requirement: 12 个工具端到端可用
- 等额本息、车贷、存款利息、年化收益率、IRR、养老金、年终奖个税、信用卡分期、装修预算、瓷砖、乳胶漆、房屋面积、油耗（实际 13 个）

#### Scenario: 等额本息月供
- **WHEN** 用户输入本金 100 万、年限 20、年利率 4.5%
- **THEN** 月供 ≈ ¥6327

#### Scenario: IRR 求解
- **WHEN** 用户输入现金流序列 [-10000, 3000, 4000, 5000]
- **THEN** IRR ≈ 9.7%

## Impact

- 新增 12 个 `src/lib/calculators/*.ts` + `.test.ts`
- 新增 12 个 `src/pages/{finance,renovation,daily}/*.astro`
- 新增 12 个 `src/scripts/*-page.ts`
- 新增 12 个公式 YAML
