# Tasks

> 排序原则：先消除误导性断言（会导致错误决策），再修可用性缺陷，再建工程基线，再交付样板，最后输出协作 / JD / 风险 / 验收 / 变现模板。
> P0 = 阻断后续一切工作；P1 = 首发必需；P2 = 有真实数据后再做。

---

## 阶段一：消除虚假可信度（P0）

- [x] Task 1: 撤销无依据的审核标记
  - [x] SubTask 1.1: 扫描 `knowledge-base/` 全部 front-matter 与 YAML，列出 81 处 `human-verified` / `review_status: human-verified` 的完整清单（文件路径 + 行号）
  - [x] SubTask 1.2: 将全部 `status` 与 `review_status` 改为 `draft` / `pending`
  - [x] SubTask 1.3: 将虚构审核人（李四、王五、张三等）替换为 `未指派`
  - [x] SubTask 1.4: 在 `knowledge-base/README.md` 顶部加入一段说明：本知识库尚无任何条目通过专业审核，标记规则见文档状态要求

- [x] Task 2: 清空虚构的项目历史记录
  - [x] SubTask 2.1: 清空 `decision-log.md` 中 DEC-20250101-001~003，保留模板与填写说明
  - [x] SubTask 2.2: 清空 `change-log.md` 中 CHG-001~002，保留表头与变更控制流程
  - [x] SubTask 2.3: 清空 `issue-register.md` 中 ISS-001 示例行，保留表头与流程
  - [x] SubTask 2.4: 检查 `risk-register.md`：风险条目本身是合理的分析结果，保留；但移除虚构的负责人姓名，改为角色代号（PO/BE/QA 等）

- [x] Task 3: 修正错误的公式与测试向量
  - [x] SubTask 3.1: 重写 `daily/age.yaml` 的周岁算法为公历年月日比较；补充 2 月 29 日、生日当天、目标日早于出生日三类边界
  - [x] SubTask 3.2: 将全部 YAML 的 `test_vectors` 条目加上 `derivation: unverified`，并在 `formula-template.yaml` 中加入该字段说明
  - [x] SubTask 3.3: 移除 `prepayment-cn.yaml`、`income-tax-cn.yaml` 中形如"约 100000~130000"、"比原月供低"的模糊期望值，标记为待代码推导
  - [x] SubTask 3.4: 统一舍入表述：删除"银行家舍入"，改为展示层 round-half-up 保留 2 位

- [x] Task 4: 修复 MCP 配置语法
  - [x] SubTask 4.1: 删除 10 个 JSON 文件末尾多余的 `---` 行（`mcp.json`、`mcp.dev.json`、`servers/` 下 8 个；注意 `ga4.json` 末尾还有一处残留的 `</content>` 需一并删除）
  - [x] SubTask 4.2: 逐个文件执行 JSON 解析验证，全部通过
  - [x] SubTask 4.3: 在 `mcp-config/README.md` 与 `mcp-manual/00-principles.md` 中补充声明：`tier` 字段是团队约定，真实管控依赖令牌作用域与分支保护
  - [x] SubTask 4.4: 将 `postgres` 相关配置与手册标记为 `deferred`，说明 MVP 不接入

## 阶段二：建立工程与测试基线（P0）

- [x] Task 5: 初始化最小工程骨架
  - [x] SubTask 5.1: 初始化 `package.json`，选定 Astro + TypeScript，锁定实施时受支持的版本
  - [x] SubTask 5.2: 配置 TypeScript strict、`.editorconfig`、`.gitignore`（排除 `.env`、`node_modules`、构建产物、`mcp-config/mcp.dev.json`）
  - [x] SubTask 5.3: 接入单元测试运行器（Vitest），确保 `src/lib/` 中的纯函数可在无浏览器环境下测试
  - [x] SubTask 5.4: 提供统一校验命令 `pnpm verify`（类型检查 + 单元测试 + 格式化检查 + MCP JSON 校验 + 构建产物体积检查），干净环境下退出码为 0

- [x] Task 6: 实现并验证百分比计算逻辑
  - [x] SubTask 6.1: 在 `src/lib/calculators/percentage.ts` 实现三种模式（求百分数、占比、变化率），内部不提前舍入
  - [x] SubTask 6.2: 实现输入校验：空值、非法字符、NaN/Infinity、占比模式分母为 0、变化率模式原值 ≤ 0
  - [x] SubTask 6.3: 编写单元测试覆盖 6 组验收样例 + 边界用例
  - [x] SubTask 6.4: 将测试实际输出回填到 `math-unit/percentage.yaml` 的 `test_vectors`，标记 `derivation: unit-test`

- [x] Task 7: 实现并验证年龄与日期计算逻辑
  - [x] SubTask 7.1: 在 `src/lib/calculators/age.ts` 实现公历年月日比较的周岁计算
  - [x] SubTask 7.2: 在 `src/lib/calculators/date-diff.ts` 实现天数差，明确首尾日计数规则
  - [x] SubTask 7.3: 单元测试覆盖闰年、月底、生日当天、跨年、目标日早于出生日
  - [x] SubTask 7.4: 回填两个 YAML 的 `test_vectors`，标记 `derivation: unit-test`

## 阶段三：端到端样板（P1）

