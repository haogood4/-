# Tier 1 金融 + 健康 10 个工具 Spec

## Why

总规 spec `.trae/specs/strategy-50-calculators/spec.md` 已批准 Tier 1（10 个 P0 工具）作为首批上线窗口（截止 2026-10-03）。Tier 1 工具是**搜索量最高、转化意图最强**的核心矩阵，对站点初始 SEO 权重与用户基数起决定性作用。

裁决状态：
- approved（实际开发）：7 个（房贷、贷款、复利、基金定投、个税、五险一金、汇率）
- merged（合并到既有）：2 个（BMI、单位换算）
- deferred（延后）：1 个（股票佣金，改为用户输入费率版）

## What Changes

- 新增 7 个工具的库函数 + 单测：`mortgage-cn.ts` / `loan-cn.ts` / `compound-interest-cn.ts` / `fund-dca-cn.ts` / `income-tax-cn.ts` / `social-insurance-cn.ts` / `currency-exchange-cn.ts`
- 新增 7 个 Astro 页面：`/finance/<slug>.astro`
- 新增 7 个页面脚本：`<slug>-page.ts`
- 新增 7 个公式 YAML：`knowledge-base/03-formulas/finance/<slug>.yaml`
- BMI 单位换算页面：以 merged 形式提供 `/health/bmi-cn/` 和 `/efficiency/unit-converter-cn/` 入口；不新增代码

## Impact

- 受影响代码：
  - 新增 7 个 `src/lib/calculators/*.ts` + `.test.ts`
  - 新增 7 个 `src/pages/finance/*.astro`
  - 新增 7 个 `src/scripts/*-page.ts`
  - 新增 7 个公式 YAML
- 不影响：既有 11 个工具的代码；首页已挂链接（指向未上线 URL，启动后 404 由 Cloudflare 占位）

## ADDED Requirements

### Requirement: 7 个金融工具端到端可用
系统 SHALL 在 `/finance/{mortgage,loan,compound-interest,fund-dca,income-tax,social-insurance,currency-exchange}-cn/` 共 7 个路由提供工具；输入校验、计算、结果展示、复制按钮、YMYL 草稿标注全部完整。

#### Scenario: 房贷等额本息月供
- **WHEN** 用户输入贷款本金 100 万、年限 30 年、年利率 4.2%
- **THEN** 月供 ≈ ¥4894（人民币元）；总利息 ≈ ¥76.2 万

#### Scenario: 复利终值
- **WHEN** 用户输入本金 10000、年利率 7%、年限 10 年
- **THEN** 终值 ≈ ¥19672

#### Scenario: 基金定投终值
- **WHEN** 用户输入每月定投 1000、年化 8%、年限 20 年
- **THEN** 终值 ≈ ¥589,020

#### Scenario: 工资个税
- **WHEN** 用户输入税前月薪 20000、社保公积金扣除 2000、专项附加扣除 1000
- **THEN** 应纳税所得额 = 20000 - 5000 - 2000 - 1000 = 12000；个税 ≈ 790

#### Scenario: 五险一金
- **WHEN** 用户输入月薪 15000、城市"北京"、缴费基数 15000
- **THEN** 个人五险一金合计 ≈ ¥2242.5（养老 8% + 医保 2% + 失业 0.5% + 公积金 12%）

#### Scenario: 汇率换算
- **WHEN** 用户输入 100 USD、汇率 7.25（USD→CNY）
- **THEN** 折合人民币 ≈ ¥725

#### Scenario: 错误输入
- **WHEN** 用户提交空值或非法字符
- **THEN** 字段级错误提示，焦点回到首个错误字段，不更新结果

### Requirement: YMYL 草稿标注
所有 7 个金融工具页面顶部 lead 之后必须含显著"仅供参考，不构成投资/保险/理财/税务建议"标注。

#### Scenario: 标注展示
- **WHEN** 用户访问任意金融工具
- **THEN** 首屏 lead 后立即可见 YMYL 提示

## MODIFIED Requirements

无（保留既有工具与 spec 不变）。

## REMOVED Requirements

无。

## 关联

- 受 [strategy-50-calculators spec](file:///home/arch/项目/计算器网站开发/.trae/specs/strategy-50-calculators/spec.md) 覆盖
- 与 [calculator-list-v2.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list-v2.md) 交叉引用
