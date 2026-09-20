# 首批 10 个低门槛计算器上线 Spec

## Why

`remediate-foundation` 已交付工程骨架、3 个计算器（percentage/age/date-diff）、样板页面与端到端无障碍基线。但项目距离"首批 10 个可上线的低门槛计算器"还差 7 个工具（折扣、单价比较、平均数、比例、长度换算、温度换算、时间戳转换），以及首页导航清理、合规口径切换（海外华语 / GDPR/CCPA）。

本规格目标：在不引入外部审核的前提下，按已批准 spec 的样板把剩余 7 个工具补齐，并完成首页与合规文档适配，让 10 个工具可同时对外访问。

## What Changes

- 新增 7 个计算器，每个含：纯函数库（`src/lib/calculators/*.ts`）、单元测试（`*.test.ts`）、Astro 页面（`src/pages/<category>/<slug>.astro`）、页面交互脚本（`src/scripts/<slug>-page.ts`）。
- 首页 `src/pages/index.astro` 重构：移除「开发中」标记、按分类展示全部 10 个工具、按海外华语定位调整文案与 description。
- 法务文档口径切换：隐私政策、免责声明等 3 份政策改为 GDPR/CCPA 口径（删 PIPL）。
- 复用既有 BaseLayout / Breadcrumb / ResultArea / AdContainer / FaqSection / SiteFooter；不引入新组件。
- 不引入任何服务端、不引入数据库、不引入外部 API；时间戳转换使用浏览器本地时间，不调用第三方。

## Impact

- 受影响能力：10 个低门槛计算器的端到端交付 + 首页导航 + 海外合规文案。
- 受影响代码：
  - 新增：`src/lib/calculators/{discount,unit-price,average,ratio,length,temperature,timestamp}.ts` 与同名 `.test.ts`
  - 新增：`src/scripts/{discount,unit-price,average,ratio,length,temperature,timestamp}-page.ts`
  - 新增：`src/pages/math/{discount,unit-price,average,ratio}.astro`
  - 新增：`src/pages/unit/{length,temperature}.astro`
  - 新增：`src/pages/dev/timestamp.astro`
  - 修改：`src/pages/index.astro`
  - 修改：`knowledge-base/06-testing-compliance/{privacy-policy,terms-of-service,disclaimer}.md`（GDPR/CCPA 口径）
  - 修改：`knowledge-base/03-formulas/` 下对应 YAML 测试向量（`derivation: unit-test`）
- 不影响：`remediate-foundation`、`docs-and-team-setup`、金融/健康类高门槛工具、Postgres 与 P2 延后项。

## ADDED Requirements

### Requirement: 10 个计算器端到端可用
系统 SHALL 在 `/math/percentage/`、`/math/discount/`、`/math/unit-price/`、`/math/average/`、`/math/ratio/`、`/daily/age/`、`/daily/date-diff/`、`/unit/length/`、`/unit/temperature/`、`/dev/timestamp/` 共 10 个路由提供可用页面，骨架与现有 `percentage` 页面一致（面包屑 → H1 → 输入 → 计算/重置 → 结果 → 广告位 → 说明 → 公式 → 注意事项 → FAQ → 相关工具 → 页脚）。

#### Scenario: 每个页面都能完成一次完整计算
- **WHEN** 用户在任一页面填写合法输入并点击「计算」
- **THEN** 结果区显示主结果与公式代入过程；复制/分享按钮可用；不留空态文案

#### Scenario: 校验失败聚焦
- **WHEN** 用户提交非法输入（如空值、字母、超界、超精度、除零）
- **THEN** 该字段下方显示中文错误文案；该字段获得焦点并标记 aria-invalid；已填输入保留

### Requirement: 折扣计算器（discount）
系统 SHALL 按"原价 × 折扣率 = 实付 / 节省"计算；输入 `price` 与 `discountPercent`（0–100 之间）；输出 `paid` 与 `saved`；支持 `discountPercent = 0` 与 `100` 边界。

#### Scenario: 折扣 8 折等价 8%
- **WHEN** 用户输入 200 与 20
- **THEN** 主结果显示"实付 160，节省 40"

### Requirement: 单价比较计算器（unit-price）
系统 SHALL 计算 `price / quantity` 的单位成本；支持 a 与 b 两组输入（各自原价 + 数量），输出 a/b 的单位成本并提示哪个更划算。

#### Scenario: 500 g 25 元 vs 1 kg 45 元
- **WHEN** 用户分别输入 a=(25,500) 与 b=(45,1000)
- **THEN** 主结果显示 a 单价 0.05 元/g、b 单价 0.045 元/g、b 更划算

