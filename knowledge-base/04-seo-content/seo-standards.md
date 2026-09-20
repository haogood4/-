---
project: calculator-site
doc_id: seo/standards
type: sop
domain: seo
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: SEO 负责人
last_updated: 2025-01-01
---

# SEO 通用规范

## 1. 标题（Title）

- 长度：≤ 60 字符。
- 模板：`{主关键词}：{价值主张} | 品牌`
- 示例：`房贷计算器：在线计算每月还款金额（等额本息/本金） | CalculatorPro`

## 2. Meta Description

- 长度：120–160 字符。
- 必须含主关键词 + 行动号召。
- 禁止堆砌关键词。

## 3. H 标签层级

```
H1  ← 工具名称（唯一）
H2  ← "如何使用本计算器"
H2  ← "计算公式说明"
H2  ← "结果解读"
H2  ← "常见问题"
H3  ← 各 FAQ 标题
```

## 4. URL

- 全部小写英文，连字符分隔，不含中文。
- 一级：`/finance/mortgage`
- 不超过 3 级。
- 禁止无意义 ID、日期、版本号。

## 5. 图片

- 文件名：`{keyword}-{n}.webp`
- Alt：自然语句，含关键词即可。
- 首屏不依赖大图。

## 6. 内链

- 每个页面至少 3 条站内链接。
- 链接锚文本使用关键词或自然短语，不使用"点击这里"。

## 7. Canonical

- 每个页面必须指定 `canonical`。
- 内容重复（如 AGG 与 MP）使用 301 → AGG。

## 8. Core Web Vitals 目标

| 指标 | 目标 |
|---|---|
| LCP | < 2.5s（移动 4G） |
| INP | < 200ms |
| CLS | < 0.1 |
| TTFB | < 800ms |

## 9. 移动端优先索引

- 内容相同，移动版为首选索引版本。
- 桌面与移动内容必须一致，禁止隐藏正文。
---