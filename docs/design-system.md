---
project: calculator-site
doc_id: docs/design-system
type: sop
domain: governance
locale: zh-CN
version: v2.0.0
status: active
effective_from: 2026-09-19
owner: UX
last_updated: 2026-09-19
---

# 计算器网站 设计系统规范 v2.0.0

> **v2.0.0 变更摘要（2026-09-19，前端 UI/UX 全面重设计）**
> - 品牌色由通用蓝 `#0066cc` 切换为深青 `#0f766e` 系（BREAKING，视觉层）；favicon、og-image、theme-color 同步重制
> - 新增全站 `SiteHeader` 导航（6 分类 + 移动汉堡菜单）与 `menu.js` 外链脚本
> - 新增 6 分类色彩系统（finance/health/renovation/investment/efficiency/daily，含 soft 底）
> - 新增动效令牌（150/250/300ms + ease-out）与 `prefers-reduced-motion` 全局降级
> - 排版改为流式 clamp 阶梯；间距改为 4px 基准 8 阶（v1 为 8px 基准 5 阶）
> - `global.css` 按 ITCSS 分层重构，**保留全部既有类名**，50 页零改动继承
> - v1 中仍有效的约定：广告位尺寸约束（300×250 / 728×90，固定尺寸防 CLS）、组件状态机（输入框/按钮/结果区/错误提示/广告容器五节，继续适用，色值以本文令牌表为准）

**令牌真实来源**：`src/styles/global.css` `:root`（本文逐条抄录，两者不一致时以代码为准并回改本文档）。

---

## 1. 设计令牌

### 1.1 色彩 —— 品牌与语义

| 令牌名 | 取值 | 用途 |
| --- | --- | --- |
| `--color-primary` | `#0f766e` | 品牌主色（深青）：链接、主按钮、焦点环、logo |
| `--color-primary-strong` | `#115e59` | 主按钮悬停/按压加深态 |
| `--color-primary-soft` | `#ccfbf1` | 输入聚焦光环、按键按压底色 |
| `--color-primary-faint` | `#f0fdfa` | hero 渐变起色、finance 分类 soft 底 |
| `--color-accent-warm` | `#b45309` | 琥珀强调色：YMYL 免责提示文字 |
| `--color-accent-warm-soft` | `#fef3c7` | YMYL 免责提示底色 |
| `--color-bg-page` | `#ffffff` | 页面整体背景 |
| `--color-bg-surface` | `#fafaf9` | 卡片、结果区、输入容器表面背景 |
| `--color-bg-subtle` | `#f5f5f4` | 次级表面（预留） |
| `--color-text-primary` | `#1c1917` | 主要正文与标题文字 |
| `--color-text-secondary` | `#57534e` | 辅助说明、次级信息、导航默认文字 |
| `--color-text-muted` | `#78716c` | 弱化文字（分类计数、FAQ 加号） |
| `--color-border` | `#e7e5e4` | 输入框、按钮、卡片、分隔线描边 |
| `--color-border-strong` | `#d6d3d1` | 加强描边（预留） |
| `--color-error` | `#b91c1c` | 行内错误提示、错误态边框、清除键文字 |
| `--color-success` | `#15803d` | 成功/确认态、daily 分类色（同值） |

**兼容别名**（防止页面/脚本引用旧令牌名）：`--color-accent` → `--color-primary`；`--color-accent-strong` → `--color-primary-strong`。

### 1.2 色彩 —— 6 分类色标

每组含主色（色条/圆点/左边框）与 soft 底（徽章/浅底），由 `body[data-category="…"]` 与 `.cat-card--{key}` 修饰类驱动。

| 分类 | 令牌 | 主色 | soft 底 |
| --- | --- | --- | --- |
| 金融理财 finance | `--cat-finance` / `-soft` | `#0f766e` | `#f0fdfa` |
| 健康生活 health | `--cat-health` / `-soft` | `#be123c` | `#fff1f2` |
| 装修家居 renovation | `--cat-renovation` / `-soft` | `#c2410c` | `#fff7ed` |
| 投资专业 investment | `--cat-investment` / `-soft` | `#6d28d9` | `#f5f3ff` |
| 效率工具 efficiency | `--cat-efficiency` / `-soft` | `#1d4ed8` | `#eff6ff` |
| 日常工具 daily | `--cat-daily` / `-soft` | `#15803d` | `#f0fdf4` |

### 1.3 排版（流式 clamp 阶梯）

字体栈：`system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`（不引入网络字体）。等宽（公式/计算器显示屏）：`ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`。