- [x] Task 8: 构建计算器页面模板与百分比页面
  - [x] SubTask 8.1: 实现通用页面骨架：面包屑、H1、输入区、计算/重置、结果区、说明、FAQ、相关工具
  - [x] SubTask 8.2: 实现输入交互：不自动聚焦、错误时保留输入并聚焦首个错误字段、修改输入后标记旧结果待重算
  - [x] SubTask 8.3: 实现结果区：主结果、公式代入过程、复制按钮、分享（仅工具链接不含输入值）
  - [x] SubTask 8.4: 预留广告位 A（结果与相关工具之后），预留固定尺寸容器避免布局偏移；广告脚本缺失时页面功能不受影响

- [x] Task 9: 无障碍与响应式落实
  - [x] SubTask 9.1: 语义化标签、`label` 关联、`aria-invalid`、`aria-describedby`、结果区 `aria-live="polite"`
  - [x] SubTask 9.2: 触控目标 ≥ 44×44 CSS px；320px 宽度无横向溢出
  - [x] SubTask 9.3: 键盘走查：仅键盘完成一次计算，焦点可见
  - [x] SubTask 9.4: 对比度检查达 WCAG 2.1 AA（正文 4.5:1）

- [x] Task 10: 性能与安全基线可执行化
  - [x] SubTask 10.1: 在 `pnpm verify` 中加入构建产物体积检查，首屏 JS ≤ 100KB(gzip)、CSS ≤ 30KB，超限失败（脚本：`scripts/check-bundle-size.mjs`）
  - [x] SubTask 10.2: 加入 MCP JSON 语法校验步骤（脚本：`scripts/check-mcp-json.mjs`），防止再次出现不可解析配置
  - [x] SubTask 10.3: 配置基础安全响应头（CSP、`X-Content-Type-Options`、`Referrer-Policy`），确认无内联脚本违反 CSP
  - [x] SubTask 10.4: 确认仓库无任何真实令牌；`mcp.dev.json` 加入 `.gitignore` 并在文档中说明

- [x] Task 11: 修正性能预算与合规文档表述
  - [x] SubTask 11.1: 按 spec 的 MODIFIED 要求重写 `performance-budget.md`，区分实验室与线上口径，明确"< 3 秒"定义
  - [x] SubTask 11.2: 在 `ymyl-rules.md` 与 `disclaimer.md` 中移除"逐条预审程序化广告"类无法履行的承诺，改为平台控制 + 抽查 + 投诉处理
  - [x] SubTask 11.3: 修正 `privacy-policy.md` 中 GA4 相关措辞，不再声称完全匿名
  - [x] SubTask 11.4: 在 3 份政策文档顶部标注"草案，未经法务审核，不得发布"

> 第二轮"项目治理 / 协作 / JD / 风险 / 验收 / 变现模板"已拆为独立 change-id
> `docs-and-team-setup`（路径：`.trae/specs/docs-and-team-setup/`），不在本规格重复定义。
> 关联：6 个 docs/ 文件、`docs/project-charter-inputs.csv`。
> 该规格 Task 1–10 已全部实施并通过 checklist 核验。

## 阶段五：延后项（P2，需真实数据后启动）

- [ ] Task 18: 扩展至首批 10 个计算器（依赖 Task 6-9 的模板稳定）
- [ ] Task 19: 接入分析与错误监控，建立事件字典的真实校验
- [ ] Task 20: 广告位 B 与广告对照实验（需先有稳定流量基线）

---

# Task Dependencies

- Task 3 依赖 Task 1（先降级状态，再改内容，避免在"已审核"标记下修改公式）
- Task 6, Task 7 依赖 Task 5（需要测试运行器）
- Task 3.2/3.3 的最终回填依赖 Task 6, Task 7（期望值由代码推导得出）
- Task 8 依赖 Task 6（页面需要可用的计算函数）
- Task 9 依赖 Task 8
- Task 10.1 依赖 Task 8（需有构建产物）
- Task 12–17（原属本规格）已拆分至独立 change-id `docs-and-team-setup`，本规格不再依赖
- Task 18 依赖 Task 8, Task 9（模板与无障碍方案定型）
- Task 19, Task 20 依赖 Task 18 及真实流量

# 可并行项

- Task 1, Task 2, Task 4 相互独立，可并行
- Task 5 可与 Task 1/2/4 并行
- Task 11 与 Task 1-10 无代码耦合，可随时并行
- Task 6 与 Task 7 在 Task 5 完成后可并行
- 治理层文档（已迁出至 `docs-and-team-setup`）与本规格任何阶段并行

# 待你决策的阻塞项

1. 目标市场（大陆 / 海外华语）——影响托管、分析与广告平台选择，阻塞 Task 18–20 的具体实施
2. 一次性预算与月度运营预算上限——阻塞后续采购与投放类决策
3. 金融/税务/健康类公式是否投入外部专业审核——决定这些计算器能否进入 Task 18 的首批 10 个
4. 启动日与最晚上线日——阻塞发布排期，本规格不写入虚构日期
5. 6 名数字员工各自能承担的实际能力（高/中/低）——影响后续任务的人均负载与是否需要拆分
6. 广告平台账户已开通或未开通——决定广告位从占位进入实际接入的时机
