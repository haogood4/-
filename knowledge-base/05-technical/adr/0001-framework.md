# ADR-0001 · 前端框架选型

- 状态：已采纳
- 日期：2025-01-01
- 决策者：技术负责人

## 背景

需要一个对 SEO 友好、首屏快、便于扩展的框架。

## 候选

| 方案 | 优势 | 劣势 |
|---|---|---|
| Next.js 14 App Router | SSR + ISR + 边缘渲染 | 学习曲线 |
| Astro | 极致性能 | 动态能力弱 |
| Nuxt 3 | Vue 生态 | 团队不熟 |
| 静态 HTML + jQuery | 简单 | 不可维护 |

## 决定

采用 Next.js 14 App Router。

## 影响

- 全栈代码统一 TypeScript
- 必须使用 RSC 与 ISR 最佳实践
- 部署以 Vercel 为主，Cloudflare Pages 备选

---