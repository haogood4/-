# 计算器网站搭建项目 · AI 项目经理配置包

本仓库包含 **AI 项目经理** 在本项目中需要的全部上下文：

```
/home/arch/项目/计算器网站开发/
├── README.md                 ← 当前文件
├── knowledge-base/           ← 7 大知识库（静态规则与上下文）
│   ├── 01-project-management/
│   ├── 02-product-requirements/
│   ├── 03-formulas/          ← 公式库（最重要）
│   ├── 04-seo-content/
│   ├── 05-technical/
│   ├── 06-testing-compliance/
│   └── 07-data-operations/
└── mcp-config/ + mcp-manual/ ← 9 个 MCP 配置 + 完整使用手册
```

---

## 一、给 AI 的最简指令

每次会话开始，建议在 prompt 中加入：

```
你正在管理"计算器网站搭建项目"。请先读取：
- knowledge-base/README.md（必读）
- knowledge-base/01-project-management/project-charter.md
- knowledge-base/03-formulas/README.md
- mcp-manual/00-principles.md

然后再回答任何问题。所有写操作必须遵循三级权限模型。
```

---

## 二、推荐接入顺序（MVP）

1. `web-search` + `notion` + `github` + `linear` + `playwright`（P0，必备）
2. `ga4` + `gsc` + `sentry`（P0，分析与监控）
3. `postgres`（P1，结构化数据）
4. `figma` / `slack`（P2，可选）

---

## 三、关键产物索引

| 用途 | 路径 |
|---|---|
| 项目章程 | [project-charter.md](file:///home/arch/项目/计算器网站开发/knowledge-base/01-project-management/project-charter.md) |
| 决策日志 | [decision-log.md](file:///home/arch/项目/计算器网站开发/knowledge-base/01-project-management/decision-log.md) |
| 风险登记册 | [risk-register.md](file:///home/arch/项目/计算器网站开发/knowledge-base/01-project-management/risk-register.md) |
| 计算器需求模板 | [calculator-template.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-template.md) |
| MVP 计算器清单 | [calculator-list.md](file:///home/arch/项目/计算器网站开发/knowledge-base/02-product-requirements/calculator-list.md) |
| 公式库 YAML 模板 | [formula-template.yaml](file:///home/arch/项目/计算器网站开发/knowledge-base/03-formulas/formula-template.yaml) |
| 房贷公式 | [mortgage-cn.yaml](file:///home/arch/项目/计算器网站开发/knowledge-base/03-formulas/finance/mortgage-cn.yaml) |
| MCP 主配置 | [mcp.json](file:///home/arch/项目/计算器网站开发/mcp-config/mcp.json) |
| MCP 权限模型 | [permissions.model.md](file:///home/arch/项目/计算器网站开发/mcp-config/permissions.model.md) |
| MCP 总原则 | [00-principles.md](file:///home/arch/项目/计算器网站开发/mcp-manual/00-principles.md) |
| MCP 反模式 | [anti-patterns.md](file:///home/arch/项目/计算器网站开发/mcp-manual/anti-patterns.md) |

---

## 四、下一步建议

| # | 任务 | 优先级 | 负责人 |
|---|---|---|---|
| 1 | 把 Notion / GitHub / GA4 / GSC / Sentry 的真实 ID 注入 `mcp.json` | P0 | 技术负责人 |
| 2 | 找一名 CPA / 税务师人工 review `income-tax-cn.yaml` 后改 `status: human-verified` | P0 | PO |
| 3 | 法务审核 `06-testing-compliance/` 中 3 个政策模板 | P0 | PO |
| 4 | 上线首批 5 个计算器：房贷 / 个税 / BMI / 年龄 / 单位换算 | P0 | 全员 |
| 5 | 启用 Sentry + GA4；做 24 小时冒烟 | P0 | BE + QA |
| 6 | 按周运行 `weekly-report` 工作流 | P1 | SEO + PM |

---

## 五、前端工程（Astro）快速开始

**项目简介**：基于 Astro 的静态计算器网站，采用纯函数计算库 + 外部脚本 + 严格 CSP，首个样板页为百分比计算器（`/math/percentage/`）。

**开发前提**：Node 22 安装在 `~/.local/bin`，每条命令前需执行：

```bash
export PATH=~/.local/bin:$PATH
```

**常用命令**：

| 命令 | 说明 |
|---|---|
| `pnpm install` | 安装依赖 |
| `pnpm verify` | 类型检查 + 单元测试 + 格式检查 + MCP 配置检查 + 产物体积检查（JS gzip ≤ 100KB、CSS gzip ≤ 30KB，dist 存在时强制执行） |
| `pnpm build` | 构建静态站点到 `dist/` |
| `pnpm preview` | 本地预览 `dist/` 构建产物 |
| `pnpm dev` | 启动开发服务器 |

**目录结构**（前端部分）：

```
src/
├── components/        ← 可复用组件（面包屑、结果区、广告容器、FAQ、页脚）
├── layouts/           ← BaseLayout（head / 跳转链接 / 全局样式 / 页脚）
├── lib/calculators/   ← 纯函数计算库（percentage 等，含 Vitest 单测）
├── pages/             ← 路由页面（index、math/percentage）
├── scripts/           ← 页面交互脚本（percentage-page.ts，打包为外部 JS）
└── styles/            ← global.css（设计令牌、断点、焦点环与触控目标基线）
public/_headers        ← 安全响应头（CSP / nosniff / Referrer-Policy）
```

**状态声明**：当前处于样板阶段（percentage 样板页已通过 build / verify）；隐私政策、用户协议、免责声明等政策文档尚未通过法务审核，页脚对应链接为 `#` 占位；广告位为空占位容器，未接入任何第三方脚本。