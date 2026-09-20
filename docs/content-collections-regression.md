# P3-15 Content Collections 回归计划

> 版本：v1.0 · 2026-09-20 · 状态：📋 等待 Astro 7 官方修复后启动
> 范围：Astro 7 内联脚本 bug 触发 CSP 拦截的 workaround → 回归官方方案
> 触发条件：`astro` 包主版本号 ≥ 7.3.4 且 changelog 明确修复 inline-script bug

---

## 1. 背景

### 1.1 当前 workaround（P2-8 已落地）
- `scripts/build-public-scripts.mjs`：esbuild 预打包 `src/scripts/*-page.ts` → `public/scripts/`
- 页面 Astro 模板一律 `<script is:inline type="module" src="/scripts/x-page.js">`
- ENTRIES 自动发现全部 `src/scripts/*-page.ts`（共 53 个）

### 1.2 workaround 成本
- 多一层构建脚本（51 页绕过 Astro 默认脚本处理）
- 新增页面脚本需在 `src/scripts/` 而非 `.astro` 同目录（额外约定）
- `is:inline type="module"` 写法易错（漏 type="module" 报 import 错）
- 共享 chunk `kit-*` 需 `_headers` 单独规则强缓存

### 1.3 收益（回归后）
- 移除 `build-public-scripts.mjs`
- 移除 `public/scripts/*.js`（51 份） + `_headers` 中 `/scripts/kit-*` 规则
- 页面脚本可回到 `<script src="../../scripts/x-page.ts">` 或 `<script>` 同目录直引
- Astro Content Collections 官方 `getCollection` API 可正常使用（替代当前 `src/data/articles.ts` 同步模式）

---

## 2. 触发条件（修复判据）

| 信号 | 检查方式 |
|------|----------|
| Astro 版本升级 | `pnpm list astro` ≥ 7.3.4（或后续修复版本号） |
| 修复 changelog | GitHub releases 包含 "inline script" / "is:inline" 关键词 |
| 工作区复现 | 临时删除 `public/scripts/` 后 `pnpm build`，51 个 `<script>` 是否仍为 `<script type="module" src="...">` 而非内联 |

**未全部满足前不启动回归**。

---

## 3. 回归步骤

| 步骤 | 操作 | 验证 |
|------|------|------|
| 1 | `pnpm update astro@latest` | 版本号记录 |
| 2 | 临时 `git stash` 保存全部 workaround 相关文件 | 工作区干净 |
| 3 | 备份当前 dist： `mv dist dist.backup` | — |
| 4 | 还原官方默认脚本处理：移除 `build-public-scripts.mjs` 引用、恢复 .astro 内 `<script src="...">` | grep 0 命中 `is:inline type="module" src="/scripts/` |
| 5 | 恢复 Content Collections 官方方案：`src/content.config.ts` + `src/content/articles/*.md` + `getCollection('articles')` | 数据迁移完成 |
| 6 | `pnpm build` | dist 75 页 + `<script>` 外链（非内联） |
| 7 | `node scripts/smoke-dist.mjs` | smoke 12/12（断言 7 守 CSP 红线） |
| 8 | `pnpm verify` | 272 tests 全绿（若新增 Content Collections 测试，升至 ≥275） |
| 9 | 对比 dist.backup vs 新 dist：HTML 结构等价性 | diff 工具 |
| 10 | 若全绿：移除 dist.backup + 删除 `public/scripts/` + `_headers` 删除 `/scripts/kit-*` 规则 + `package.json` 移除 `@astrojs/sitemap` 外的脚本依赖（若有） | grep 0 残留 |
| 11 | 浏览器代理实测：抽 5 个计算器页（IRR/年龄/mortgage-cn/percentage/scientific）+ 2 篇文章页 | 与 P1-6b 同结果 |

---

## 4. 测试计划（覆盖步骤 6–8）

### 4.1 单元测试（vitest ≥275）
- 新增 `src/content/articles.test.ts`：3 条用例
  - `getCollection('articles')` 返回 11 篇
  - `verified=true` 条目可枚举
  - `expiresAt` 过期判断正确
- 现有 272 用例零回归

### 4.2 冒烟断言（smoke 12/12，零变更）
- 断言 1：页面总数 = 75
- 断言 2：14 条关键路由
- 断言 7：0 内联脚本 / 0 事件属性 / 0 `javascript:`
- 断言 12：暗色跟随（与回归独立）

### 4.3 端到端（浏览器代理，2 套）
| 场景 | 期望 |
|------|------|
| 浅色首页 | 正常渲染，分类卡 6 类、工具卡片链接工作 |
| 暗色 mortgage-cn 页 | 输入本金 100 万 + 利率 4.2% + 30 年 → 月供 ≈ 4887（与引擎值一致） |
| 文章页（LPR 2026-09） | Markdown 渲染、相关工具 CTA 内链点击跳转 |

### 4.4 SEO 回归
- 183 个 JSON-LD 块全部可解析（断言 10）
- 75 页 canonical/OG/Twitter 全齐（断言 3）
- sitemap-index.xml + 11 篇 articles 全收录

### 4.5 性能回归
- JS gzip ≤100KB（移除 51 份预打包后预期下降 5–10KB）
- CSS gzip ≤30KB
- 75 页 build ≤30s

---

## 5. 回滚预案

任一步骤失败：
1. `pnpm astro@7.3.3` 还原版本
2. `git checkout main -- scripts/build-public-scripts.mjs public/scripts/`
3. `git checkout main -- public/_headers`
4. `rm -rf dist.backup`（失败现场保留 24h）

---

## 6. 验收标准（DoD）

- [ ] Astro 主版本已含修复
- [ ] 移除全部 workaround 文件
- [ ] vitest 272 → ≥275
- [ ] smoke 12/12 全绿
- [ ] 浏览器代理 7/7 测试通过
- [ ] 75 页构建 ≤30s
- [ ] bundle:check 全绿
- [ ] HTML 结构与 workaround 阶段等价
- [ ] CHANGELOG Unreleased 记录 P3-15 完成

---

## 7. 上游修复探针（自动化）

`scripts/check-astro-fix.mjs`（待 Astro 7 修复后启用，本次提交即创建）：
- 读取 `package.json` 中 astro 版本
- 对比 GitHub releases API（沙箱网络受限时降级为本地 cache）
- 若 ≥7.3.4 且 changelog 命中关键词：console.log(`P3-15 可启动：${version}`) + 输出至 `predeas:report`
- 否则：silent exit 0（让 CI 主任务继续）

**当前版本**：astro 7.3.3（探针预计 silent exit 0）

---

## 8. 风险登记

| 风险 | 概率 | 缓解 |
|------|------|------|
| Astro 升级引发其他回归 | 中 | 回归步骤 11 浏览器代理全覆盖 |
| Content Collections 数据迁移漏篇 | 低 | articles.test.ts 断言 11 篇 |
| workaround 文件残留 | 低 | 步骤 10 grep 全清 |
| 性能反而下降 | 极低 | 步骤 4.5 性能回归断言 |
| 浏览器代理对新版渲染差异 | 低 | 端到端覆盖 + 截图对比 |

---

## 9. 不在 P3-15 范围

- Astro 7 → Astro 8 主版本升级（独立决策）
- 移除 `@astrojs/sitemap`（仍需，sitemap 是 SEO 必需）
- Content Collections schema 扩展（如新增 `legalArticles`）

---

**触发后立即启动**，预估 0.5 天（已建探针，命令清单与回归步骤就位）。