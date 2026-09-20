---
project: calculator-site
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

> **权限说明**：配置中的 `tier` 字段（P0/P1/P2）仅为团队优先级约定，不构成任何技术管控。真实权限管控依赖 MCP 服务端令牌作用域（token scopes）与仓库分支保护规则。

# MCP 配置总览

本目录给出本项目**推荐的最小 MCP 配置**，包括：

```
mcp-config/
├── README.md                 ← 当前文件（总览与原则）
├── mcp.json                  ← 主配置文件（Claude / Cursor / Trae 等）
├── mcp.dev.json              ← 本地开发覆盖（不提交）
├── permissions.model          ← 三级权限模型定义
├── servers/
│   ├── github.json           ← GitHub MCP（示例）
│   ├── linear.json           ← Linear MCP（示例）
│   ├── notion.json           ← Notion MCP（示例）
│   ├── postgres.json         ← Supabase / Postgres MCP（示例）
│   ├── playwright.json       ← Playwright MCP（示例）
│   ├── web-search.json       ← Web Search / Fetch MCP（示例）
│   ├── ga4.json              ← GA4 MCP（示例）
│   ├── gsc.json              ← Search Console MCP（示例）
│   └── sentry.json           ← Sentry MCP（示例）
└── examples/
    ├── read-github-issue.md
    ├── query-ga4-traffic.md
    ├── verify-calculator-page.md
    └── draft-linear-task.md
```

## 接入原则

1. **只接入官方 / 通过审查的 MCP**。
2. 每个 MCP 必须配置**只读 / 提议 / 审批执行**三级权限。
3. 敏感操作（生产发布、公式变更、税务/健康内容修改）必须经过人工审批。
4. 任何 MCP 的密钥都不允许出现在 Git 仓库中，统一通过 `.env` 或 `mcp.dev.json` 注入。

## 推荐组合（MVP）

```json
{
  "servers": [
    { "id": "github",        "tier": "read+propose+approve" },
    { "id": "linear",        "tier": "read+propose" },
    { "id": "notion",        "tier": "read+propose" },
    { "id": "postgres",      "tier": "read+propose+approve" },
    { "id": "playwright",    "tier": "read+propose+approve" },
    { "id": "web-search",    "tier": "read" },
    { "id": "ga4",           "tier": "read" },
    { "id": "gsc",           "tier": "read" },
    { "id": "sentry",        "tier": "read" }
  ]
}
```
---