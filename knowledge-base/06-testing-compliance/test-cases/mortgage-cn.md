---
project: calculator-site
doc_id: qa/test-mortgage-cn
type: test-case
domain: compliance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: QA
last_updated: 2025-01-01
---

# 房贷计算器测试用例（示例）

> 对应 `03-formulas/finance/mortgage-cn.yaml` 的 test_vectors。

## A. 输入测试

| 用例 | 输入 | 期望 |
|---|---|---|
| TC-IN-01 | 100 万 / 4.2% / 30 年 / 等额本息 | 月供 ≈ 4887.49 |
| TC-IN-02 | 贷款金额为空 | 按钮禁用 + 提示 |
| TC-IN-03 | 利率输入 "abc" | 提示"请输入数字" |
| TC-IN-04 | 利率 -1 | 提示 ≥ 0 |
| TC-IN-05 | 贷款金额 1 亿 | 通过（max = 1 亿） |
| TC-IN-06 | 贷款金额 5000 | 提示 ≥ 10000 |
| TC-IN-07 | 贷款金额 10000（min） | 通过 |
| TC-IN-08 | 贷款年限 31 | 提示 ≤ 30 |
| TC-IN-09 | 利率 4.205% | 保留 4 位 → 4.205 |
| TC-IN-10 | 利率 0% | 走线性分摊 |

## B. 公式正确性

| 用例 | 输入 | 期望输出 | 公式 YAML |
|---|---|---|---|
| TC-F-01 | 100万 / 4.2% / 30年 / 等额本息 | 月供 4887.49；总利息 759496.49 | mortgage-cn test_vectors[0] |
| TC-F-02 | 50万 / 0% / 10年 | 月供 4166.67；总利息 0 | mortgage-cn test_vectors[1] |
| TC-F-03 | 100万 / 4.2% / 30年 / 等额本金 | 首月 ≈ 6277.78 | mortgage-cn test_vectors[4] |

## C. 跨设备 / 跨浏览器

通过 Playwright 自动化：

- [ ] iPhone 13 Safari
- [ ] Pixel 7 Chrome
- [ ] Desktop Chrome / Firefox / Safari / Edge

## D. 性能

- [ ] Lighthouse Mobile ≥ 90
- [ ] LCP ≤ 2.5s
- [ ] CLS ≤ 0.1

## E. 可访问性

- [ ] 键盘可达全部输入
- [ ] 错误提示可被屏幕阅读器朗读

## F. SEO

- [ ] Title ≤ 60 字符
- [ ] Schema 通过 Rich Results
- [ ] Canonical 指向自身

## G. 合规

- [ ] 免责声明显示
- [ ] 至少 1 条 official 来源
- [ ] 审核人姓名展示
---