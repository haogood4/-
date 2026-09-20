# Tasks — 人工复核双签待办清单

- [x] Task 1: 双签待办主清单（Markdown）
  - [x] 1.1 创建 `docs/policy-verifications/dual-sign-todo.md`：文档头（用途/字段说明/状态枚举/排序筛选操作说明/变更记录表）✓
  - [x] 1.2 主表登记首批 7 项（ID/事项/对象文件/优先级/提交时间/状态/第一签/第二签/截止日期/关联档案链接）✓
  - [x] 1.3 每项「复核要点 + 判断标准」明细小节（7 节共 36 条要点，均源自对应核对档案高危发现）✓
  - [x] 1.4 附「按状态速查表」「按截止日期速查表」两个视图 + 状态流转规则表 ✓
  - 验证：字段完整、7 项与核对档案一一对应、链接可达 ✓

- [x] Task 2: CSV 机器可读版
  - [x] 2.1 创建 `docs/policy-verifications/dual-sign-todo.csv`：固定 10 列、7 行与 md 主表一致、UTF-8 ✓
  - 验证：awk 列数校验统一 10 列，无 ASCII 逗号污染 ✓

- [x] Task 3: 既有文档挂接
  - [x] 3.1 `docs/policy-verification-checklist.md` 使用规则追加第 6 条「双签登记」（L15）✓
  - [x] 3.2 `docs/policy-verifications/2026-09/policy-verification-report.md` §6 追加待办清单链接（L52）✓
  - 验证：grep 确认两处引用写入 ✓

- [x] Task 4: 质量门禁
  - [x] 4.1 `prettier --check` 3 个 Markdown 全部通过 ✓
  - [x] 4.2 无 src/ 新变更（本轮仅写 docs/；项目非 git 仓库，以操作记录确认）✓
  - [x] 4.3 dist 页数保持 70（纯 docs 变更不影响构建）✓
  - 验证：全部门禁 PASS ✓

# Task Dependencies

- Task 2 依赖 Task 1 — 已按序完成
- Task 3 依赖 Task 1 — 已完成
- Task 4 依赖 Task 1-3 — 已完成
