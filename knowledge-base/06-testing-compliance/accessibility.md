---
project: calculator-site
doc_id: qa/a11y
type: sop
domain: compliance
locale: zh-CN
version: v1.1.0
status: draft
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# 可访问性（WCAG 2.1 AA）

## 必须满足

- 语义化 HTML（`<button>`、`<label>`、`<input>` 关联）。
- 颜色对比度 ≥ 4.5:1（大字体 3:1）。
- 键盘可达全部交互；focus ring 可见。
- ARIA 用于动态区域：`aria-live="polite"` 提示结果更新。
- 错误信息既要有视觉红，又要有 `aria-invalid` 与 `aria-describedby`。
- 表头使用 `<th>`；表格使用 `caption`。
- 不依赖颜色单独传达信息。

## 测试工具

- Lighthouse Accessibility ≥ 95
- axe DevTools
- 键盘走查 + NVDA / VoiceOver

## 关于 Lighthouse a11y 分数的说明

- Lighthouse Accessibility 分数作为**回归监控指标**（建议阈值 ≥ 95，仅作趋势告警），**不等于 WCAG 2.1 AA 合规结论**。
- 自动化工具仅覆盖部分可机检规则：颜色对比度、`label` 关联、`aria-invalid` 存在性、Tab 键可达性、触控目标尺寸。
- WCAG 2.1 AA 合规必须叠加**键盘走查 + 屏幕阅读器人工验证**（NVDA / VoiceOver）。
- 具体测试分层详见 `docs/ux-test-strategy.md` §3「可访问性测试分层」。

## 截图规范

- 移动 + 桌面截图归档由 QA 在测试流程中决定，不在本规范中指定具体路径。

## 修订记录

- 2025-01-01 v1.1.0：补充"Lighthouse a11y 分数 ≠ WCAG 合规"声明，明确分数仅作回归监控（依据：`remediate-foundation/spec.md` MODIFIED Requirement "可访问性验收口径"）。理由：原文档以 Lighthouse ≥ 95 作为测试手段之一，容易被理解为分数达标即合规；实际 WCAG 合规必须叠加键盘走查与屏幕阅读器人工验证。
- 2025-01-01 v1.1.0：移除对 `06-testing-compliance/screenshots/` 目录的硬编码引用，改为测试流程决定（依据：同上）。理由：避免规范指向不存在的路径。
---