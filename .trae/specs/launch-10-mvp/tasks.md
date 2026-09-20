# Tasks

> 排序原则：先验证工程骨架可复用 → 实施剩余 7 个库 + 测试 → 实施 7 个页面 → 重构首页 → 合规口径切换 → 终验。
> P0 = 不完成即无法发布 10 个工具；P1 = 首发质量；P2 = 真机与 SEO。
> 全部可由 Wave B/C/D 三个并行代理完成；任务执行前需 `export PATH=~/.local/bin:$PATH`。

---

## 阶段一：复用基线验证（P0）

- [ ] Task 1: 复用 remediate-foundation 的样板构建剩余工具
  - [ ] SubTask 1.1: 确认 `pnpm install`、`pnpm build`、`pnpm verify` 在当前依赖下退出码 0
  - [ ] SubTask 1.2: 确认 percentage 页面与脚本可直接复制为模板（import 路径、DOM 约定、CSS class 与现有保持一致）
  - [ ] SubTask 1.3: 确认 ResultArea/Breadcrumb/AdContainer/FaqSection/SiteFooter/BaseLayout 不需改动

## 阶段二：7 个计算器库 + 单元测试（P0）

- [ ] Task 2: 折扣计算器
  - [ ] SubTask 2.1: `src/lib/calculators/discount.ts`：计算 paid/saved；边界 discountPercent ∈ [0, 100]；price > 0
  - [ ] SubTask 2.2: `src/lib/calculators/discount.test.ts`：8 折等价 8% 实付、0% 与 100% 边界、超界拒绝
  - [ ] SubTask 2.3: 回填 `knowledge-base/03-formulas/math-unit/discount.yaml` 的 test_vectors 为 `derivation: unit-test`

- [ ] Task 3: 单价比较计算器
  - [ ] SubTask 3.1: `src/lib/calculators/unit-price.ts`：双组 (price, quantity) 求单位成本与更划算方
  - [ ] SubTask 3.2: `unit-price.test.ts`：500g/25 元 vs 1kg/45 元结论、超界拒绝、相等判定
  - [ ] SubTask 3.3: 回填对应 YAML

- [ ] Task 4: 平均数计算器
  - [ ] SubTask 4.1: `src/lib/calculators/average.ts`：解析分隔符（换行/逗号/空格/分号）；N ∈ [1,100]；非数字字符拒绝；输出 sum 与 mean
  - [ ] SubTask 4.2: `average.test.ts`：「10 20 30」=20、小数、空项、超 N
  - [ ] SubTask 4.3: 回填对应 YAML

- [ ] Task 5: 比例求解计算器
  - [ ] SubTask 5.1: `src/lib/calculators/ratio.ts`：a : b = c : x 与 a : b = x : c；分母为 0 拒绝
  - [ ] SubTask 5.2: `ratio.test.ts`：2:4=3:x →6、a:b=x:c →1、负数接受
  - [ ] SubTask 5.3: 回填对应 YAML

- [ ] Task 6: 长度换算
  - [ ] SubTask 6.1: `src/lib/calculators/length.ts`：8 单位（m/cm/mm/km/in/ft/yd/mi）；基准 m；双向
  - [ ] SubTask 6.2: `length.test.ts`：1 mi=1609.344 m、1 ft=0.3048 m、0 单位拒绝
  - [ ] SubTask 6.3: 回填对应 YAML

- [ ] Task 7: 温度换算
  - [ ] SubTask 7.1: `src/lib/calculators/temperature.ts`：C/F/K 双向；K < 0 拒绝
  - [ ] SubTask 7.2: `temperature.test.ts`：0°C=32°F=273.15K、-273.15°C 接受、-274°C 拒绝
  - [ ] SubTask 7.3: 回填对应 YAML

