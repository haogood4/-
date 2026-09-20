---
project: calculator-site
doc_id: qa/test-template
type: template
domain: compliance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# 测试用例模板（每个计算器一份）

> 必测项（适用于所有计算器）：

## A. 输入测试

| 用例 ID | 输入 | 期望行为 |
|---|---|---|
| TC-IN-01 | 正常输入 | 正确计算 |
| TC-IN-02 | 空字段 | 提示必填，按钮禁用 |
| TC-IN-03 | 非数字字符 | 提示"请输入数字" |
| TC-IN-04 | 负数 | 拒绝（除非业务允许） |
| TC-IN-05 | 极大值（超过 max） | 提示上限 |
| TC-IN-06 | 极小值（< min） | 提示下限 |
| TC-IN-07 | 边界值（min） | 通过 |
| TC-IN-08 | 边界值（max） | 通过 |
| TC-IN-09 | 多位小数 | 按 rounding_rule 处理 |
| TC-IN-10 | 零利率 / 零本金 | 按 edge_cases 处理 |

## B. 公式正确性

| 用例 ID | 输入 | 期望输出 | 来源 |
|---|---|---|---|
| TC-F-01 | YAML test_vectors 1 | 与 expected 一致 | knowledge-base |
| TC-F-02 | YAML test_vectors 2 | ... | ... |

## C. 跨设备 / 跨浏览器

- iPhone Safari（iOS 16+）
- Android Chrome（最新版）
- 桌面 Chrome / Edge / Safari / Firefox

## D. 性能

- Lighthouse Mobile ≥ 90
- LCP < 2.5s
- CLS < 0.1

## E. 可访问性

- 键盘可达全部交互
- 屏幕阅读器朗读正确
- 颜色对比度 ≥ 4.5:1

## F. SEO

- Title / Description 长度符合规范
- Schema 通过 Rich Results 校验
- 内链 ≥ 3 条
- Canonical 正确

## G. 合规

- 显示免责声明
- 来源链接就位
- E-E-A-T 署名展示

## 通过标准

- 全部 A/B/C/D/E 必须通过
- F/G 不通过必须修复后才能发布
---