---
project: calculator-site
doc_id: docs/external-deployment-notes
type: external-input-record
locale: zh-CN
version: v1.0
status: archived
created: 2026-09-20
related: docs/deploy-and-operate.md, scripts/deploy-cf-pages.sh, docs/gsc-submission-sop.md, docs/m03-domain-feasibility.md
---

# 外部「部署说明」资料合并记录

> **来源**：外部下载文档 `/home/arch/下载/部署说明.md`（2026-09-20 16:23，1614 字节，单文件 HTML「小工具箱」的配套部署文档）。
> **用途**：参考单文件静态站部署流程，提取与本项目相关的可借鉴流程。
> **本项目对应实现**：本项目已具备更完整的部署体系（见下表）；本文档仅记录外部参考输入，不替代本项目既定方案。

## 一、外部原文要点（4 段）

1. **本地预览**：双击 `index.html` 用浏览器打开
2. **上线步骤**：
   - **方法一（推荐）**：Cloudflare Pages — `Direct Upload` 拖文件
     - 步骤：注册 → Create a project → Direct Upload → 拖入 `index.html` → 填子域名 → 获得 `https://<name>.pages.dev`
   - **方法二**：Vercel — `Add New → Project → Deploy` 或 `vercel.com/new` 拖文件 → 获得 `https://<name>.vercel.app`
3. **绑定自定义域名**：阿里云/腾讯云购买域名（≈ ¥60/年）→ 在 CF Pages / Vercel 项目设置里选 Custom Domain → 加 CNAME → 等待生效
4. **SEO 建议**：当前所有工具在一页；流量起来后**建议拆分**为独立页（每页围绕一个搜索词）
5. **添加新工具**：照抄 `<section class="tool">` 结构 + 改 JS 函数

## 二、与本项目部署体系对应关系

| 外部步骤 | 本项目对应 | 本项目文档 |
|---|---|---|
| 双击 HTML 预览 | `pnpm dev` / `pnpm preview`（`astro dev` 实时热重载） | [README.md](../README.md) |
| Cloudflare Pages Direct Upload | `pnpm deploy` = verify + build + wrangler | [scripts/deploy-cf-pages.sh](../scripts/deploy-cf-pages.sh) |
| Vercel 拖文件 | **本项目不采用 Vercel**（决策见 ADR-0002 Superseded） | [knowledge-base/05-technical/adr/0002-hosting.md](../knowledge-base/05-technical/adr/0002-hosting.md) |
| 购买域名 + DNS CNAME | 推荐 `jisuanqi.cn` + 路径 A 全球节点（无需 ICP） | [docs/m03-domain-feasibility.md](m03-domain-feasibility.md) |
| 自定义域名绑定（Dashboard） | Cloudflare Dashboard → Pages → Custom domains | [docs/gsc-submission-sop.md](gsc-submission-sop.md) §GSC 之外、CF Dashboard 操作由人工执行 |
| 「建议拆分独立页」SEO 建议 | **本项目已拆分**：50 个计算器独立页 + 11 文章 + 5 Hub | [CONTRIBUTING.md §新增计算器页清单](../CONTRIBUTING.md) |
| 「照抄 section 改 JS」 | 「新增计算器 7 步流程」：engine + test + page + script + JSON-LD + 内链 + smoke | [CONTRIBUTING.md](../CONTRIBUTING.md) |

## 三、4 处不可借鉴之处（与本项目冲突）

1. **Direct Upload** → 本项目用 `pnpm deploy`（自动 verify + build + wrangler 流水线）
2. **Vercel 部署** → 本项目 ADR-0002 已明确否决 Vercel
3. **「所有工具在一页」** → 本项目负面清单明令「每个计算器独立 URL」
4. **「照抄 section 加 JS」** → 本项目铁律「公式实现放 lib，DOM 粘合放 scripts，禁止复制样板」

## 四、为什么保留本文档（不删）

- 作为外部参考输入的存档，证明外部建议已评审
- 防止团队成员未来再次询问「为什么不直接拖 HTML 部署」
- 法务/审计场景需要「外部资料是否合并」的决策痕迹
- 字号 / 文件名 / 双签编号 DS-202609-08 等历史追溯

## 五、关联文档

- 本项目完整部署体系：[scripts/deploy-cf-pages.sh](../scripts/deploy-cf-pages.sh)（一键包） + [docs/m03-domain-feasibility.md](m03-domain-feasibility.md)（域名可行性） + [docs/gsc-submission-sop.md](gsc-submission-sop.md)（GSC + 百度提交）
- 技术决策：[knowledge-base/05-technical/adr/](../knowledge-base/05-technical/adr/)
- 工具覆盖对照：[docs/tool-comparison-with-external.md](tool-comparison-with-external.md)