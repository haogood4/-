# 四则运算计算器 Spec

## Why

首批 10 个专题计算器（百分比、折扣、年龄、日期差等）已上线，但缺少一个用户进入站点时**最常搜索、最高频打开**的工具——桌面级四则运算器。Google 上"calculator""simple calculator""四则运算""在线计算器"等关键词长期占据工具类查询头部，海外华人用户最朴素的诉求是「打开页面直接按数字、出结果」，而当前站点需要先选计算器类别才能使用，路径过深。

本规格新增 1 个四则运算计算器，作为第 11 个工具上线，专门服务这一最高频场景。同时为避免与既有 `ResultArea`（一次性表单→结果）模式冲突，本工具采用"按键网格 + 单行表达式显示"形态，复用既有 `BaseLayout` / `Breadcrumb` / `SiteFooter` 框架，不引入新组件库。

## What Changes

- 新增纯函数库 `src/lib/calculators/basic.ts`：实现 `applyOperator`（一步运算）、`evaluateExpression`（中缀→后缀→求值，支持 +、−、×、÷ 与一元负号）、`formatBasic`（数字→字符串，去尾零、含"约"前缀），以及对应的输入校验（除零、连续运算符、表达式不完整三类错误码）。
- 新增单元测试 `basic.test.ts`：覆盖正常运算、运算优先级、小数点重复/开头、± 切换、连续等号续算、除零、表达式不完整、键盘/按钮等价、超大数溢出保护（绝对值不超过 1e12）等用例。
- 新增 Astro 页面 `src/pages/daily/basic.astro`：使用既有 `BaseLayout` + `Breadcrumb`，自包含 calculator 卡片（display + keypad），不复用 `ResultArea`（不适用）。
- 新增页面脚本 `src/scripts/basic-page.ts`：按钮点击 + 键盘监听、状态机（building / computed / error）、错误提示、`aria-live` 播报、复制结果、AC/C/⌫/±/=/+/−/×/÷/./0–9 共 20 个按键完整映射。
- 首页 `src/pages/index.astro` 新增分类「日常小工具」并放在最前，包含唯一的四则运算计算器；既有 4 个分类顺序不变。
- 新增 `knowledge-base/03-formulas/daily/basic.yaml`：公式文档以 `derivation: unit-test` 标注、与库测试用例对齐。
- 通用样式新增 `.calc` 系列类（keypad 网格、按键、display），不复用 `.field` `.field-input`（视觉差异过大）。`.btn-primary` `.btn-secondary` 可复用。
- 不引入新依赖；不动现有 10 个计算器；不动 `remediate-foundation` / `launch-10-mvp` / `docs-and-team-setup` 三份已批准 spec。

## Impact

- 受影响能力：四则运算端到端上线 + 首页新增分类 + 一份公式文档入库。
- 受影响代码：
  - 新增：`src/lib/calculators/basic.ts` + `basic.test.ts`
  - 新增：`src/scripts/basic-page.ts`
  - 新增：`src/pages/daily/basic.astro`
  - 新增：`knowledge-base/03-formulas/daily/basic.yaml`
  - 修改：`src/pages/index.astro`（顶部新增 1 个分类）
  - 修改：`src/styles/global.css`（追加 `.calc` 系列样式块，不覆盖既有规则）
  - 修改：`scripts/check-bundle-size.mjs`（如总 JS 超 100KB gzip 阈值需复核）
- 不影响：10 个专题计算器、合规文档、`BaseLayout`、构建脚本。

## ADDED Requirements

### Requirement: 四则运算计算器端到端可用

系统 SHALL 在 `/daily/basic/` 提供一个类手机计算器面板页面，使用户在不选择工具的前提下，能直接输入数字与运算符、完成一次或多次计算并查看结果。

#### Scenario: 完整键盘路径
- **WHEN** 用户通过键盘依次按下 `1`、`2`、`+`、`3`、`0`、`Enter`
- **THEN** 显示屏显示「42」，主结果 `42`，无控制台错误

#### Scenario: 完整按钮路径
- **WHEN** 用户点击 1、2、+、3、0、= 按钮
- **THEN** 显示结果与按钮路径完全一致

#### Scenario: 运算优先级
- **WHEN** 用户输入 `2 + 3 × 4`
- **THEN** 显示屏结果为 `14`，不是 `20`

#### Scenario: 除零
- **WHEN** 用户输入 `5 ÷ 0` 或 `5 ÷ 0 =`
- **THEN** 显示错误文案「不能除以 0」，不抛异常、不显示 NaN/Infinity

#### Scenario: 表达式不完整
- **WHEN** 用户输入 `12 +` 后立即按 `=`（无后续数字）
- **THEN** 显示错误文案「表达式不完整」，不抛异常

#### Scenario: 连续等号续算
- **WHEN** 用户输入 `2 + 3 =`，再按 `=` 一次
- **THEN** 显示屏依次显示 `5`、`8`、`11`（每次在结果上加 3），直到操作数被改变

### Requirement: 显示与状态

