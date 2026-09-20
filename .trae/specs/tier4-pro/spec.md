# Tier 4 投资专业 10 个工具 Spec

## Why

总规 spec 已批准 Tier 4（10 个投资专业工具），截止 2026-11-14。

## ADDED Requirements

### Requirement: 10 个投资专业工具
海龟仓位、加密货币仓位、期货保证金、期权定价（Black-Scholes）、跨境电商利润、Amazon FBA、毛利率、盈亏平衡、ROAS、转化率。

#### Scenario: 期权看涨定价
- **WHEN** 标的价 100、行权价 100、无风险利率 4%、波动率 20%、到期 1 年
- **THEN** BS 看涨期权 ≈ 10.45

#### Scenario: ROAS
- **WHEN** 广告费 1000 元、销售额 5000 元
- **THEN** ROAS = 5.0

## Impact

- 新增 10 个工具库 + 单测
- 新增 10 个页面 + 10 个脚本 + 10 个公式 YAML
