---
project: calculator-site
doc_id: docs/tool-comparison-with-external
type: audit
locale: zh-CN
version: v1.0
status: ready-for-decision
created: 2026-09-20
purpose: 对照外部"小工具箱"单文件 HTML，识别本项目 50 工具与外部 7 工具的覆盖关系，作为 P2-3 长尾工具优先级决策依据
related: knowledge-base/02-product-requirements/calculator-list-v2.md
---

# 工具覆盖对照表（外部单文件 HTML vs 本项目 Astro 50 工具）

## 一、结论先行

外部「小工具箱」含 **7 个工具**，本项目 Astro 站含 **50 个主工具**。

| 关系 | 数量 | 工具 |
|---|---|---|
| **本项目已覆盖** | 3 | 字数统计、BMI、日期差 |
| **本项目已覆盖且更广** | 1 | 房贷（本项目 11 条金融工具远超单文件 1 条） |
| **本项目未覆盖（增量候选）** | **3** | ①密码生成器 ②颜色转换（RGB↔HEX） ③文本处理（大小写/去空行/繁简） |

**建议**：对**未覆盖的 3 个工具**进行需求评估 + 优先级排序，决定是否纳入 P2-3 长尾批次（按本项目「新增计算器 7 步流程」）。

## 二、详细对照表

| # | 外部工具 | 外部 HTML 证据 | 本项目路由 | 覆盖度 | 优先级建议 |
|---|---|---|---|---|---|
| 1 | 字数统计 | `<section class="tool" id="t1">`（含汉字/字符/标点/行/段统计） | `src/pages/efficiency/word-count-cn.astro` | **已覆盖** | — |
| 2 | 文本处理 | `<section class="tool" id="t2">`（upper/lower/nospace/noline 4 按钮） | **无** | **未覆盖** | P2-3 候选（中等） |
| 3 | 密码生成器 | `<section class="tool" id="t3">`（crypto.getRandomValues，可选 4 类字符） | **无** | **未覆盖** | P2-3 候选（高搜索量） |
| 4 | 颜色转换 | `<section class="tool" id="t4">`（HEX↔RGB + 预览色块） | **无** | **未覆盖** | P2-3 候选（设计师高频） |
| 5 | BMI 计算器 | `<section class="tool" id="t5">`（身高体重→ BMI 分类 + 健康体重范围） | `src/pages/health/bmi-cn.astro` | **已覆盖** | — |
| 6 | 房贷计算器 | `<section class="tool" id="t6">`（等额本息/本金 + 月供明细表） | `src/pages/finance/mortgage-cn.astro` 等 11 条 | **已覆盖且更广** | — |
| 7 | 日期差计算 | `<section class="tool" id="t7">`（两日相差天数 + 倒计时） | `src/pages/daily/date-diff.astro` | **已覆盖** | — |

## 四、未覆盖 3 工具的详细评估

### A. 密码生成器（候选高优）

| 维度 | 内容 |
|---|---|
| 搜索需求 | 「密码生成器」「随机密码」「secure password generator」 — 全球高搜索量词 |
| 用户痛点 | 注册新账号 / 设新密码场景，浏览器自带随机密码难控制字符集 |
| 开发难度 | 中（核心是 `crypto.getRandomValues`，UI 简单） |
| 计算复杂度 | 低（无算法推导，纯随机） |
| SEO 潜力 | 高（关键词精准、需求普遍） |
| 货币化 | 不需（隐私敏感，无广告位友好） |
| 合规风险 | 低（本地生成不上传） |
| **优先级权重** | **高** — 建议纳入 P2-3 第一波 |

实现要点：
- 引擎 `src/lib/calculators/password-generator.ts`（输入：长度/字符集；输出：随机串）
- 单测 ≥6 类（长度边界/字符集组合/极值/NaN/空字符集/字符分布）
- 页面 `src/pages/efficiency/password-generator-cn.astro`
- 脚本 `src/scripts/password-generator-page.ts`
- JSON-LD（SoftwareApplication + FAQPage ≥3）+ 内链 ≥3（指向 word-count-cn / base-converter-cn / timestamp）
- 隐私声明：**生成过程完全本地，不上传任何字符**

### B. 颜色转换 HEX↔RGB（候选中优）