系统 SHALL 在显示屏一行内显示当前正在构建的表达式（如 `12 + 3 ×`），并在结果可得时显示主结果（含「约」前缀当发生舍入时）。

#### Scenario: 表达式超出可视宽度
- **WHEN** 用户输入超过显示屏可见宽度的字符串
- **THEN** 显示屏内容右对齐、超出部分水平截断；不换行、不撑破布局

#### Scenario: 大数显示
- **WHEN** 用户输入导致结果超过 1e12
- **THEN** 拒绝运算、显示「数值超出范围」；不得返回 Infinity/NaN

#### Scenario: 状态机三态
- **WHEN** 用户处于 building（输入中）/ computed（已得结果）/ error（错误）任一状态
- **THEN** 显示屏文案、复制按钮可用性、错误提示区同步切换；AC 与 C 在不同状态下行为不同（AC 全清、C 清当前输入）

### Requirement: 输入限制

系统 SHALL 拒绝以下非法输入：连续两个运算符（± 一元前缀除外）、连续两个小数点、表达式总字符数超过 32、单个数字段超过 16 位有效数字。

#### Scenario: 重复小数点
- **WHEN** 用户在已有 `3.` 的数字段继续按 `.`
- **THEN** 输入被忽略，数字段仍为 `3.`，不出现 `3..`

#### Scenario: 连续运算符
- **WHEN** 用户在 `12 +` 后继续按 `+`
- **THEN** 第二个 `+` 被忽略，表达式仍为 `12 +`（不出现 `12 ++`）

### Requirement: ± 与百分号

系统 SHALL 实现 ± 一元切换与 % 百分比转换键（转换为 ÷100 后并入表达式），± 与 % 在无当前输入时为 no-op。

#### Scenario: ± 切换
- **WHEN** 当前输入为 `5`
- **THEN** 按 ± 后输入变为 `-5`；再按一次恢复 `5`

#### Scenario: 百分号
- **WHEN** 当前输入为 `50`、其后有 `×`、再输入 `20`、按 %
- **THEN** `20` 被替换为 `0.2`，最终结果为 `50 × 0.2 = 10`

### Requirement: 键盘与按钮等价

系统 SHALL 同时支持鼠标点击按键与物理键盘输入；任一按键/键盘组合均能完成一次完整计算。

#### Scenario: 物理键盘映射
- **WHEN** 用户按 `0–9` 输入数字、`+ - * /` 输入运算符、`.` 输入小数点、`Enter` 或 `=` 触发等号、`Backspace` 删除一位、`Escape` 全清（AC）
- **THEN** 与点击对应按钮结果完全一致

#### Scenario: 焦点策略
- **WHEN** 页面首次加载或用户点击显示屏/非按钮区域
- **THEN** 焦点不自动落到任何按键；按 Tab 时按视觉顺序依次聚焦

### Requirement: 复制结果

系统 SHALL 在主结果可得时启用「复制结果」按钮，复制的文本格式为 `12 + 3 × 4 = 14`。

#### Scenario: 复制结果
- **WHEN** 用户点击复制按钮
- **THEN** 系统调用 clipboard API 或 execCommand 回退；按钮文案在 2 秒内变为「已复制」或「复制失败」

### Requirement: 响应式与可达性

系统 SHALL 在 320px–1920px 视口下无横向溢出；键盘可单独完成一次计算；按键触控目标 ≥ 44×44 CSS px；显示屏对比度满足 WCAG 2.1 AA（正文 4.5:1）；错误提示通过 `aria-live="polite"` 播报。

#### Scenario: 320px 视口
- **WHEN** 视口宽度为 320px
- **THEN** 计算器卡片无横向溢出，按键宽度自适应填满、最小 44px

#### Scenario: 屏幕阅读器
- **WHEN** 用户使用键盘计算并得到结果
- **THEN** 显示屏或结果文案被 `aria-live` 区域播报一次

### Requirement: 首页分类新增

系统 SHALL 在 `/` 顶部新增「日常小工具」分类，**且仅含**「四则运算计算器」一项；其余 4 个分类（数学计算 / 日期与时间 / 单位换算 / 开发者工具）位置、顺序、文案保持不变。

#### Scenario: 首页入口可达
- **WHEN** 用户从首页点击「四则运算计算器」
- **THEN** 跳转到 `/daily/basic/` 并返回 HTTP 200

## MODIFIED Requirements

无（不修改既有 spec 的任何 Requirement；仅在 `src/pages/index.astro` 顶部新增 1 个分类，不影响既有 4 个分类的条目与文案）。

## REMOVED Requirements

无。

---

## 关联

- 受 `remediate-foundation`（已批准）覆盖：工程基线、样式令牌、`BaseLayout`、`pnpm verify` 命令集。
- 受 `launch-10-mvp`（已批准）覆盖：10 个专题计算器样板（keypad 计算器复用 `.card` 与 `.btn` 但不复用 `.field-input`）。
- 受 `docs-and-team-setup`（已批准）覆盖：合规与团队定义。
- 与本规格独立：`remediate-foundation` Task 18–20（已标记 P2 延后）。
