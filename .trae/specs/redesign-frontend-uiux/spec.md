# 前端 UI/UX 全面重设计 Spec

## Why

现有界面为"能用但无个性"的通用灰白蓝样式，且全站缺失头部导航（50 个工具页仅靠面包屑回首页，用户无法横向发现工具），信息架构与视觉语言均未达到行业领先标准。本次重设计建立完整设计系统（色彩/排版/间距/动效令牌），补齐全局导航与移动端菜单，在**不改写 50 个页面类名契约**的前提下全站升级，并交付设计规范、性能报告与可访问性评估报告。

## What Changes

- 建立设计令牌 v2：品牌色（深青主色 + 琥珀强调色）、6 分类色彩系统、全部通过 WCAG 2.1 AA 对比度验证；流式排版层级（clamp）、间距/圆角/阴影/动效时长令牌
- **BREAKING（视觉）**：品牌从通用蓝 `#0066cc` 切换为深青 `#0f766e` 系；favicon.svg、og-image.png、theme-color 同步重制
- 新增 `SiteHeader` 全局导航组件：桌面端 6 分类横向导航 + 移动端汉堡菜单（键盘可操作、aria-expanded、Esc 关闭、焦点管理）
- `global.css` 按 ITCSS 分层重构（tokens → reset → base → layout → components → utilities），**保留全部既有类名**（`.card` `.field` `.btn-primary` `.result` `.breadcrumb` `.calc-*` `.faq-item` `.section` `.tool-list` `.lead` `.ad`），50 页零改动继承新样式
- 面包屑升级 + 页面层级指示（分类色标：h1 左侧分类色条 + 分类徽章）
- 微交互系统：按钮悬停/按压态、输入聚焦环、结果出现动画（纯 CSS，无 JS）、FAQ 折叠指示、卡片悬停；全部包裹 `prefers-reduced-motion`
- 首页重设计：hero 区 + 分类卡片网格（桌面 3 列/平板 2 列/移动 1 列）
- 响应式三断点：`<768px` 移动、`768–1024px` 平板、`>1024px` 桌面；触控目标 ≥44×44px
- 交付三份报告：性能测试报告、可访问性评估报告、设计规范文档 v2.0.0（更新 `docs/design-system.md`）

## Impact

- Affected specs：全站所有页面（经 BaseLayout 与 global.css 继承）；不改变任何计算逻辑与 URL 结构
- Affected code：
  - `src/styles/global.css`（重构，核心）
  - `src/components/SiteHeader.astro`（新增）
  - `src/layouts/BaseLayout.astro`（挂载 header、landmark、theme-color）
  - `src/components/Breadcrumb.astro`、`SiteFooter.astro`（样式适配）
  - `src/pages/index.astro`（首页 hero + 卡片网格）
  - `public/favicon.svg`、`public/og-image.svg/png`（品牌重制）
  - `docs/design-system.md`（v2.0.0）
- 不受影响：`src/lib/calculators/*`（196 测试）、`src/scripts/*-page.ts`（依赖的 DOM id/class 不变）、SEO 元数据、_headers/sw.js

## ADDED Requirements

### Requirement: 设计令牌系统
系统 SHALL 提供完整设计令牌：主色/辅助色/强调色/中性色各 ≥3 阶、6 个分类色、排版阶梯（≥6 级 + 流式 clamp）、间距（4px 基准 8 阶）、圆角、阴影、动效时长与缓动。所有文本-背景组合 SHALL 满足 WCAG 2.1 AA（正文 ≥4.5:1，大字号 ≥3:1），对比度数值 SHALL 记录在规范文档。

#### Scenario: 对比度验证
- **WHEN** 审计任意令牌色对（如主色按钮白字、分类徽章、次要文本）
- **THEN** 对比度 ≥4.5:1（或大字号 ≥3:1），且数值已写入 design-system.md 对照表