### Requirement: 平均数计算器（average）
系统 SHALL 计算 N 个数字的算术平均与总和；输入用换行/逗号/空格分隔的数字串；至少 1 个、最多 100 个；非数字字符、空项拒绝并标错。

#### Scenario: 输入 "10 20 30"
- **WHEN** 用户填入该值并点击计算
- **THEN** 主结果"平均数 20"，过程显示"总和 60 ÷ 3 = 20"

### Requirement: 比例求解计算器（ratio）
系统 SHALL 按 `a : b = c : x` 或 `a : b = x : c` 解第四项；显式选择求解位置；分母为 0 时报错。

#### Scenario: 2 : 4 = 3 : x
- **WHEN** 用户选择"求第 4 项"并填入 2、4、3
- **THEN** 主结果 x = 6，过程显示 2 × 3 ÷ 4 = 6

### Requirement: 年龄计算器（age）
系统 SHALL 已在 `remediate-foundation` 中实现库函数；本次新增 Astro 页面与页面脚本，调用 `calculateAge`，支持闰年 2 月 29 日出生规则。

#### Scenario: 生日当天算满周岁
- **WHEN** 用户输入出生 2000-01-01、目标 2025-01-01
- **THEN** 主结果 25 岁，过程显示"2025 年已到 1 月 1 日"

### Requirement: 日期间隔计算器（date-diff）
系统 SHALL 已在 `remediate-foundation` 中实现库函数；本次新增 Astro 页面与页面脚本，调用 `daysBetween`，规则为 `end − start`（不含首尾双计）。

#### Scenario: 跨闰年天数
- **WHEN** 用户输入 2024-02-28 与 2024-03-01
- **THEN** 主结果 2 天

### Requirement: 长度换算计算器（length）
系统 SHALL 支持 m / cm / mm / km / in / ft / yd / mi 之间的双向换算；因子为固定值；至少 6 位小数精度。

#### Scenario: 1 mi = 1609.344 m
- **WHEN** 用户输入 1 mi 转 m
- **THEN** 主结果 1609.344 m

### Requirement: 温度换算计算器（temperature）
系统 SHALL 支持摄氏 / 华氏 / 开尔文双向换算；开尔文 < 0 时报错。

#### Scenario: 0 °C = 32 °F = 273.15 K
- **WHEN** 用户输入 0 摄氏度
- **THEN** 主结果同时显示 32 °F 与 273.15 K

### Requirement: 时间戳转换计算器（timestamp）
系统 SHALL 支持 Unix 秒 / 毫秒与本地日期时间互转；输入秒值上限约为 32503680000（公元 3000 年附近）；输入日期使用 `YYYY-MM-DD HH:mm` 格式；时区以浏览器本地为准。

#### Scenario: 0 秒 = 1970-01-01 08:00 (UTC+8)
- **WHEN** 用户在东八区浏览器输入 0
- **THEN** 主结果根据本地时区显示对应日期

### Requirement: 首页导航完整
系统 SHALL 在 `/` 展示全部 10 个计算器入口；移除"开发中"后缀；按数学/日期时间/单位/开发者 4 个分类展示；description 改为海外华语定位。

#### Scenario: 首页不再出现 404 链接
- **WHEN** 用户访问 `/`
- **THEN** 全部工具链接均返回 200

### Requirement: 海外合规口径
隐私政策、用户协议、免责声明 SHALL 删除中国 PIPL 措辞；加入 GDPR/CCPA 必要条款（数据控制者、保留期限、用户权利、Cookie 同意）。

#### Scenario: 隐私政策包含 GDPR 必备项
- **WHEN** 用户访问隐私政策
- **THEN** 文档包含数据控制者联系方式、保留期限、用户访问/更正/删除权利

## MODIFIED Requirements

无（不修改既有 spec 的需求；只新增本规格的 10 个工具）。

## REMOVED Requirements

无。

---

## 关联

- 受 `remediate-foundation`（已批准）覆盖：`src/lib/calculators/percentage.ts`、`age.ts`、`date-diff.ts`、`src/layouts/BaseLayout.astro`、`src/components/*`、`src/styles/global.css`、`scripts/check-*.mjs`、`pnpm verify` 命令集。
- 受 `docs-and-team-setup`（已批准）覆盖：6 个 docs 治理文档、6 份 JD、合规文档骨架。
- 与本规格独立：`remediate-foundation` Task 18–20（已标记 P2 延后）与 `docs-and-team-setup` 治理层。