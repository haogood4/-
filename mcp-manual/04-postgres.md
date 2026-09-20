---
project: calculator-site
doc_id: mcp/manual-postgres
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 后端负责人
last_updated: 2025-01-01
deferred: true
---

> **deferred: true** — MVP 阶段不接入 Postgres，10-20 个计算器为纯前端计算，无持久化需求；出现真实持久化需求后重新评估。

# Postgres / Supabase MCP 使用手册

## 能力

- 读：表结构、查询、统计。
- 草稿：INSERT 草稿、migration 草稿、seed 数据。
- 审批：在 staging 真实执行 migration / INSERT。

## 表结构（项目核心）

```
formulas           (id, name, version, status, yaml_path, last_updated)
formula_tests      (formula_id, vector_index, expected_output, pass_rate)
calculator_config  (id, category, slug, locale, enabled)
metrics_snapshot   (id, date, calculator_id, sessions, completes)
content_index      (id, url, slug, last_crawled)
```

## 何时使用

| 场景 | 工具 | 等级 |
|---|---|---|
| 查最新公式版本 | `execute_select` | read |
| 验证测试通过率 | `execute_select` | read |
| 写一个新的公式版本草稿 | `insert_draft` | propose |
| 生成 migration SQL | `generate_migration` | propose |
| 在 staging 跑 migration | `execute_migration` | approve |
| 在生产 update 数据 | `execute_update_prod` | approve（**通常禁止**） |

## 调用示例

### 查近 30 天完成率最低的 5 个计算器

```sql
SELECT calculator_id, AVG(completes)::float / NULLIF(AVG(views), 0) AS completion_rate
FROM metrics_snapshot
WHERE date > now() - interval '30 day'
GROUP BY calculator_id
ORDER BY completion_rate ASC
LIMIT 5;
```

### 生成公式版本 migration

```sql
-- insert into formulas
INSERT INTO formulas (id, name, version, status, yaml_path)
VALUES ('mortgage-cn', '房贷计算器', '1.1.0', 'in-review', '03-formulas/finance/mortgage-cn.yaml')
ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, last_updated = now();
```

## 安全规则

- 默认连接 `staging` 环境。
- `execute_update_prod` 只能由人工在审批 UI 中触发。
- 禁止语句：`DROP TABLE`、`TRUNCATE`、`DELETE FROM production_*`、任何 `UPDATE` 包含 `users` / `payments` 表。

## 失败时

- 连接失败 → 检查 IP 白名单与 DATABASE_URL。
- 权限不足 → 立刻停止，通知 BE Lead。

---