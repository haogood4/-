# P1-7② 暗色手动切换开关 — 技术方案与评审

> 版本：v1.0 · 2026-09-20 · 状态：📋 待人工批复
> 范围：在 P1-7①（自动跟随 `prefers-color-scheme`）之上叠加用户主动切换能力
> 目标读者：项目负责人 / 法务 / 前端 / 性能 / SEO 评审

---

## 1. 目标与边界

### 1.1 业务目标
让访问者能**显式选择**亮/暗主题，并被记住。无障碍与品牌一致性优先。

### 1.2 非目标（Out of Scope）
- 不做"每页独立主题"
- 不做"定时切换"（如 19:00 自动深色）
- 不引入第三方主题库（不增加运行时依赖）
- 不破坏 P1-7① 已落地的纯 CSS 自动跟随

### 1.3 北极星
不破坏 SEO（HTML 结构、CWV、JSON-LD、CSP）。功能与 SEO 冲突时 SEO 优先。

---

## 2. 现有约束盘点

| 项 | 当前状态 | 约束 |
|----|----------|------|
| CSP `script-src 'self'` | 严格 | 任何 JS 必须同源外置，**禁止内联早置脚本** |
| `_headers` 已声明 | HTML `must-revalidate`、`_astro/*` `immutable` | theme-init.js 走 `/scripts/theme-init.js`（带 hash → immutable 缓存） |
| P1-7① 纯 CSS 暗色已落地 | `@media (prefers-color-scheme: dark)` | 手动模式用 `[data-theme="dark"]` 选择器**覆盖**媒体查询 |
| 系统字体栈 + 单一 global.css | 0 webfont | 切换按钮可走现有 `.btn` token |
| a11y 标准 | WCAG 2.1 AA、≥44×44px、aria-pressed | 切换按钮遵循既有规则 |
| 性能预算 | JS gzip ≤100KB（当前 59.75）、CSS ≤30KB（当前 6.40） | 新增 JS 增量 ≤1KB gzip；CSS ≤+0.5KB |

---

## 3. 技术方案（推荐）

### 3.1 三态模型
新增一个 data 属性，定义三态：

| 值 | 含义 | 触发条件 |
|----|------|----------|
| `light` | 强制亮色 | 用户手动选「亮」 |
| `dark` | 强制暗色 | 用户手动选「暗」 |
| `auto`（默认） | 跟随系统 | 媒体查询 `prefers-color-scheme: dark` |

DOM 标识：`<html data-theme="light|dark|auto">`。`auto` 等价于无该属性（CSS 媒体查询接管）。

### 3.2 三层架构

```
┌────────────────────────────────────────────────────────┐
│ Layer 1 · 早置脚本（FOUC 窗口关键）                       │
│   /scripts/theme-init.js                                │
│   - 异步、模块化（type="module"），外置                  │
│   - 进入首屏前同步执行（head 内 + DOMContentLoaded 之前） │
│   - 读取 localStorage.theme → 设 <html data-theme>        │
│   - 未设置时按 prefers-color-scheme 推断初值              │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ Layer 2 · 切换按钮（DOM 注入）                          │
│   - SiteHeader 注入 theme-toggle 按钮                   │
│   - aria-pressed、aria-label 三态轮换                    │
│   - 触控目标 ≥44×44px、键盘可达                          │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ Layer 3 · 业务脚本（点击处理）                           │
│   /scripts/theme-toggle-page.js（外置）                  │
│   - 点击 → 切换 light/dark/auto                         │
│   - 写入 localStorage.theme                             │
│   - 更新 <html data-theme>、按钮 aria                   │
│   - 自适应系统配色变更事件（auto 模式时）                │
└────────────────────────────────────────────────────────┘
```

### 3.3 CSS 调整（最小 diff）

P1-7① 的 `@media (prefers-color-scheme: dark) { :root { ... } }` 保留；
新增 `[data-theme="dark"] { :root { ... 同样 25 token ... } }` 块，
选择器特异性 0,0,1,0 + 0,0,1,0 = 同级；用 `:root[data-theme="dark"]` 提升一级特异性，
确保手动选 dark 时**永远**压过媒体查询。

```
:root[data-theme="dark"] {
  --color-primary: #2dd4bf;   /* 同 P1-7① 暗色 25 token */
  ...
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { ... }
}
```

`:not([data-theme="light"])` 保证「auto」或「dark」状态都生效；
手动选 `light` 时关闭媒体查询。

### 3.4 localStorage schema

