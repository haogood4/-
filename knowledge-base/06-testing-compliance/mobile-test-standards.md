---
project: calculator-site
doc_id: qa/mobile-standards
type: sop
domain: compliance
locale: zh-CN
version: v1.1.0
status: draft
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# 移动端测试标准

## 设备矩阵

| 设备 | OS | 浏览器 |
|---|---|---|
| iPhone 13 | iOS 16+ | Safari |
| iPhone SE (3rd) | iOS 16+ | Safari |
| Pixel 7 | Android 14 | Chrome |
| Samsung S22 | Android 13 | Chrome |

## 测试项

- 输入控件：滑块 + 数字双输入联动
- 结果区可视：主结果 ≥ 32px（与 `mobile-interaction.md` 一致；验收下限 32px）
- 键盘弹出不影响"计算"按钮（按钮吸底）
- 横竖屏切换不丢输入
- 微信内打开：右上角用浏览器打开的引导

## 性能

- 4G 下首屏 ≤ 3s
- 滚动 60fps

## 可访问性

- 触控目标 ≥ 44×44 px
- 间距 ≥ 8px

## 修订记录

- 2025-01-01 v1.1.0：主结果字号验收下限由 28px 更正为 32px（依据：`remediate-foundation/spec.md` MODIFIED Requirement "结果区字号统一" + `docs/ux-tech-review.md` 冲突 C-04）。理由：原 28px 与 `mobile-interaction.md` 规定的移动端 32px 不一致，导致验收判定歧义。
---