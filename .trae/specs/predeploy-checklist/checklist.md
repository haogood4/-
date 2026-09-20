# Checklist — 部署前最终检查清单交付验收

## 文档完整性
- [x] `docs/pre-deploy-checklist.md` 存在，行数 ≥200
- [x] 含 12 个一级章节（环境/代码/功能/性能/安全/备份/文档/回滚/部署/依赖/监控/合规）
- [x] 每章 P0 项 ≥2，总 P0 项 ≥24
- [x] 含 P0/P1/P2 分级标识 + 部署决策规则段
- [x] `docs/pre-deploy-checklist-history.md` 存在，模板可填充

## 脚本与集成
- [x] `scripts/check-site-url.mjs` 存在并可直接 node 执行
- [x] 占位域名 `example-calculator.cn` 被拦截（exit 1 + 提示）
- [x] 合法 https 域名放行
- [x] `package.json` 新增 `predeploy` 脚本且调用顺序正确（先校验 URL → 再 verify）
- [x] `deploy` 脚本前置 `pnpm predeploy`

## 端到端验证
- [x] `pnpm predeploy`（合法 PUBLIC_SITE_URL）exit 0
- [x] `pnpm predeploy`（占位 URL 或未设）exit 1 且打印明确错误
- [x] `pnpm verify` 仍 231/231 测试全过、bundle/format/typecheck/mcp 全绿

## 交叉引用
- [x] `strategy-50-calculators/acceptance-plan.md` 出现 "pre-deploy-checklist" 字样（追加升级说明）
- [x] 12 类检查项每类至少有 1 项指向现有脚本/命令（pnpm verify / pnpm audit / wrangler rollback / rsvg-convert 等）

## 决策与流程
- [x] 文档明示 GO / BLOCKED / HOLD 三种决策与触发条件
- [x] 异常处理列含具体回滚命令（wrangler pages deployment rollback）
- [x] 真实 PSI/Lighthouse 待补测项已标注"部署后 24h 内"截止日
- [x] 备份、回滚、监控三类有可执行命令而非纯描述
