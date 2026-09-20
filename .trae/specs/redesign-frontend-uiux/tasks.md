# Tasks — 前端 UI/UX 全面重设计

> 约束：全程不改 50 个工具页的类名契约与 DOM id；CSP 禁内联（JS 必须经 Astro 打包）；每步完成后跑 `pnpm verify`。

- [x] Task 1: 设计令牌 v2 定义与对比度验证
  - [x] 1.1 在 `src/styles/global.css` 顶部重写 `:root` 令牌：主色深青系（50/100/500/600/700/900）、琥珀强调色、中性暖灰 8 阶、6 分类色（金融青/健康玫红/装修橙/投资紫/效率蓝/日常绿）各含前景安全变体
  - [x] 1.2 排版阶梯：clamp() 流式（h1/h2/h3/lead/body/sm/xs + 结果特大号），行高与字距规范；数字使用 `font-variant-numeric: tabular-nums`
  - [x] 1.3 间距（4px 基准 8 阶）、圆角、阴影、动效时长（150/250/300ms）与缓动令牌
  - [x] 1.4 用脚本计算并输出全部文本/背景色对对比度，≥4.5:1（大字号 ≥3:1）不达标即调深/调浅
  - 验证：对比度表全绿；`pnpm build` 通过

- [x] Task 2: global.css ITCSS 分层重构与基础元素重样式
  - [x] 2.1 按 7 层组织：tokens/reset/base/layout/components/utilities/media，层间注释头（中文）
  - [x] 2.2 重样式既有类（不改名）：`.container`（三断点 100%/768/1120）、`.card`、`.field*`、`.btn*`、`.result*`、`.breadcrumb`、`.faq-item`、`.section`、`.tool-list`、`.calc*`（四则键盘）、`.ad`、`.skip-link`
  - [x] 2.3 断点从 480/1024 调整为 768/1024（保留 320 兼容），流式 gap 防跳变
  - 验证：`pnpm verify` 全绿；构建产物 CSS gzip ≤15KB

- [x] Task 3: SiteHeader 全局导航组件
  - [x] 3.1 新建 `src/components/SiteHeader.astro`：logo（inline SVG + 文字）+ 桌面 6 分类链接（指向首页锚点）+ 汉堡按钮（<1024px）+ 移动菜单面板；`aria-label`、`aria-expanded`、`aria-current`
  - [x] 3.2 菜单开合用 Astro `<script>`（打包为外部文件，CSP 安全）：toggle `.is-open`、Esc 关闭、点击外部关闭、焦点移入/归还
  - [x] 3.3 sticky 头部 + 滚动阴影（CSS `position: sticky`）
  - 验证：浏览器代理键盘走查（Tab/Enter/Esc）通过

- [x] Task 4: BaseLayout 挂载与 landmark 完善
  - [x] 4.1 BaseLayout `<body>` 顶部插入 SiteHeader；确认 header/main/footer 三个 landmark 齐备
  - [x] 4.2 `theme-color` 更新为新主色；`<html>` 增加 `color-scheme: light` 声明
  - 验证：任意工具页渲染正常、skip-link 仍指向 #main

- [x] Task 5: 面包屑与分类色标
  - [x] 5.1 Breadcrumb 组件加分类色点（最后一个链接的分类）与分隔符升级
  - [x] 5.2 h1 左侧分类色条（CSS `::before`，按页面 body class 或 data 属性映射 6 色；默认主色）
  - 验证：3 个不同分类页截图对比正确

- [x] Task 6: 微交互与动效系统
  - [x] 6.1 按钮：hover 上浮 1px + 阴影、active 下压、disabled 降饱和（transition 150ms）
  - [x] 6.2 输入框：focus 主色环 + 柔和光晕；错误态抖动动画（可选）
  - [x] 6.3 结果出现：`.result-content` 淡入上移 250ms（元素从 display:none 变可见自动触发，纯 CSS）
  - [x] 6.4 FAQ summary 展开指示符旋转过渡；卡片 hover 阴影提升
  - [x] 6.5 全部包裹 `@media (prefers-reduced-motion: no-preference)`
  - 验证：开启系统减弱动效后无动画；四则键盘 `.calc-key` 按压反馈正常

- [x] Task 7: 首页重设计（hero + 分类卡片网格）
  - [x] 7.1 hero：价值主张一句话 + 副文案 + 热门工具快捷入口（≥4 个胶囊链接，复用现有 URL）
  - [x] 7.2 分类区块改卡片网格：移动 1 列 / 平板 2 列 / 桌面 3 列；每分类卡带分类色与工具数
  - [x] 7.3 保留全部既有工具链接与文案（SEO 内容零丢失，JSON-LD 不动）
  - 验证：首页 3 断点截图 + 链接数不减少（构建对比 grep）

- [x] Task 8: 品牌资产重制
  - [x] 8.1 favicon.svg 重绘为新品牌色（保留计算器造型）
  - [x] 8.2 og-image.svg 同步新色系 → `rsvg-convert` 重渲染 og-image.png，人工读图验证中文渲染
  - 验证：预览站 meta 与图标一致；og-image.png HTTP 200

- [x] Task 9: 响应式三断点实测
  - [x] 9.1 浏览器代理在 375×667 / 768×1024 / 1440×900 截图首页 + 房贷页 + 四则页
  - [x] 9.2 检查：无横向滚动、触控目标 ≥44px（evaluate 抽样）、文字不溢出
  - 产出：截图存档 + 问题清零

- [x] Task 10: 可访问性评估与报告
  - [x] 10.1 浏览器代理注入 axe-core 扫描首页 + 2 个工具页（0 serious/critical）
  - [x] 10.2 键盘全流程走查（导航→菜单→表单→结果→FAQ→页脚）
  - 产出：`docs/reports/a11y-report-redesign.md`

- [x] Task 11: 性能验证与报告
  - [x] 11.1 `pnpm build` 后统计关键路径 gzip 总量 ≤25KB
  - [x] 11.2 Lighthouse（若本机无 Chrome 则用传输量推算 + 记录待部署后 PSI 复测）
  - 产出：`docs/reports/perf-report-redesign.md`（前后对比表）

- [x] Task 12: 设计规范文档 v2.0.0
  - [x] 12.1 更新 `docs/design-system.md`：令牌表、对比度矩阵、组件规范、动效规范、断点规则、类名契约冻结说明
  - [x] 12.2 SiteHeader 组件注释文档
  - 验证：文档与代码令牌一一对应

# Task Dependencies

- Task 2 依赖 Task 1（令牌先行）
- Task 3/4/5/6/7 依赖 Task 2（分层与令牌就绪）；3 与 7 可并行
- Task 8 依赖 Task 1（色系定稿）
- Task 9/10/11 依赖 Task 3–8 全部完成（整体验证）
- Task 12 依赖 Task 1–8（文档反映最终实现）
