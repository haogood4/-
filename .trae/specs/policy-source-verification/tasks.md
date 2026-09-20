# Tasks — 政策资讯原文核对 SOP 实施

- [x] Task 1: 核对 SOP 主文档
  - [x] 1.1 `docs/policy-verification-checklist.md` 10 维度核对清单（每维度含：目标、操作、判定、常见错误示例）
  - 验证：Markdown 文档可阅读、链接完整 ✓

- [x] Task 2: 单篇核对模板
  - [x] 2.1 `docs/policy-verification-template.md` 单篇核对记录模板（含元信息 + 数据/依据 2 张核对表 + 十维度结果表 + 问题清单 + 核对结论 + 签字栏）
  - 验证：模板可直接复制使用 ✓

- [x] Task 3: 核对报告标准格式
  - [x] 3.1 `docs/policy-verification-report-format.md` 批次核对报告标准格式（批次概要 + 单篇索引 + 共性问题 + 改进建议 + 风险等级 + 上线决策 + 三级签字）
  - 验证：报告格式清晰、可追溯 ✓

- [x] Task 4: 既有文档回写
  - [x] 4.1 `docs/content-direction-strategy.md` 0 段「诚实声明」追加核对 SOP 引用 ✓
  - [x] 4.2 `docs/pre-deploy-checklist.md` §12 增加「政策资讯博客上线准入」P0 检查项（8 项 → 9 项）✓
  - 验证：grep 确认引用已写入 ✓

- [x] Task 5: 首批 6 篇博客核对演示
  - [x] 5.1 `docs/policy-verifications/2026-09/` 下 6 篇 `<slug>-verification.md` 全部创建 ✓
  - [x] 5.2 LPR 篇为完整填写示例（明确标注「演示示例，非实际核对结论」）；其余 5 篇为预提取重点核对项占位档案 ✓
  - 验证：6 个档案文件存在 + 1 个示例完整 ✓

- [x] Task 6: 质量门禁
  - [x] 6.1 `tsc --noEmit` 0 error（无代码改动）✓
  - [x] 6.2 `vitest run` 231/231 通过（51 files）✓
  - [x] 6.3 `prettier --check src` All matched files ✓
  - [x] 6.4 4 份新文档 + 6 份档案 Markdown 渲染正常 ✓
  - 验证：所有 CHECK PASS ✓

# Task Dependencies

- Task 2/3 依赖 Task 1（主 SOP 先行）— 已按序完成
- Task 4 依赖 Task 1 — 已完成
- Task 5 依赖 Task 2 — 已完成
- Task 6 依赖 Task 1-5 — 已完成

# 后续（非本 spec 范围）

- 政策研究员按 SOP 对 6 篇博客执行**实际核对**（访问 .gov.cn 原文），替换占位档案并双签
- 数据模型扩展 `verifiedBy`/`verifiedAt`/`sourceDocumentId` 字段（spec 中标记为可选，留待下一迭代）
- 核对完成前，6 篇博客按预部署清单 §12 新 P0 项处于「不得上线」状态