| 令牌名 | 取值 | 用途 |
| --- | --- | --- |
| `--font-size-xs` | `12px` | 角注、广告标签、分类计数 |
| `--font-size-sm` | `14px` | 表单标签、提示、面包屑、导航链接 |
| `--font-size-base` | `16px` | 默认正文（body line-height 1.6） |
| `--font-size-lg` | `clamp(18px, 1.2vw + 14px, 20px)` | 按钮文字、logo、区块小标题 |
| `--font-size-h2` | `clamp(20px, 1.5vw + 15px, 24px)` | h2（line-height 1.4） |
| `--font-size-h1` | `clamp(24px, 2vw + 16px, 32px)` | h1 / hero 标题（line-height 1.3–1.35） |
| `--font-size-result` | `clamp(28px, 3.5vw + 14px, 44px)` | 结果区主结果、计算器显示屏（tabular-nums） |

### 1.4 间距（4px 基准 8 阶）

| 令牌名 | 取值 | 典型用途 |
| --- | --- | --- |
| `--space-1` | 4px | 导航列表纵向间隙 |
| `--space-2` | 8px | 标签与输入框、chip 间隙、色点外边距 |
| `--space-3` | 12px | 输入框水平内边距、h1 色条右距 |
| `--space-4` | 16px | 组件默认内边距、卡片内距、区块标题下距 |
| `--space-5` | 24px | 按钮水平内边距、卡片/结果区上外边距 |
| `--space-6` | 32px | 区块（.section）上外边距、hero 上内边距 |
| `--space-7` | 48px | 页脚上外边距 |
| `--space-8` | 64px | 页面级大间隔（预留） |

### 1.5 圆角 / 阴影 / 动效

| 令牌名 | 取值 | 用途 |
| --- | --- | --- |
| `--radius-sm` | `6px` | 按钮、输入框、chip 内元素、色条 |
| `--radius-md` | `10px` | 卡片、结果区、field-group、显示屏 |
| `--radius-lg` | `16px` | 大型容器（广告外框） |
| `--shadow-sm` | `0 1px 2px rgba(28,25,23,.06)` | 输入框、主按钮、分类卡轻微抬升 |
| `--shadow-md` | `0 4px 12px rgba(28,25,23,.08)` | 卡片、结果区、移动菜单面板 |
| `--shadow-lg` | `0 8px 24px rgba(28,25,23,.12)` | 分类卡悬停加强态 |
| `--duration-fast` | `150ms` | 颜色/边框/阴影微过渡 |
| `--duration-base` | `250ms` | 汉堡条变形、结果入场动画 |
| `--duration-slow` | `300ms` | 动效上限（菜单滑出等，不得超越） |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.3, 1)` | 全站统一缓动 |

---

## 2. 对比度矩阵（WCAG 2.1 AA）

正文阈值 ≥4.5:1。全部文本-背景组合实测值：

| 前景 | 背景 | 比值 | 判定 |
| --- | --- | --- | --- |
| `#ffffff` | `--color-primary` `#0f766e` | **5.47** | AA ✓ |
| `#ffffff` | `--color-accent-warm` `#b45309` | **5.02** | AA ✓ |
| `#ffffff` | `--color-text-muted` `#78716c` | **4.80** | AA ✓ |
| `#ffffff` | `--color-text-secondary` `#57534e` | **7.63** | AA ✓ |

6 分类色对 white 底（用于色条/圆点旁的文字、悬停反白）与各自 soft 底（徽章/浅底文字）：

| 分类 | 对 white | 对 soft 底 | 判定 |
| --- | --- | --- | --- |
| health `#be123c` / `#fff1f2` | **6.29** | **5.72** | AA ✓ |
| renovation `#c2410c` / `#fff7ed` | **5.18** | **4.88** | AA ✓ |
| investment `#6d28d9` / `#f5f3ff` | **7.10** | **6.48** | AA ✓ |
| efficiency `#1d4ed8` / `#eff6ff` | **6.70** | **6.16** | AA ✓ |
| daily `#15803d` / `#f0fdf4` | **5.02** | **4.79** | AA ✓ |
| finance `#0f766e` / `#f0fdfa` | **5.47** | **5.25** | AA ✓ |

**全部 ≥4.5，通过 AA。** 新增色对使用时必须先补测并回填本表。

---

## 3. 组件规范

### 3.1 SiteHeader（`src/components/SiteHeader.astro`）

