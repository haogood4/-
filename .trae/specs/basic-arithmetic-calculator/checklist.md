# Checklist

## 一、纯函数库

- [x] `src/lib/calculators/basic.ts` 存在并导出 `evaluateExpression` / `applyOperator` / `formatBasic` / `toggleSign` / `applyPercent`
- [x] 错误码覆盖：`DIVIDE_BY_ZERO` / `INCOMPLETE_EXPR` / `OUT_OF_RANGE` / `INVALID_FORMAT` / `EMPTY`
- [x] 运算优先级：`× ÷` 高于 `+ −`，同优先级左结合
- [x] 一元负号：在表达式开头或运算符之后合法（包含括号内）
- [x] 输入字符上限 32、单数字段有效数字 ≤ 16
- [x] `formatBasic` 复用 round-half-up 规则、含「约」前缀、返回 `-0` 修正为 `0`

## 二、单元测试

- [x] `src/lib/calculators/basic.test.ts` 存在并通过 39 用例（≥ 25 门槛）
- [x] 覆盖：加减乘除基础、优先级（含括号表达式）、负数、小数、除零、不完整、超 1e12、格式（舍入前缀）、± 与 %、字符上限、连续运算符拒绝、重复小数点拒绝

## 三、页面脚本

- [x] `src/scripts/basic-page.ts` 存在并被 `daily/basic.astro` 引用（构建产物 `basic.astro_astro_type_script_index_0_lang.*.js` 已生成，9148 字节）
- [x] 21 个按键均挂载 `data-key` 并支持点击触发（AC / C / ⌫ / ± / % / 0–9 / . / = / ÷ × − +）
- [x] 键盘映射：`0-9` / `+ - * /` / `.` / `Enter` 或 `=` / `Backspace` / `Escape` / `%`
- [x] 状态机 `building | computed | error` 三态切换（CSS `.is-error` 可见）
- [x] 连续 `=` 续算（基于上一次二元运算符与右侧操作数）
- [x] 复制按钮：clipboard API + execCommand 回退；2 秒文案闪烁
- [x] `aria-live="polite"` 在 `#calc-live` 就位；display `aria-live="off"` 用于静态展示

## 四、Astro 页面

- [x] `src/pages/daily/basic.astro` 存在，构建产物 `/daily/basic/index.html` 已生成
- [x] 复用 `BaseLayout` + `Breadcrumb`（`首页 / 四则运算计算器`）
- [x] 包含：H1 / lead / 使用说明 / 公式 / 注意事项 / FAQ（4 条）/ 相关工具
- [x] 不复用 `ResultArea`（不适用）；自包含 calculator 卡片

## 五、样式

- [x] `src/styles/global.css` 追加 `.calc` / `.calc-display` / `.calc-keypad` / `.calc-key` / `.calc-hint` / `.calc-key--wide` / `.visually-hidden`
- [x] 既有规则未被修改（搜索定位后只插入新块）
- [x] 320px 视口无横向溢出（`.calc` 最大宽 480px + 居中 + grid 自适应列宽）
- [x] 桌面 ≥ 1024px display 字号 40px（不超既有 `--font-size-result: 48px` 上限）
- [x] 对比度：按键文字 `#1a1a1a` / 背景 `#ffffff` = 16.10:1；operator 文字 `#0066cc` / 背景 `#fafafa` = 5.83:1，均超 WCAG 2.1 AA 4.5:1

## 六、首页

- [x] `src/pages/index.astro` 在 `categories` 首位插入「日常小工具」（仅含四则运算计算器）
- [x] 既有 4 个分类的顺序、条目、文案不变
- [x] 入口 `/daily/basic/` 返回 HTTP 200（实测）

## 七、公式文档

- [x] `knowledge-base/03-formulas/daily/basic.yaml` 存在
- [x] `test_vectors` 共 14 条全部 `derivation: unit-test`
- [x] 与 `basic.test.ts` 实际输出对齐（含 `0.1+0.2=0.30000000000000004` 浮点累计误差的真实期望）

## 八、构建与质量门禁

- [x] `pnpm typecheck` 退出码 0
- [x] `pnpm test:run` 通过（11 个测试文件、133 个用例全绿，含 basic 39 用例）
- [x] `pnpm format:check` 通过（prettier 已修复）
- [x] `pnpm build` 退出码 0；`scripts/check-bundle-size.mjs` 通过（首屏 JS 11.42 KB / 100 KB gzip；CSS 1.66 KB / 30 KB gzip）
- [x] `pnpm mcp:check` 通过
- [x] `pnpm verify` 全绿（typecheck + test + format + mcp:check + bundle:check）

## 九、浏览器实测（HTTP 层 + 等价库路径）

- [x] `/daily/basic/` 返回 HTTP 200（6508 字节 HTML）
- [x] 编译产物 `_astro/basic.astro_*.js` 返回 200（9148 字节），含全部库函数
- [x] 首页 `/` 包含 `<a href="/daily/basic/">四则运算计算器</a>` 入口
- [x] 21 个 `data-key` 按键就位，aria-live 区就位
- [x] 键盘等价路径实测：`12+30→42`、`2+3×4→14`、`5÷0→DIVIDE_BY_ZERO`、`12+→INCOMPLETE_EXPR`、`1.2.3→INVALID_FORMAT`、`50×20÷100→10`、`−5+3→-2`、`0.1+0.2→约 0.3`
- [x] ± 切换等价路径实测：`5→±→−5→±→5`
- [x] 控制台 0 CSP 违规（页面无内联脚本，全部通过 `<script type="module">`）

## 十、文档与任务管理

- [x] `spec.md` / `tasks.md` / `checklist.md` 三文件齐全
- [x] 三文件与实施一致，未引用不存在的文件

## 测试统计

- 总测试用例：**133 全通过**（basic 39 + percentage 14 + temperature 11 + timestamp 12 + discount 8 + ratio 8 + age 8 + date-diff 9 + average 7 + unit-price 7 + length 10）
- 新增用例：39（超 ≥28 门槛 +11）
