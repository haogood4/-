---
project: calculator-site
doc_id: tech/coding-standards
type: sop
domain: tech
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 技术负责人
last_updated: 2025-01-01
---

# 编码规范

## TypeScript

- `strict: true`；禁止 `any`（除非明确注释说明）。
- 公共函数必须有显式返回类型。
- 货币、利率、长度等关键字段使用 `decimal.js` 或 `bigint` 显式声明。

## 命名

- 文件：`kebab-case.ts`
- 组件：`PascalCase.tsx`
- 变量 / 函数：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 类型 / 接口：`PascalCase`

## 注释

- 仅解释"为什么"，不解释"做什么"。
- 涉及公式处必须注释公式来源链接（与 `knowledge-base/03-formulas/` 对齐）。

## 提交规范

使用 Conventional Commits：

```
feat(mortgage): 增加 LPR 利率实时显示
fix(bmi): 修复身高 ≤ 0 时的 NaN 输出
docs(readme): 更新部署步骤
chore(deps): 升级 next 至 14.2.x
```

## 分支

- `main`：生产
- `develop`：集成分支
- `feat/*`：功能
- `fix/*`：修复
- `release/*`：发布

## PR 规则

- 必须有 1 个 reviewer 通过
- 必须通过 CI：lint、typecheck、unit、e2e
- 涉及 `lib/calculators/**` 或 `knowledge-base/03-formulas/**` 必须额外 1 名领域审核人通过

---