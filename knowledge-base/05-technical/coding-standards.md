---
project: calculator-site
doc_id: tech/coding-standards
type: sop
domain: tech
locale: zh-CN
version: v1.1.0
status: active
effective_from: 2026-09-20
owner: 技术负责人
last_updated: 2026-09-20
---

# 编码规范

## TypeScript

- `strict: true`；禁止 `any`（ESLint `no-explicit-any = error`）。
- 公共函数必须有显式返回类型。
- 数值输入一律经 `src/lib/calculators/_shared.ts` 校验（上限 1e12 / 最多 6 位小数）；如出现浮点精度不足的场景再评估 decimal.js / bigint。

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
chore(deps): 升级 astro 至 7.3.x
```

## 分支

- `main`：生产
- `develop`：集成分支
- `feat/*`：功能
- `fix/*`：修复
- `release/*`：发布

## PR 规则

- 必须有 1 个 reviewer 通过
- 必须通过 CI：typecheck、lint、unit（Vitest）、format:check、bundle:check、build + smoke-dist 断言
- 涉及 `lib/calculators/**` 或 `knowledge-base/03-formulas/**` 必须额外 1 名领域审核人通过

---