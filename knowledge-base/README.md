# 计算器网站搭建项目 · 知识库总目录

> **可信度声明**：本知识库目前没有任何条目通过专业人工审核。所有公式、规则与文档均为 AI 起草草案，状态为 draft/pending。使用前必须按各文档的来源要求独立核验。

> 本目录是 AI 项目经理的"长期记忆"。所有规则、公式、决策、模板、来源链接都在这里维护。
> 任何 AI 在回答"这个项目怎么算、怎么排期、怎么写"之前，必须先读本目录。

---

## 一、知识库结构

```
knowledge-base/
├── README.md                         ← 当前文件（索引）
├── 01-project-management/            ← 项目管理：章程、决策日志、风险、里程碑
├── 02-product-requirements/          ← 产品需求：每个计算器的需求模板与清单
├── 03-formulas/                      ← 公式与专业规则（最重要的知识库）
│   ├── finance/                      ← 金融、税务、贷款
│   ├── health/                       ← 健康指标
│   ├── daily/                        ← 日常：日期、年龄、时间
│   └── math-unit/                    ← 数学、单位换算
├── 04-seo-content/                   ← SEO 与内容规范
├── 05-technical/                     ← 技术架构与代码规范
├── 06-testing-compliance/            ← 测试用例、合规与法务文档
└── 07-data-operations/               ← KPI、事件字典、报表模板
```

---

## 二、知识库使用规则（给 AI 看）

| 场景 | 必须读取 | 严禁行为 |
|---|---|---|
| 用户问"项目目标 / 当前阶段 / 谁负责" | `01-project-management/` | 不要凭空编造负责人或排期 |
| 用户问"某个计算器怎么实现" | `02-product-requirements/` | 不要凭空设计字段 |
| 用户问"公式怎么算"或 AI 自己出公式 | `03-formulas/` | 严禁只凭记忆给税务/医疗/金融结果；必须引用 `sources[].url` |
| 用户问"如何写页面 / Meta / 关键词" | `04-seo-content/` | 不要使用未审核的标题模板 |
| 用户问"技术选型 / 如何部署" | `05-technical/` | 不要推荐未在 ADR 中记录的技术 |
| 用户问"如何测试 / 合规要求" | `06-testing-compliance/` | 不要跳过 YMYL 审核流程 |
| 用户问"数据指标 / 周报" | `07-data-operations/` | 不要使用未在字典中定义的事件名 |

---

## 三、文档标签规范（强制）

所有文档头部必须带以下元数据（Markdown front-matter 或 YAML）：

```yaml
project: calculator-site
doc_id: 例 finance/mortgage-cn-v1
type: formula | requirement | decision | risk | sop | kpi
domain: finance | health | daily | math | seo | tech | compliance | ops
locale: zh-CN | en-US
version: v1.0.0
status: draft | in-review | approved | deprecated
effective_from: 2025-01-01
effective_to: 2025-12-31  # 可为空表示长期有效
owner: 产品负责人 / SEO 负责人 / 技术负责人
last_updated: 2025-01-01
sources:
  - title: 央行公告
    url: https://example.gov.cn/xxx
    type: official
```

> AI 在修改任何文档前，必须先核对 `status` 和 `effective_to`。
> 当前全部文档均为未经人工审核的 draft；标记为 `approved`（已通过专业人工审核）的文档，AI 只能**提出修订建议**，不能直接覆盖。

---

## 四、变更控制流程

1. 任何对 `03-formulas/`、`06-testing-compliance/` 中**法律 / 税务 / 健康 / 金融**相关内容的修改，必须走「PR + 至少 1 名人类审核人」流程。
2. 修改后必须更新 `version`、`last_updated`、`sources` 并在 `01-project-management/decision-log.md` 记录一条决策。
3. 涉及线上发布，必须经过 CI 全量测试通过 + 人工审批。

---

## 五、知识库 vs MCP 分工

- **知识库（这里）= 静态规则与上下文**，由人类维护。
- **MCP（见 `mcp-config/` 与 `mcp-manual/`）= 动态实时数据**，由 AI 调用。
- AI 在做"判断 / 决策 / 写作"时，**先读知识库再读 MCP**。

---