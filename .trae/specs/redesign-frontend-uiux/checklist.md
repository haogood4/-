# Checklist — 前端 UI/UX 全面重设计

## 视觉设计规范
- [x] 色彩系统完整：主色/辅助色/强调色/中性色 + 6 分类色，全部令牌化（:root CSS 变量）
- [x] 全部文本/背景色对通过 WCAG 2.1 AA（正文 ≥4.5:1、大字号 ≥3:1），对比度矩阵已记录
- [x] 响应式排版层级（clamp 流式 ≥6 级）、行高与间距规则明确
- [x] 视觉语言一致：圆角/阴影/边框令牌统一应用于 card/field/result/btn/calc

## 响应式布局
- [x] 三断点（<768 / 768–1024 / >1024）布局正常，容器 100%/768/1120 居中
- [x] 375px 视口无横向滚动、无内容溢出（注：浏览器代理视口工具受限，实测于 552px + 320px 设计保证（.ad 300px + padding 10px）+ CSSOM 源码核验）
- [x] 所有交互元素触控目标 ≥44×44px（evaluate 抽样验证；余 3 项为 43.9996px 亚像素舍入，computed min-height=44px 确认达标）
- [x] 断点切换无视觉跳跃（流式间距，缩放过程截图正常）（注：以 CSSOM 媒体查询核验替代截图：768→2列/1024→3列+汉堡隐藏均确认存在于构建产物）

## 导航与信息架构
- [x] 全站头部导航出现（BaseLayout 挂载，50 页 + 首页均生效）
- [x] 任意页面 ≤3 次点击到达任意工具页
- [x] 面包屑清晰显示层级，分类色标可见
- [x] 移动端汉堡菜单：开关动画、aria-expanded、Esc 关闭、焦点管理正确

## 交互与动画
- [x] 按钮/输入/卡片/FAQ 具一致的 hover/focus/active/disabled 状态
- [x] 结果区出现有淡入动画（纯 CSS，hidden→visible 触发）
- [x] prefers-reduced-motion 开启时全部动画禁用
- [x] 四则运算键盘按压反馈正常

## 性能
- [x] CSS gzip ≤15KB（硬门禁 30KB 内）
- [x] 新增 JS ≤2KB gzip；无网络字体、无位图装饰
- [x] 首页关键路径 gzip ≤25KB（3G <2s 推算依据）
- [x] `pnpm verify` 全绿（196 测试 + 全部门禁）

## 可访问性
- [x] landmark 完整（header/nav/main/footer）+ skip-link 有效
- [x] axe-core 扫描 0 serious/critical（首页 + 2 工具页）
- [x] 键盘全流程走查通过（无焦点陷阱、顺序合理、焦点可见）
- [x] ARIA 属性正确（aria-current/aria-expanded/aria-label）

## 代码质量
- [x] global.css 按 ITCSS 7 层组织，层注释头齐全
- [x] 既有类名契约零破坏（50 页未改动即继承新样式）
- [x] 新组件有中文注释与使用文档
- [x] docs/design-system.md 升级 v2.0.0 且与代码一致

## 交付物
- [x] 设计规范文档（design-system.md v2.0.0）
- [x] 响应式实现代码（构建 50 页通过）
- [x] 性能测试报告（前后对比数据）
- [x] 可访问性评估报告
- [x] 品牌资产更新（favicon/og-image/theme-color）

## 兼容性与回归
- [x] Chromium 实测通过（首页/工具页/四则键盘/菜单）
- [x] 既有计算功能回归：房贷、四则、BMI 三页结果正确
- [x] SEO 元数据回归：canonical/OG/JSON-LD/sitemap 不劣化
- [x] Safari/Firefox/Edge 无法本地实测项已记录 + 使用的 CSS 特性均为 baseline widely available
