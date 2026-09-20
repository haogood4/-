# Checklist

## 一、文档可信性整改

- [x] `knowledge-base/` 下不再存在任何无审核依据的 `status: human-verified`
- [x] `knowledge-base/` 下不再存在任何无审核依据的 `review_status: human-verified`
- [x] 虚构审核人姓名（李四、王五、张三）已全部替换为 `未指派`
- [x] `knowledge-base/README.md` 顶部已声明：本知识库尚无条目通过专业审核
- [x] `decision-log.md` 中 DEC-20250101-001~003 已清空，模板与填写说明保留
- [x] `change-log.md` 中 CHG-001~002 已清空，表头与变更控制流程保留
- [x] `issue-register.md` 中 ISS-001 示例行已清空，表头与流程保留
- [x] `risk-register.md` 的风险条目保留，负责人已改为角色代号而非人名
- [x] 3 份政策文档（privacy / terms / disclaimer）顶部已标注"草案，未经法务审核，不得发布"

## 二、公式与测试向量修正

- [x] `daily/age.yaml` 的周岁算法已改为公历年月日比较，不含天数除以 365.2425
- [x] `daily/age.yaml` 已覆盖 2 月 29 日、生日当天、目标日早于出生日三类边界
- [x] 全部 YAML 的 `test_vectors` 条目均带 `derivation` 字段
- [x] `formula-template.yaml` 已加入 `derivation` 字段说明
- [x] `prepayment-cn.yaml` 与 `income-tax-cn.yaml` 中的模糊期望值已移除或替换为代码推导值
- [x] 全库舍入表述统一为展示层 round-half-up 保留 2 位，"银行家舍入"已删除
- [x] 金融类公式在年利率为 0 时退化为本金均摊，无除零错误

## 三、MCP 配置可用性

- [x] `mcp-config/` 下 10 个 JSON 文件均可被标准 JSON 解析器成功解析
- [x] `mcp.json` 末尾多余的 `---` 已删除
- [x] `mcp.dev.json` 末尾多余的 `---` 已删除
- [x] `servers/` 下 8 个 JSON 末尾多余的 `---` 已删除
- [x] `servers/ga4.json` 末尾残留的 `</content>` 已删除
- [x] `mcp-config/README.md` 已声明 `tier` 字段为团队约定，非技术管控
- [x] `mcp-manual/00-principles.md` 已声明真实管控依赖令牌作用域与分支保护
- [x] Postgres 相关配置与手册已标记 `deferred`，并说明 MVP 不接入

## 四、工程基线

- [x] `package.json` 存在，技术栈为 Astro + TypeScript，版本为实施时受支持版本
- [x] TypeScript strict 模式已启用
- [x] `.gitignore` 已排除 `.env`、`node_modules`、构建产物、`mcp-config/mcp.dev.json`
- [x] `.editorconfig` 已就位
- [x] `pnpm verify` 命令存在，可一次运行类型检查 + 单元测试 + 格式化检查 + MCP JSON 校验 + 构建产物体积检查
- [x] 干净环境安装依赖后执行 `pnpm verify`，退出码为 0
- [x] `src/lib/` 中的计算函数可在无浏览器环境下被单元测试导入并断言

## 五、计算逻辑正确性

- [x] `percentage.ts` 实现三种模式，内部计算不提前舍入
- [x] 百分比校验覆盖：空值、非法字符、NaN/Infinity、占比分母为 0、变化率原值 ≤ 0
- [x] 200 的 15% = 30 通过测试
- [x] 30 占 200 = 15% 通过测试
- [x] 100 → 150 = 增加 50% 通过测试
- [x] 150 → 100 = 减少约 33.333333% 通过测试
- [x] 0 → 100 变化率模式明确报错，不输出 Infinity
- [x] `age.ts` 中 2000-02-29 出生、2025-02-28 目标日的周岁结果为 24
- [x] `date-diff.ts` 首尾日计数规则明确且有测试覆盖
- [x] `percentage.yaml`、`age.yaml`、`date-diff.yaml` 的 `test_vectors` 已回填为单元测试实际输出，标记 `derivation: unit-test`

## 六、端到端样板页面

- [x] 百分比计算器页面包含：面包屑、H1、输入区、计算/重置、结果区、说明、FAQ、相关工具
- [x] 页面加载时不自动聚焦输入框
- [x] 校验失败时保留已填输入，聚焦首个错误字段，不产生结果
- [x] 修改输入后旧结果被标记为需重新计算，不自动更新
- [x] 结果区展示主结果与公式代入过程
- [x] 复制功能可用；分享仅含工具链接，不含用户输入值
- [x] 重置清除结果与错误，不触发计算事件

## 七、无障碍与响应式

- [x] 所有输入均有关联 `label`
- [x] 错误提示使用 `aria-invalid` 与 `aria-describedby`
- [x] 结果区使用 `aria-live="polite"`
- [x] 仅用键盘可完成一次完整计算，焦点可见
- [x] 触控目标 ≥ 44×44 CSS px
- [x] 320px 视口宽度下无横向溢出
- [x] 正文对比度 ≥ 4.5:1

## 八、性能与安全

- [x] 广告位 A 已预留固定尺寸容器，加载不引起布局偏移
- [x] 广告脚本被拦截或加载失败时，计算/复制/分享全部仍可用
- [x] 构建产物体积检查已接入 `pnpm verify`，首屏 JS ≤ 100KB(gzip)、CSS ≤ 30KB，超限则失败
- [x] MCP JSON 语法校验已接入 `pnpm verify`
- [x] 安全响应头已配置：CSP、`X-Content-Type-Options`、`Referrer-Policy`
- [x] 无内联脚本违反 CSP
- [x] 仓库中不存在任何真实令牌或密钥

## 九、文档表述修正

- [x] `performance-budget.md` 已区分实验室与线上两类口径
- [x] "页面加载 < 3 秒"已重新定义为核心表单可见且可操作
- [x] `ymyl-rules.md` 与 `disclaimer.md` 中"逐条预审程序化广告"类承诺已移除
- [x] `privacy-policy.md` 中 GA4 相关措辞不再声称完全匿名

> 验证方式：静态核查代理逐项核对（36/36 通过）+ 浏览器运行时冒烟测试（9/9 通过，
> 覆盖正常计算 / 校验聚焦 / 待重算 / 重置 / 键盘走查 / 320px / aria / CSP）。

> 第 10–15 组验收项（项目基础信息采集 / 协作机制 / 数字员工 JD / 风险与应急 /
> 验收与发布 / 广告变现）已迁出至独立 change-id `docs-and-team-setup`，
> 详见 `.trae/specs/docs-and-team-setup/checklist.md`（已全部核验通过）。
