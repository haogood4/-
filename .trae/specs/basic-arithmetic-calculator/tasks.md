# Tasks

> 排序原则：库 → 页面脚本 → 页面 → 样式 → 首页 → 公式文档 → 终验。
> P0 = 不完成无法上线；P1 = 首发质量；P2 = 真机与 SEO。
> 全部任务可在 1 个前端代理 + 1 个 QA/验收代理中并行；执行前需 `export PATH=~/.local/bin:$PATH`。

---

## 阶段一：纯函数库 + 单测（P0）

- [ ] Task 1: 实现四则运算库 `src/lib/calculators/basic.ts`
  - [ ] SubTask 1.1: 定义 `BasicErrorCode = "DIVIDE_BY_ZERO" | "INCOMPLETE_EXPR" | "OUT_OF_RANGE" | "INVALID_FORMAT" | "EMPTY"` 与返回类型
  - [ ] SubTask 1.2: 实现 `applyOperator(left: number, op: "+"|"−"|"×"|"÷", right: number)` 单步运算（含除零）
  - [ ] SubTask 1.3: 实现 `tokenize(input: string)`：拆分数字 / 一元负号 / 二元运算符；拒绝 `1.2.3`、双运算符（± 前缀除外）
  - [ ] SubTask 1.4: 实现 `toRPN(tokens)` 与 `evaluateRPN(rpn)`：标准 shunting-yard；运算优先级 `× ÷ > + −`；同优先级左结合
  - [ ] SubTask 1.5: 实现 `evaluateExpression(input: string)`：串起 tokenize→RPN→求值；返回 `{ok, value}` 或 `{ok:false, error}`
  - [ ] SubTask 1.6: 实现 `formatBasic(value: number)`：复用 `_shared.ts` 的 round-half-up 规则；含「约」前缀；超过 1e12 拒绝
  - [ ] SubTask 1.7: 实现 `toggleSign(input: string)` 与 `applyPercent(input: string)`：± 切换、% 转换为 ÷100
  - [ ] SubTask 1.8: 输入字符上限 32、单数字段有效数字上限 16

- [ ] Task 2: 单元测试 `src/lib/calculators/basic.test.ts`
  - [ ] SubTask 2.1: 加减乘除基础用例（`2+3=5`、`10-4=6`、`3×7=21`、`20÷4=5`）
  - [ ] SubTask 2.2: 优先级（`2+3×4=14`、`(2+3)×4=20` 用括号表达式）
  - [ ] SubTask 2.3: 负数（`-5+3=-2`、`5*-2=-10`）
  - [ ] SubTask 2.4: 小数（`0.1+0.2=约 0.3`、`1.5×2=3`）
  - [ ] SubTask 2.5: 除零（`5÷0` → DIVIDE_BY_ZERO）
  - [ ] SubTask 2.6: 不完整（`12+` → INCOMPLETE_EXPR）
  - [ ] SubTask 2.7: 大数（`1e12 × 2` → OUT_OF_RANGE；不返回 Infinity）
  - [ ] SubTask 2.8: 格式（`0.1+0.2` 含「约」前缀；`-0` 显示为 `0`；超大整数无科学计数法）
  - [ ] SubTask 2.9: ± 与 %（`5` → ± → `-5`；`50×20%` ≡ `50×0.2`）
  - [ ] SubTask 2.10: 字符上限（输入 33 位拒绝）

- [ ] Task 3: 公式文档入库
  - [ ] SubTask 3.1: 新增 `knowledge-base/03-formulas/daily/basic.yaml`：title、description、formula、test_vectors（≥ 8 条，与 Task 2 一致，`derivation: unit-test`）

## 阶段二：页面 + 脚本（P0）

- [ ] Task 4: 页面脚本 `src/scripts/basic-page.ts`
  - [ ] SubTask 4.1: 状态机 `building | computed | error` 三态切换
  - [ ] SubTask 4.2: 20 个按键 + 键盘映射：`0-9 . + - × ÷ = AC C ⌫ ± %`；Enter / Backspace / Escape 等价
  - [ ] SubTask 4.3: 表达式构建：维护当前 token 流；拒绝连续运算符、重复小数点、字符超 32
  - [ ] SubTask 4.4: `=` 触发：`evaluateExpression` 成功 → computed；失败 → error（错误码映射中文）
  - [ ] SubTask 4.5: 连续 `=`：在 computed 状态下复用上一个二元运算符（标准计算器行为）；C 清当前输入、AC 全清
  - [ ] SubTask 4.6: `±` / `%` 在 building 态作用于当前 token；在其他态为 no-op
  - [ ] SubTask 4.7: 显示屏右对齐、CSS 截断；结果区 `aria-live="polite"`
  - [ ] SubTask 4.8: 复制按钮：text 格式 `表达式 = 结果`；clipboard API + execCommand 回退；2 秒文案闪烁