### Requirement: 全局导航与移动端菜单
系统 SHALL 在所有页面提供头部导航：logo（回首页）+ 6 分类入口；用户从任意页面 ≤3 次点击到达任意工具。移动端 SHALL 提供汉堡菜单，键盘 Tab 可达、Enter/Space 开关、Esc 关闭、`aria-expanded` 状态正确、菜单项 ≥44px。

#### Scenario: 桌面导航
- **WHEN** 视口 ≥1024px 加载任意工具页
- **THEN** 头部显示 6 分类链接，当前分类有视觉激活态

#### Scenario: 移动菜单
- **WHEN** 视口 <768px 点击汉堡按钮
- **THEN** 菜单滑出（动画 ≤300ms），焦点移入首个菜单项，Esc 可关闭并归还焦点

### Requirement: 响应式三断点布局
布局 SHALL 在 <768px / 768–1024px / >1024px 三断点下正常呈现：容器宽度 100%(≤720px) / 768px / 1120px 居中；断点切换 SHALL 使用流式间距避免元素重排跳变；首页卡片网格 1/2/3 列自适应。

#### Scenario: 断点无跳跃
- **WHEN** 视口从 1440px 连续缩至 375px
- **THEN** 无横向滚动条、无内容遮挡、触控目标全程 ≥44×44px

### Requirement: 微交互与动效
所有交互元素 SHALL 有一致状态反馈（hover/active/focus/disabled，过渡 150–250ms）。结果区出现 SHALL 有淡入上移动画（纯 CSS 实现，兼容 `hidden` 属性切换）。全部动画 SHALL 在 `prefers-reduced-motion: reduce` 下禁用。

#### Scenario: 减弱动效
- **WHEN** 系统开启"减弱动态效果"
- **THEN** 页面所有 transition/animation 时长为 0，功能不受影响

### Requirement: 可访问性 AA
全站 SHALL 符合 WCAG 2.1 AA：语义化 landmark（header/nav/main/footer）、skip-link、键盘全流程可达、`aria-current`/`aria-expanded`/`aria-label` 正确、图片与图标有文本替代。SHALL 输出可访问性评估报告（axe-core 扫描 + 键盘走查记录）。

#### Scenario: 键盘走查
- **WHEN** 仅用键盘完成"首页→分类→工具页→计算→查看结果"
- **THEN** 全程焦点可见、无陷阱、顺序符合视觉流

### Requirement: 性能预算
重设计后 SHALL 保持：首页关键路径（HTML+CSS+必要 JS）gzip ≤25KB；CSS gzip ≤15KB（硬上限 30KB 门禁不变）；新增 JS ≤2KB gzip（仅菜单脚本）；不引入网络字体与位图装饰。3G 模拟下首屏 <2s（以传输量 × 400kbps 推算 + Lighthouse 代理指标）。

#### Scenario: 构建门禁
- **WHEN** 运行 `pnpm verify`
- **THEN** bundle:check 通过（JS ≤100KB、CSS ≤30KB），且实测 CSS gzip ≤15KB

### Requirement: 品牌资产一致性
favicon、og-image、theme-color、logo SHALL 统一为新品牌色系；og-image.png 重新渲染（rsvg-convert + Noto CJK）；社交分享卡片视觉与站内一致。

## MODIFIED Requirements

### Requirement: 面包屑导航
既有 `Breadcrumb` 组件 SHALL 保留 DOM 结构与类名，新增：末级分类色点标识、分隔符视觉升级；分类链接 SHALL 指向首页对应锚点（现状 `href:"/"` 保持不变，避免 50 页改动）。

### Requirement: 首页信息架构
首页 SHALL 在分类列表前新增 hero 区（一句话价值主张 + 热门工具快捷入口 ≥4 个），分类区块改为卡片网格；既有 49 个工具链接与文案 SHALL 全部保留（SEO 内容不丢失）。

## REMOVED Requirements

### Requirement: 通用蓝色品牌（#0066cc）
**Reason**: 与全站无差别、缺乏辨识度，且对比度仅 5.4:1 余量小
**Migration**: 令牌 `--color-accent` 重映射为深青主色；所有引用令牌的样式自动切换，无逐页改动