- 结构：`<header class="site-header">` sticky 置顶（`top:0; z-index:50`），内部 `.site-header__inner` flex 两端对齐，max-width 1120px，min-height 64px。
- Logo：`.site-logo`（内联计算器图标 SVG `currentColor` 继承品牌色 + 文字"计算器大全"），`aria-label="计算器大全 首页"`，图标 `aria-hidden="true"`。
- 导航：`<nav class="site-nav" aria-label="主导航">` 含 6 分类链接（`/#finance` 等锚点）；当前分类由 URL 首段推导（math/unit/dev 归入 efficiency），加 `.is-active` + `aria-current="page"`。
- 移动菜单行为（<1024px）：`.nav-toggle` 汉堡按钮（44×44px，`aria-expanded`/`aria-controls="site-nav-list"`），`.site-nav` 默认 `display:none`，`.is-open` 展开为全宽下拉面板；三条横线经 `[aria-expanded="true"]`/`.is-open` 变形为 X。键盘：Tab 可达、Enter/Space 开关、Esc 关闭并归还焦点至按钮、点击菜单外关闭、点击链接后关闭、resize ≥1024px 自动收起。
- **CSP 外链脚本**：行为逻辑位于 `public/menu.js`，以 `<script is:inline defer src="/menu.js">` 引入——CSP `script-src 'self'` 禁止内联脚本，故逻辑必须外置为同源文件；`defer` 保证 DOM 就绪后执行。

### 3.2 表单与按钮（50 工具页共用契约）

- `.btn`：inline-flex、min-width 44px、padding `10px var(--space-5)`、`--radius-sm`；`.btn-primary` 主色底白字（5.47:1）+ hover 加深 `--color-primary-strong`；`.btn-secondary` 白底描边；`.btn:disabled` 灰文字 `cursor:not-allowed`。状态机沿用 v1 §2.2。
- `.field`：上外边距 `--space-4`（首项归零）；label 块级 600 字重 sm 字号。`.field-group`/`legend` 用于单选/分组。`.field-input`/`.field-select`：min-height 44px、`--shadow-sm`；聚焦 `border-color: primary` + `0 0 0 3px var(--color-primary-soft)` 光环；`aria-invalid="true"` 红边框；禁用灰底。`.field-hint`/`.field-error` 为行下提示（error 用 `--color-error`）。状态机沿用 v1 §2.1。
- `.form-actions`：flex wrap，gap `--space-4`。

### 3.3 结果区 `.result`

灰底表面卡（`--shadow-md`、`--radius-md`）：`.result-empty`（占位，min-height 44px）、`.result-caption`、`.result-main`（`--font-size-result` 700 字重 tabular-nums）、`.result-process`、`.result-hint`（错误红）、`.result-actions`。`aria-disabled="true"` 时主结果转灰色提示重算。`#result-content` hidden→可见时以纯 CSS `result-in` 关键帧淡入上移 8px（250ms ease-out）。状态机沿用 v1 §2.3。

### 3.4 计算器键盘 `.calc-*`（四则运算页）

`.calc` 纵排 max-width 480px；`.calc-display` 等宽右对齐 `--font-size-result`、min-height 64px、`.is-error` 红字红边；`.calc-keypad` 4 列 grid gap 8px；`.calc-key` min-height 56px（≥44 触控），修饰类 `.is-operator`（主色字）、`.is-equals`（主色底白字）、`.is-clear`（红字）、`.is-action`、`.calc-key--wide`（跨 4 列）；hover 上浮 1px、active `scale(.98)` + `--color-primary-soft` 底。`.calc-hint` 错误提示预留 1.2em 高防跳动。

### 3.5 FAQ `.faq-item`

原生 `<details>/<summary>`：summary flex 两端、min-height 44px（整行可点）、`::after` 折叠指示 `+` → 展开 `−`（U+2212），颜色 `--color-text-muted`。

### 3.6 面包屑 `.breadcrumb`

`nav[aria-label] > ol > li`，分隔符 `li+li::before { content:"/" }`；末级前 `.breadcrumb__dot`（8px 圆点，默认主色），颜色由 `body[data-category="…"] .breadcrumb__dot` 修饰组取对应分类色。h1 左侧 `::before` 渲染 4px×1em 分类色条（同 `data-category` 修饰组）。分类链接维持 `href:"/"`（避免 50 页改动）。

### 3.7 首页 hero 与分类卡

- `.hero`：`--color-primary-faint → #fff` 纵向渐变底，padding `--space-6 0 --space-4`；`.hero__title`（h1 级 clamp）、`.hero__sub`（max-width 60ch）、`.hero__chips`（flex wrap gap 8px）。
- `.chip`：胶囊（radius 999px）主色 soft 底 + `--color-primary-strong` 字，min-height 44px，hover 反白（白字主色底）。
- `.cat-grid`：grid 1/2/3 列（见 §4）；`.cat-card`：surface 底卡 + 4px 分类色左边框，内含 `.cat-card__head`（`.cat-card__dot` 10px 圆点 + `.cat-card__title` + `.cat-card__count` 右靠）、工具链接列表；修饰类 `.cat-card--{finance|health|renovation|investment|efficiency|daily}` 同时改边框与圆点色。hover 上浮 + `--shadow-lg`。

### 3.8 其他

`.card`（内容卡）、`.section`（区块，h2 + p 节奏）、`.formula-list/.formula-item`（公式左色条 + code 徽片）、`.note-list`、`.tool-list`、`.lead`、`.ymyl-notice`（琥珀左色条免责条）、`.ad`/`.ad-label`（广告占位，见 §4 尺寸）、`.site-footer`（上边框 + nav flex + `.footer-meta`）、`.container`、`.visually-hidden`、`.skip-link`。