- [ ] Task 5: Astro 页面 `src/pages/daily/basic.astro`
  - [ ] SubTask 5.1: 复用 `BaseLayout` + `Breadcrumb`；面包屑 `首页 / 四则运算计算器`
  - [ ] SubTask 5.2: 自包含 `<section class="calc">`：display + 20 个按钮（4 列 × 5 行）
  - [ ] SubTask 5.3: 复用既有 `.card` `.btn` 类；display 使用新 `.calc-display`，keypad 使用新 `.calc-keypad`
  - [ ] SubTask 5.4: 页面 `<h1>` / lead / 使用说明 / 公式 / 注意事项 / FAQ（≥ 4 条） / 相关工具（链向百分比、折扣、平均数）/ `<script>` 引入 basic-page.ts

## 阶段三：样式（P1）

- [ ] Task 6: 全局样式追加 `.calc` 系列（不动既有规则）
  - [ ] SubTask 6.1: `.calc`：flex 单列、宽度 100%、最大 480px 居中
  - [ ] SubTask 6.2: `.calc-display`：字号 32px（右对齐，`overflow-wrap: anywhere`，min-height 64px）
  - [ ] SubTask 6.3: `.calc-keypad`：CSS Grid 4 列等宽、gap 8px；按钮 `min-height: 56px`、字号 20px
  - [ ] SubTask 6.4: `.calc-key`：基础样式；`.calc-key.is-operator`、`.calc-key.is-equals`、`.calc-key.is-clear` 颜色变体（区分视觉层级，不打破对比度）
  - [ ] SubTask 6.5: `.calc-hint`：错误提示区（颜色 `var(--color-error)`）
  - [ ] SubTask 6.6: `@media (min-width: 1024px)`：display 字号 40px（保持主结果视觉层级，不超过 48px 上限）
  - [ ] SubTask 6.7: 320px 视口验证：grid 列宽自适应，最小按键 ≥ 44px

## 阶段四：首页与导航（P1）

- [ ] Task 7: 首页 `src/pages/index.astro`
  - [ ] SubTask 7.1: 在 `categories` 数组**首位**插入 `{ name: "日常小工具", tools: [{ label: "四则运算计算器", href: "/daily/basic/" }] }`
  - [ ] SubTask 7.2: 既有 4 个分类条目与顺序不变；description 与 lead 文案不变
  - [ ] SubTask 7.3: `lead` 文案可在末尾追加一句「从最常用的四则运算开始」作为连接句，但不得删除既有句子

## 阶段五：终验（P0）

- [ ] Task 8: 自动化校验
  - [ ] SubTask 8.1: `pnpm test:run`：basic.test.ts 全绿（≥ 25 用例）
  - [ ] SubTask 8.2: `pnpm typecheck` 退出码 0
  - [ ] SubTask 8.3: `pnpm format:check` 退出码 0
  - [ ] SubTask 8.4: `pnpm build` 退出码 0；`scripts/check-bundle-size.mjs` 通过（首屏 JS ≤ 100KB gzip、CSS ≤ 30KB gzip）
  - [ ] SubTask 8.5: `pnpm mcp:check` 通过
  - [ ] SubTask 8.6: `pnpm verify` 全绿

- [ ] Task 9: 浏览器实测
  - [ ] SubTask 9.1: 启动 `pnpm preview --port 4321`
  - [ ] SubTask 9.2: 访问 `/daily/basic/`，确认 200 + 控制台 0 错误 + 0 CSP 违规
  - [ ] SubTask 9.3: 键盘走查一次完整计算（`1`、`2`、`+`、`3`、`Enter` → 15），验证焦点环
  - [ ] SubTask 9.4: 鼠标走查：连续运算符被忽略、重复小数点被忽略、字符上限生效
  - [ ] SubTask 9.5: 320px 视口下无横向溢出；按 1920px 视口布局无破版

- [ ] Task 10: 勾选本规格 checklist.md

---

# Task Dependencies

- Task 2 依赖 Task 1（库函数是测试对象）
- Task 3 依赖 Task 2（test_vectors 由实际单测回填）
- Task 4 依赖 Task 1（脚本调用库）
- Task 5 依赖 Task 4（页面引入脚本）
- Task 6 依赖 Task 5（页面使用样式）
- Task 7 与 Task 1-6 完全独立（纯模板字符串），可最早并行
- Task 8 依赖 Task 1-7（最终校验）
- Task 9 依赖 Task 5-7（页面与首页都需就绪）
- Task 10 依赖 Task 8、9

# 可并行项

- Task 1 / Task 7：库实现与首页模板改动完全独立，可在两个并行代理中同步进行
- Task 2 / Task 3 / Task 6：测试、公式文档、样式与代码库可独立推进
- Task 4 必须在 Task 1 完成后启动；Task 5/6 必须在 Task 4 完成后启动

# 待你决策的阻塞项（仍 BLOCKED）

1. 启动日（影响发布排期）
2. 外部审核预算（高门槛工具上线前必需；本次四则运算不受此阻塞）
3. Google AdSense 账户申请状态（决定何时把 ad 占位换成真实广告）