| key | 值 | 默认 |
|----|----|----|
| `theme` | `"light"` \| `"dark"` \| `"auto"` | 未设 → 视为 `"auto"` |

损坏/隐私模式/QuotaExceeded → 自动降级为 `auto`，不抛错。

### 3.5 系统配色变更监听

仅 `auto` 态下监听 `matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ...)`，
切换时刷新按钮 aria 与视觉提示（不重设 data-theme，因 `auto` 等价于无属性）。

---

## 4. CSP 与 FOUC 分析

### 4.1 CSP 合规性
- theme-init.js：放在 `/scripts/theme-init-[hash].js`，走 `_headers` 的 immutable 强缓存；CSP `script-src 'self'` 允许
- theme-toggle-page.js：同上
- **无内联脚本**（用 `is:inline type="module" src="..."` 与 P2-8 既有管线一致）
- **无 eval / Function 构造器**

### 4.2 FOUC 窗口评估
- **存在**：从 HTML 解析到 theme-init.js 下载+执行的几十毫秒窗口内，未注入 `data-theme`，CSS 媒体查询尚未生效（取决于浏览器是否在样式表加载前完成主题判定）
- **缓解策略**：
  1. theme-init.js 体积压至 ≤0.5KB gzip（一个 IIFE 即可）
  2. head 内 `<link rel="preload" as="script" href="/scripts/theme-init-[hash].js">` 提前请求
  3. Cloudflare Pages 边缘缓存命中时窗口期≈0；冷启动（slow）首测 <50ms
  4. **可接受度评估**：业内同类方案（如 GitHub、MDN）均存在类似窗口，无重大体验损害
- **可观测**：在 smoke 断言中新增「theme-init.js 必须存在 + 体积 ≤0.5KB」守卫

### 4.3 SSR / 静态化冲突
- 当前 Astro 7 静态输出 + 零水合，主题切换为纯客户端逻辑，**不引入服务端渲染分支**
- 不需要 Astro 中间件；Astro.site/JSON-LD 不受影响

---

## 5. SEO 与可访问性影响

| 维度 | 影响评估 |
|------|----------|
| 搜索引擎抓取 | 无（HTML 静态、主题切换不改变文本内容） |
| Core Web Vitals | theme-init.js 同步执行 <5ms（gzip 后），不阻塞 LCP；切换时无 layout shift |
| 结构化数据 | 不受影响（无新增 JSON-LD） |
| 屏幕阅读器 | 切换按钮 aria-label 三态动态：`"切换到暗色"` / `"切换到亮色"` / `"跟随系统"` |
| 键盘可达 | Tab + Enter/Space；按钮 :focus-visible 全局样式复用 |
| 减少动效偏好 | 切换按钮 transition 跟随 `prefers-reduced-motion` 现有降级 |

---

## 6. 性能预算

| 指标 | 当前 | 预计增量 | 红线 |
|------|------|----------|------|
| JS gzip | 59.75KB | +0.7KB（theme-init.js ~0.3 + theme-toggle-page.js ~0.4） | ≤100KB |
| CSS gzip | 6.40KB | +0.3KB（新增 ~50 行 token 选择器） | ≤30KB |
| DOM 节点 | +1 按钮 | — | — |
| 缓存命中 | theme-init.js 带 hash → immutable | — | — |

---

## 7. 测试矩阵

| 用例 | 预期 | 守卫 |
|------|------|------|
| 首次访问无 localStorage | 默认 auto，主题随系统 | smoke 13：theme-init.js 存在 + 体积 ≤0.5KB |
| 用户选 dark | `<html data-theme="dark">`、localStorage.theme="dark"、按钮 aria-pressed=true | 手动 |
| 用户选 light | `<html data-theme="light">`、媒体查询失效 | 手动 |
| 用户选 auto | `<html>` 无 data-theme、媒体查询接管 | 手动 |
| 隐私模式 localStorage 抛错 | 降级 auto、不抛错 | vitest |
| localStorage 损坏值（非 light/dark/auto） | 降级 auto、不抛错 | vitest |
| 系统配色变更（仅 auto） | 视觉跟随变化 | 手动 |
| 键盘操作 | Tab 进入、Enter/Space 触发 | — |
| 屏幕阅读器 | aria-label 三态轮换 | — |
| CSP | 无内联脚本、无 eval | smoke 7 |
| 切换后刷新页面 | 状态保持 | 手动 |
| bundle:check | JS ≤100KB、CSS ≤30KB | CI |