---

## 4. 响应式断点规则

| 断点 | 范围 | 容器 | 布局变化 | 广告位 |
| --- | --- | --- | --- | --- |
| 移动 | `<768px` | 100%（≤720px），padding 左右 10px（≥480px 起 16px） | 单列；汉堡菜单；cat-grid 1 列 | 300×250 |
| 平板 | `≥768px` | max-width **768px** 居中 | cat-grid **2 列**；仍显汉堡 | 300×250 |
| 桌面 | `≥1024px` | max-width **1120px** 居中 | cat-grid **3 列**；**隐藏 `.nav-toggle`**、`.site-nav` 转横排 static | 728×90 |

- **320px 兼容**：`.ad` 固定 300px + `.container` 左右 padding 10px = 320px 恰好放下，无横向滚动；`.ad` 另设 `max-width:100%` 兜底。
- 广告位**尺寸约束沿用 v1**：300×250（<1024px）/ 728×90（≥1024px），空容器固定尺寸防 CLS，状态机见 v1 §2.5（继续有效）。
- 断点切换用流式 clamp 字号与固定间距，避免重排跳变；触控目标全程 ≥44×44px。

---

## 5. 动效规范

- 时长：微过渡 `--duration-fast` 150ms；状态变形/入场 `--duration-base` 250ms；任何动效不得超过 `--duration-slow` 300ms。缓动统一 `--ease-out`。
- 实现：全部 transition/animation 包裹于 `@media (prefers-reduced-motion: no-preference)`；另有 `reduce` 下 `transition-duration/animation-duration: 0s !important` 全局兜底——**偏好减少动效时全关**，功能不受影响。
- 反馈模式：hover 上浮 1px + 阴影升级；active `scale(.98)`；结果入场淡入 + 上移 8px；汉堡条 250ms 变形 X。禁止 JS 驱动动画（结果入场为 hidden 切换触发的纯 CSS 重放）。

---

## 6. 类名契约冻结清单

以下类名为 50 个工具页（及首页/组件）DOM 契约，`src/scripts/*-page.ts` 与页面模板直接引用。**任何改名/删除必须全站回归 52 页后方可合入**：

```
ad, ad-label, breadcrumb, breadcrumb__dot, btn, btn-primary, btn-secondary,
calc, calc-display, calc-hint, calc-key, calc-keypad, calc-key--wide,
card, cat-card, cat-card--{finance|health|renovation|investment|efficiency|daily},
cat-card__count, cat-card__dot, cat-card__head, cat-card__title, cat-grid,
chip, container,
faq-item, field, field-error, field-group, field-hint, field-input, field-select,
footer-meta, form-actions, formula-item, formula-list,
hero, hero__chips, hero__sub, hero__title,
is-active, is-clear, is-error, is-equals, is-open, is-operator, is-action,
lead, nav-toggle, nav-toggle__bar, note-list,
result, result-actions, result-caption, result-empty, result-hint, result-main, result-process,
section, site-footer, site-header, site-header__inner, site-logo, site-logo__mark,
site-nav, site-nav__link, site-nav__list, skip-link, tool-list, visually-hidden, ymyl-notice
```

配套 DOM 契约：`#main`（skip-link 目标）、`#result-content`（入场动画锚点）、`#site-nav-list`（aria-controls 目标）、`body[data-category]`（分类修饰钩子）。

---

## 7. 无障碍规范

- **Landmark**：`header`（SiteHeader）→ `main#main`（各页内容）→ `footer`（SiteFooter）；导航区 `<nav aria-label="主导航">`、面包屑独立 nav 标注。
- **Skip-link**：`.skip-link` 位于 body 首个可聚焦元素，`href="#main"`，默认移出视口（`left:-9999px`），`:focus-visible` 时显于左上角（top/left 8px，z-index 100）。
- **焦点环**：全局 `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`；输入框另加 soft 色光环。
- **触控目标**：交互元素（button/input/select/summary/a）全局 `min-height:44px`；必要元素补 `min-width:44px`（btn、field-input、calc-key、nav-toggle）；行内文本链接（breadcrumb、tool-list）按 **WCAG 2.5.8 内联豁免**处理。
- **ARIA 模式**：汉堡 `aria-expanded` + `aria-controls`；当前页 `aria-current="page"`；错误输入 `aria-invalid` + `aria-describedby`；结果区 `aria-live`（由页面模板提供）与 `aria-disabled`；装饰性 SVG `aria-hidden="true" focusable="false"`；"菜单"文字 `.visually-hidden`。
- **动效**：`prefers-reduced-motion: reduce` 全关（§5）。
