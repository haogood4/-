---
project: calculator-site
doc_id: prd/mobile-interaction
type: sop
domain: product
locale: zh-CN
version: v1.1.0
status: draft
effective_from: 2025-01-01
owner: 产品经理
last_updated: 2025-01-01
---

# 移动端交互通用规范

适用于所有计算器页面的移动端交互。

## 1. 布局

- 移动优先；桌面端采用单列居中，最大宽度 720px。
- 顶部：面包屑 + 工具名（≤40 字）。
- 中部：输入区 + 计算按钮（常规文档流，输入区正下方）。
- 底部：结果区 + 解释 + FAQ + 相关工具。

## 2. 输入控件

- **数值字段**：
  - `inputmode="decimal"`；
  - 提供 `type="number"` + `pattern`；
  - 标签必须紧贴输入框上方；
  - 默认单位后置（例如：元 / %）。
- **日期**：使用 `<input type="date">`，避免自定义日历。
- **选择**：使用原生 `<select>`，避免重写。

## 3. 错误展示

- 行内错误：输入框下方红色提示；按钮置灰。
- 整页错误：顶部 alert；保留输入值。

## 4. 结果展示

- 主结果字号：移动 32px，桌面 48px。
- 次结果字号：14–16px，颜色 #666。
- 一键复制：长按或点击"复制结果"。
- 分享：使用 Web Share API；不支持时降级为复制 URL。

## 5. 性能

- 首屏 JS < 100KB（gzip）。
- 图片 WebP；首屏不使用大图。
- 字体：自托管子集化字体；避免 Google Fonts 阻塞。

---

## 修订记录

- 2025-01-01 v1.1.0：移除"计算按钮吸底"要求，改为常规文档流（依据：`remediate-foundation/spec.md` MODIFIED Requirement "计算按钮定位" + `docs/ux-tech-review.md` 冲突 C-01）。理由：吸底按钮与 iOS Safari 软键盘冲突，且与"广告不得遮挡计算按钮"叠加风险升高。若后续需要吸底，必须先完成 iOS Safari 与 Android Chrome 真机验证。
- 2025-01-01 v1.1.0：移除数值字段滑块联动要求（依据：`remediate-foundation/spec.md` MODIFIED Requirement "数值输入控件范围" + `docs/ux-tech-review.md` 冲突 C-02）。理由：滑块对金额、利率等需精确输入的字段会降低精度可控性，增加状态同步复杂度与无障碍实现成本。MVP 阶段仅保留数字输入；待出现区间探索需求时按单个计算器单独评估后引入。
- 2025-01-01 v1.1.0：主结果字号统一为移动端 32px / 桌面端 48px（依据：`remediate-foundation/spec.md` MODIFIED Requirement "结果区字号统一" + `docs/ux-tech-review.md` 冲突 C-04），与 `mobile-test-standards.md` 一致。