- [ ] Task 8: 时间戳转换
  - [ ] SubTask 8.1: `src/lib/calculators/timestamp.ts`：秒/毫秒↔本地日期时间；输入秒值上限 ~32503680000；输出用 `Date.toLocaleString('zh-CN', ...)`
  - [ ] SubTask 8.2: `timestamp.test.ts`：0 = 1970-01-01 08:00 (UTC+8)、超界拒绝、毫秒秒混用
  - [ ] SubTask 8.3: 回填对应 YAML（如不存在则新建）

## 阶段三：9 个 Astro 页面 + 页面脚本（P0）

- [ ] Task 9: 复用 percentage 页面作为模板，新页面（数学 5 + 日期时间 2 + 单位 2 + 开发者 1，共 10 个；percentage 已存在，仅补 9 个）
  - [ ] SubTask 9.1: `src/pages/math/discount.astro` 与 `src/scripts/discount-page.ts`
  - [ ] SubTask 9.2: `src/pages/math/unit-price.astro` 与 `src/scripts/unit-price-page.ts`
  - [ ] SubTask 9.3: `src/pages/math/average.astro` 与 `src/scripts/average-page.ts`
  - [ ] SubTask 9.4: `src/pages/math/ratio.astro` 与 `src/scripts/ratio-page.ts`
  - [ ] SubTask 9.5: `src/pages/daily/age.astro` 与 `src/scripts/age-page.ts`
  - [ ] SubTask 9.6: `src/pages/daily/date-diff.astro` 与 `src/scripts/date-diff-page.ts`
  - [ ] SubTask 9.7: `src/pages/unit/length.astro` 与 `src/scripts/length-page.ts`
  - [ ] SubTask 9.8: `src/pages/unit/temperature.astro` 与 `src/scripts/temperature-page.ts`
  - [ ] SubTask 9.9: `src/pages/dev/timestamp.astro` 与 `src/scripts/timestamp-page.ts`

## 阶段四：首页与合规口径（P1）

- [ ] Task 10: 首页重构
  - [ ] SubTask 10.1: `src/pages/index.astro`：移除「开发中」；按数学/日期时间/单位/开发者 4 类展示 10 个工具
  - [ ] SubTask 10.2: description 与 lead 文案调整为海外华语定位

- [ ] Task 11: 合规文档 GDPR/CCPA 切换
  - [ ] SubTask 11.1: `knowledge-base/06-testing-compliance/privacy-policy.md`：删除 PIPL；加入数据控制者、保留期限、用户访问/更正/删除权利
  - [ ] SubTask 11.2: `knowledge-base/06-testing-compliance/terms-of-service.md`：管辖法律改为用户所在地；删除中国境内专属条款
  - [ ] SubTask 11.3: `knowledge-base/06-testing-compliance/disclaimer.md`：删除中国相关条款；保留「仅供参考」声明

## 阶段五：终验（P0）

- [ ] Task 12: 浏览器实测 10 个页面（每个至少 1 个用例）
  - [ ] SubTask 12.1: 启动 `pnpm preview --port 4321`
  - [ ] SubTask 12.2: 用浏览器自动化逐页面访问，确认 200 + 关键交互
  - [ ] SubTask 12.3: 抓控制台错误、确认无 CSP 违规
- [ ] Task 13: `pnpm verify` 全绿
- [ ] Task 14: 勾选本规格 checklist.md

---

# Task Dependencies

- Task 2-8（库）可全部并行
- Task 9（页面）依赖 Task 2-8（页面调用库）
- Task 10 依赖 Task 9 完成（首页链接全部上线）
- Task 11 与 Task 2-10 独立，可并行
- Task 12-14 依赖 Task 2-11

# 可并行项

- Task 2、3、4、5、6、7、8 七个库可在同一次代理调用中并行（同一上下文、无相互依赖）
- Task 11 与 Task 2-10 全文档/全代码无耦合

# 待你决策的阻塞项（仍 BLOCKED）

1. 启动日
2. 最晚发布日
3. 外部审核预算（高门槛工具批量上线前必需；首批 10 不受此阻塞）
4. 6 名数字员工实际能力
5. Google AdSense 账户申请状态