| 维度 | 内容 |
|---|---|
| 搜索需求 | 「HEX转RGB」「RGB转HEX」「颜色转换器」「color converter」 — 设计师 / 前端高频 |
| 用户痛点 | Figma/PS 取色后转 CSS 值；CSS 颜色与设计稿校验 |
| 开发难度 | 低（纯字符串解析+数学转换） |
| 计算复杂度 | 低 |
| SEO 潜力 | 中（搜索量稳定但非爆款） |
| 货币化 | 不需 |
| 合规风险 | 无 |
| **优先级权重** | **中** — 建议纳入 P2-3 第二波 |

实现要点：
- 引擎 `src/lib/calculators/color-converter.ts`
- 单测 ≥6 类（3 位/6 位 HEX、含 #、边界 000/fff/000000/ffffff、非法字符）
- 页面 `src/pages/efficiency/color-converter-cn.astro`
- 实时联动（HEX 改 RGB 自动跟随）

### C. 文本处理（候选低优）

| 维度 | 内容 |
|---|---|
| 搜索需求 | 「文本大小写转换」「去重行」「繁简转换」 — 中等 |
| 用户痛点 | 文案微调、复制粘贴清洗、Markdown 预处理 |
| 开发难度 | 中（4 按钮 + 复制，但繁简转换需 opencc 或轻量字典） |
| 计算复杂度 | 低 |
| SEO 潜力 | 低（搜索词分散） |
| 货币化 | 不需 |
| 合规风险 | 无 |
| **优先级权重** | **低** — 建议**仅做基础 4 按钮**（upper/lower/去空/去换行），繁简暂缓 |

实现要点：
- 引擎 `src/lib/calculators/text-transform.ts`
- 单测 ≥6 类
- 页面 `src/pages/efficiency/text-transform-cn.astro`

## 五、决策点

| 问题 | 选项 |
|---|---|
| Q1：3 个新工具是否全部纳入？ | A) 全部 / B) 仅密码（A） / C) 仅密码 + 颜色 / D) 暂不纳入 |
| Q2：纳入批次？ | A) P2-3 第一波（本周）/ B) P2-3 第二波（下周）/ C) 择机 |
| Q3：文本处理范围？ | A) 仅 4 按钮（upper/lower/去空/去换行）/ B) 含繁简转换（增加字典依赖 ~50KB）/ C) 暂缓 |

## 六、后续动作（待您决策后）

若选「全部纳入」：

| 工具 | 估算工时 | 单测数 | 提交数 |
|---|---|---|---|
| 密码生成器 | 2-3h | ≥8 | 1 |
| 颜色转换 | 1-2h | ≥8 | 1 |
| 文本处理 | 1-2h | ≥6 | 1 |
| 总计 | 4-7h | ≥22 | 3 |

每工具走 P2-3 标准 7 步：
1. 引擎 + 单测
2. 页面 astro
3. 页面脚本
4. JSON-LD（CalcJsonLd 自动）
5. 内链 ≥3（相关工具 + Hub）
6. FAQ ≥3
7. smoke 复检

## 七、外部单文件 HTML 的可借鉴技术要点

尽管不合并文件本身，以下技术点可作为新工具实现的**参考实现片段**（非复制粘贴）：

- **密码生成器**：用 `crypto.getRandomValues(new Uint32Array(len))` 保证密码学安全（比 `Math.random()` 安全），字符集排除易混淆字符（`I/l/1/O/0`）是好做法
- **颜色转换**：3 位 HEX 自动展开为 6 位（`#abc` → `#aabbcc`）是常用 UX 细节
- **文本处理**：使用 `textContent` 而非 `innerHTML`（安全红线）
- **复制功能**：现代浏览器优先用 `navigator.clipboard.writeText`，fallback 提示手动复制

## 八、参考来源

- 外部文件 1：`/home/arch/.config/Trae CN/User/workspaceStorage/.../mu9juqdi-5j2c/_!DOCTYPE....txt`（仅读，未合并）
- 外部文件 2：`/home/arch/下载/部署说明.md`（仅读，未合并）
- 本项目工具清单：[knowledge-base/02-product-requirements/calculator-list-v2.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list-v2.md)
- 本项目新增工具 SOP：[CONTRIBUTING.md](file:///home/arch/项目/计算器网站开发/CONTRIBUTING.md)