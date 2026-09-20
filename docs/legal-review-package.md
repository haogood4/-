# P1-10 法务审核资料包 — 计算器大全 v0.1.0

> 版本：v1.0 · 2026-09-20 · 状态：📋 待法务审核
> 提交方：项目组（TraeCode AI Agent 自动产出）
> 接收方：法务部 / 外部律师事务所（待定）

---

## 0. 一页式摘要

| 项 | 内容 |
|----|------|
| 项目名称 | 计算器大全 v0.1.0 |
| 服务性质 | 静态网站，纯客户端在线计算工具集合 |
| 部署目标 | Cloudflare Pages（CNAME 至正式域名） |
| 当前法律页状态 | 3 个骨架草稿（隐私政策 / 用户协议 / 免责声明）全部 noindex |
| 待补充项 | 第三方服务清单、联系方式、ICP 备案号、Cookie 列表 |
| 风险等级 | **中**：涉及金融/健康/法律类计算（YMYL），需免责声明落地 |

---

## 1. 项目基本信息

| 项 | 内容 |
|----|------|
| 域名（待定） | `example-calculator.cn`（占位，上线前替换） |
| 主体公司 | 待填（当前无） |
| 备案号 | 待 ICP 备案 |
| 联系方式 | `privacy@example-calculator.cn`（占位） |
| 用户规模 | 上线初期预估 UV <5000/日 |
| 用户地域 | 主要面向中国大陆 |
| 上线时间 | 域名 + 备案就绪后 |

---

## 2. 待审核文件清单

### 2.1 三页骨架草稿（已就位、待条款细化）

