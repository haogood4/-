# Checklist — 政策资讯原文核对 SOP

## 主 SOP 文档
- [x] `docs/policy-verification-checklist.md` 已创建
- [x] 10 维度全部覆盖（文本/数据/依据/格式/逻辑/术语/敏感/附件/修订/最终）
- [x] 每维度含「目标、操作步骤、判定标准、常见错误示例」4 项内容
- [x] Markdown 渲染正常
- [x] 含使用规则 5 条（上线准入/单篇独立/双签生效/时效复核/禁止臆断）

## 单篇模板
- [x] `docs/policy-verification-template.md` 已创建
- [x] 含「元信息 + 数据核对表 + 政策依据核对表 + 十维度结果表 + 问题清单 + 核对结论 + 签字栏」7 段
- [x] 可直接复制粘贴使用

## 报告格式
- [x] `docs/policy-verification-report-format.md` 已创建
- [x] 含「批次概要 + 单篇索引 + 共性问题 + 改进建议 + 风险等级 + 上线决策 + 签字」7 段
- [x] 报告归档目录规范：`docs/policy-verifications/YYYY-MM/`

## 既有文档回写
- [x] `docs/content-direction-strategy.md` 0 段「诚实声明」追加 SOP 引用
- [x] `docs/pre-deploy-checklist.md` §12 增加「政策资讯博客上线准入」P0 检查项（9 项计数同步更新）

## 首批 6 篇演示
- [x] `docs/policy-verifications/2026-09/lpr-2026-september-verification.md`（完整填写示例，标注「演示示例」）
- [x] `docs/policy-verifications/2026-09/individual-income-tax-annual-filing-2027-verification.md`（占位 + 预提取核对项）
- [x] `docs/policy-verifications/2026-09/medical-insurance-personal-account-2026-verification.md`（占位 + 预提取核对项）
- [x] `docs/policy-verifications/2026-09/existing-mortgage-rate-batch-adjustment-verification.md`（占位 + 预提取核对项）
- [x] `docs/policy-verifications/2026-09/personal-pension-fully-implemented-verification.md`（占位 + 预提取核对项）
- [x] `docs/policy-verifications/2026-09/cross-border-ecommerce-export-tax-2026-verification.md`（占位 + 预提取核对项）

## 质量门禁
- [x] `tsc --noEmit` 0 error（无代码改动）
- [x] `vitest run` 231 tests passed (51 files)
- [x] `prettier --check src` All matched files
- [x] 新文档 Markdown 渲染正常

## 合规
- [x] 强制核对流程已写入预部署清单（P0）
- [x] 上线准入门槛已定义（核对结论必须为「通过」或「有条件通过（已闭环）」+ 双签）
- [x] 报告归档目录已规范（`docs/policy-verifications/YYYY-MM/`）
- [x] 诚实性保障：示例档案明确标注「演示示例，非实际核对结论」，未伪造通过结论