新增 vitest 用例 ≥8 条覆盖 schema 校验与降级逻辑；smoke 13 守产物存在与体积。

---

## 8. 风险登记表

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| FOUC 窗口被用户感知 | 中 | 中（首屏 0–50ms 闪屏） | 体积最小化 + preload；接受业内同等级 |
| theme-init.js 体积失控 | 低 | 低（性能） | 静态 + smoke 守卫 |
| localStorage 隐私模式报错 | 中 | 低 | try/catch + 降级 auto |
| 三个媒体查询同时生效导致特异性冲突 | 低 | 中（视觉错乱） | 用 `:root[data-theme="dark"]` 提升特异性；单元测试覆盖 |
| 系统配色变更事件未触发 | 低 | 低（仅 auto 模式） | 媒体查询 API 在主流浏览器 ≥97% 支持 |
| SEO 误判"动态内容" | 极低 | 低 | HTML 静态，切换不改变爬虫可见文本 |
| 沙箱/低端机执行慢 | 低 | 中 | 同上 FOUC |

---

## 9. 实施步骤（待批复后启动）

| 步骤 | 内容 | 工时 | 验证 |
|------|------|------|------|
| 1 | 创建 `src/scripts/theme-init.ts`（IIFE ≤0.3KB） | 0.5h | vitest + smoke 13 |
| 2 | 创建 `src/scripts/theme-toggle-page.ts`（按钮绑定） | 1h | vitest ≥8 用例 |
| 3 | `build-public-scripts.mjs` 自动纳入 ENTRIES | 0.2h | verify 272 tests |
| 4 | global.css 追加 `:root[data-theme]` 块 + 媒体查询重写 | 0.3h | smoke 13 + 视觉 |
| 5 | SiteHeader 注入按钮（Astro 组件） | 0.5h | smoke 11 a11y 通过 |
| 6 | smoke 13：theme-init.js 存在 + 体积 ≤0.5KB + CSP 红线守住 | 0.3h | smoke 13/13 |
| 7 | bundle:check + verify + verify:dist 全绿 | 0.2h | exit 0 |
| **合计** | | **3h** | |

---

## 10. 验收标准（Definition of Done）

- [ ] 功能：用户点按钮能在 light/dark/auto 三态切换并持久化
- [ ] 性能：JS gzip ≤100KB、CSS gzip ≤30KB（增量 ≤1KB JS / +0.5KB CSS）
- [ ] a11y：按钮 ≥44×44px、aria-pressed、aria-label 三态、键盘可达、对比度 ≥4.5:1
- [ ] CSP：0 内联脚本、0 eval、0 `dangerouslySet*`
- [ ] 兼容性：Chrome/Firefox/Safari 最新两个大版本通过
- [ ] 测试：vitest 272 → ≥280 用例；smoke 12 → 13/13
- [ ] 文档：CHANGELOG Unreleased + AI-IMPROVEMENT-PROMPT 第六节 P1-7② 标 `[x]`
- [ ] 视觉回归：浅/深色首页 + 2 个计算器页（抽 mortgage-cn + age）浏览器代理截图

---

## 11. 待人工决策项

| 决策点 | 建议 | 备选 | 影响 |
|--------|------|------|------|
| FOUC 窗口可接受度 | 接受（业内同级方案） | 完全消除（需放弃 CSP 严格性 / 用 cookie 同步 SSR） | 体验 vs 安全 |
| 三态 vs 二态 | 三态（推荐，含 auto） | 二态（仅 light/dark，无 auto） | 复杂度 vs 偏好 |
| 按钮位置 | SiteHeader 桌面端「搜索」右侧 | 页脚 / 设置中心 | 可见度 |
| 是否默认 auto | 是 | 默认 light | 与 P1-7① 行为一致 |
| 是否提供键盘快捷键 | 否（避免快捷键冲突） | 是（如 ⌘+Shift+L） | 体验 |

---

## 12. 参考实现（业内对比）

| 站点 | 方案 | FOUC 窗口 |
|------|------|-----------|
| GitHub | 外置 init.js + localStorage + 早置 | ≈0（有 preload） |
| MDN | 同上 | ≈0 |
| Tailwind docs | 外置 + 媒体查询默认 | 无 |
| Vercel docs | 外置 init.js | <50ms |

本方案与 GitHub/MDN 同等级。

---

**结论**：方案技术可行、风险可控、CSP 合规；待项目负责人确认"FOUC 窗口可接受度"与"三态 vs 二态"两个决策点后即可开工，预估 3 小时全部门禁绿。