| 文件路径 | 内容主题 | 行数 | 章节数 |
|----------|----------|------|--------|
| [src/pages/legal/privacy.astro](file:///home/arch/项目/计算器网站开发/src/pages/legal/privacy.astro) | 信息收集 / Cookie 与 localStorage / 第三方服务 / 您的权利 | 60 | 4 |
| [src/pages/legal/terms.astro](file:///home/arch/项目/计算器网站开发/src/pages/legal/terms.astro) | 服务说明 / 使用规范 / 变更与终止 / 责任限制 | 52 | 4 |
| [src/pages/legal/disclaimer.astro](file:///home/arch/项目/计算器网站开发/src/pages/legal/disclaimer.astro) | 结果仅供参考 / 专业领域提示 / 信息时效 | 53 | 3 |

### 2.2 全站免责字样（已落 51 页）

所有金融/健康/法律类计算器页均含「**仅供参考，以专业机构意见为准**」声明，由 P1-7① 同期的 codemod 注入：

- 金融类（15 页）：房贷 / 个税 / 社保 / 商业贷款 / 提前还款 / 投资 / 年化等
- 健康类（4 页）：BMI / 卡路里 / 排卵 / 预产期
- 法律相关（0 页）：当前无法律类计算器（无需声明）

### 2.3 文章与政策资讯

11 篇知识库与政策类文章，每篇均含：
- `expiresAt`（政策时效）
- `verified`（双签状态）
- 文末 `sources` 区（官方 URL）
- 顶部 YMYL 横幅（已过期自动降级）
- 双签事项登记在 [docs/policy-verifications/dual-sign-todo.md](file:///home/arch/项目/计算器网站开发/docs/policy-verifications/dual-sign-todo.md)

---

## 3. 当前技术事实（供法务评估数据流）

### 3.1 数据流
- **0 后端、0 数据库**：所有计算在浏览器本地执行（`src/lib/calculators/*.ts`）
- **0 用户账户**：不收集姓名/手机/邮箱
- **0 服务端日志**：Cloudflare Pages 仅返回静态 HTML，CF 默认边缘日志需 opt-in
- **0 第三方统计**：当前未接入 GA / Sentry / 广告代码（待人工隐私决策后实施）
- **CSP 严格**：`script-src 'self'`，禁止内联脚本

### 3.2 本地存储（localStorage）使用情况
| key | 写入方 | 数据 | 用途 |
|----|--------|------|------|
| `tool-recent` | `src/lib/tool-store.ts` | 最近使用的 8 个工具 slug | 首页「我的工具」展示 |
| `tool-fav` | 同上 | 收藏的最多 24 个工具 slug | 收藏按钮 + 首页区块 |

数据仅存本地，不上传；清除浏览器数据即清除。

### 3.3 Service Worker
- [public/sw.js](file:///home/arch/项目/计算器网站开发/public/sw.js) 仅做离线缓存（HTML network-first / 带哈希资产 cache-first / 其余 SWR）
- **不收集任何遥测数据**

### 3.4 第三方依赖（运行时）
- **零运行时依赖**：全部 JS 为自有代码
- 仅 `marked`（devDependency，构建期）+ `isomorphic-dompurify`（devDependency，构建期）用于文章 Markdown 渲染

### 3.5 部署与域名
- Cloudflare Pages（CNAME 接入正式域名）
- 当前无第三方 CDN、无第三方字体、无第三方统计

---

## 4. 待法务确认 / 补充项

### 4.1 必须补充（上线前 P0）

| # | 项目 | 现状 | 待办 |
|---|------|------|------|
| 1 | 第三方服务清单 | 0 项 | 接入任何第三方前必须先补充隐私政策第三节 |
| 2 | 联系方式邮箱 | 占位 `privacy@example-calculator.cn` | 替换为正式邮箱 |
| 3 | ICP 备案号 | 无 | 上线前必须完成 |
| 4 | 经营主体信息 | 无 | 公司主体确定后补 |
| 5 | 数据安全负责人 | 无 | 个保法要求的"个人信息保护负责人" |
| 6 | Cookie 实际清单 | 仅 localStorage（不算） | 若后续接入 GA/广告，必须补充 |

### 4.2 法务建议补充（推荐 P1）

| # | 项目 | 说明 |
|---|------|------|
| 1 | 用户协议加入"知识产权"章节 | 引用本站内容的规范 |
| 2 | 免责声明加入"链接免责" | 避免对第三方链接负责 |
| 3 | 隐私政策加入"未成年人保护" | 14 岁以下需监护人同意 |
| 4 | 增加"政策变更通知机制" | 重要变更如何通知用户 |
| 5 | 政策类计算器"数据准确性免责声明" | LPR、税率等政策性参数的官方源声明 |

### 4.3 风险标注

| 风险 | 等级 | 描述 | 建议 |
|------|------|------|------|
| YMYL 内容 | 中 | 金融/健康/法律类计算结果 | 已在 51 页注入免责字样；建议法务再审措辞 |
| Cookie 缺失告知 | 中 | 当前 0 cookie | 若后续接入 GA，需弹窗/横幅 |
| 数据出境 | 低 | 全静态，无服务器 | 若引入 Cloudflare Workers，需评估 |
| 第三方链接 | 低 | 当前站内无外链 | 政策文章 `sources` 区含外链，需声明非本站背书 |
| 政策时效 | 中 | 6 篇文章涉及 LPR/个税/医保等 | 已建 `expiresAt` + 双签 SOP |

---

## 5. 审核流程与 SOP

### 5.1 审核流程（建议）
1. 法务初审（3 个骨架 + 本资料包）：5 工作日
2. 法务反馈 → 项目组修订（≤2 轮）
3. 法务签字确认 → 项目组移除 `noindex` → 上线

### 5.2 双签事项（已建）

[docs/policy-verifications/dual-sign-todo.md](file:///home/arch/项目/计算器网站开发/docs/policy-verifications/dual-sign-todo.md) 与 `.csv` 同步登记：
- 政策类文章需"项目责任人 + 法务"双签
- 已过期自动降级（`isArticleExpired` 工具函数）

### 5.3 上线后维护
- 政策更新：双签 + `expiresAt`
- 第三方服务变更：法务审 + 隐私政策同步更新
- 用户协议重大变更：提前 7 天首页公告

---

## 6. 上线前 Go/No-Go 清单

| # | 项 | 负责人 | 状态 |
|---|----|--------|------|
| 1 | 域名 ICP 备案完成 | 法务+运营 | ⏳ 待办 |
| 2 | 隐私政策法务签字 | 法务 | ⏳ 本资料包提交 |
| 3 | 用户协议法务签字 | 法务 | ⏳ 同上 |
| 4 | 免责声明法务签字 | 法务 | ⏳ 同上 |
| 5 | 三页移除 `noindex` | 项目组（审核后） | ⏳ 待触发 |
| 6 | sitemap filter 同步更新 | 项目组（审核后） | ⏳ 待触发 |
| 7 | 联系邮箱替换为正式地址 | 运营 | ⏳ 待办 |
| 8 | 第三方服务清单（若引入） | 项目组+法务 | ⏳ 引入前必须 |

---

## 7. 附件

### 7.1 工程事实声明
- 项目仓库：[本仓库]
- 技术栈：Astro 7.3.3（静态输出）+ TypeScript strict + 零运行时第三方依赖
- 部署：Cloudflare Pages
- CSP：见 [public/_headers](file:///home/arch/项目/计算器网站开发/public/_headers)
- 隐私审计：smoke 断言 7（无内联脚本 / 无事件属性 / 无 `javascript:` 协议）

### 7.2 数据流图（简版）

```
用户浏览器 ─── 计算 ───> 客户端纯函数（src/lib/calculators/*.ts）
        │                     │
        │                     └─ 结果渲染 DOM（无网络请求）
        │
        ├─ localStorage（tool-recent / tool-fav）── 本地，仅用户可访问
        │
        └─ 页面浏览 ──> Cloudflare Pages CDN ──> 静态 HTML / CSS / JS
                                              │
                                              └─ CF 默认无边缘日志（需 opt-in）
```

### 7.3 已有合规证据

- 15 篇政策类文章逐一核档：[docs/policy-verifications/2026-09/](file:///home/arch/项目/计算器网站开发/docs/policy-verifications/2026-09/)
- 内容核对 SOP：[docs/policy-verification-checklist.md](file:///home/arch/项目/计算器网站开发/docs/policy-verification-checklist.md)
- 安全响应头：[public/_headers](file:///home/arch/项目/计算器网站开发/public/_headers)
- a11y 巡检：smoke 断言 11（WCAG AA 9 组对比度 ≥4.5:1）

---

**待办**：本资料包生成后，请项目负责人转发法务部，并登记预计回复日期至本表第 5.1 节。

**自动跟进**：本资料包归档后，本 Agent 将登记：
1. [docs/policy-verifications/dual-sign-todo.md](file:///home/arch/项目/计算器网站开发/docs/policy-verifications/dual-sign-todo.md) 加入"P1-10 legal 三页法务审核"双签条目
2. CHANGELOG Unreleased 标注本资料包归档完成