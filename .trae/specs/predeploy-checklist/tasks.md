# Tasks — 部署前最终检查清单

> 约束：本次为流程/文档类工作，少量脚本（site URL 校验、predeploy 脚本）；不改业务代码、不破坏现有契约。

- [x] Task 1: 起草 `docs/pre-deploy-checklist.md` v1.0.0
  - [x] 1.1 文档头：版本 v1.0.0、日期 2026-09-19、适用范围（Cloudflare Pages 静态站）
  - [x] 1.2 12 大类各 1 张表，列：检查类别 / 检查项描述 / 负责人 / 检查方法 / 通过标准 / 检查结果记录 / 异常处理措施 / 完成状态
  - [x] 1.3 每类 P0/P1/P2 分级（P0 阻断部署、P1 必须 90% 通过、P2 知情记录）
  - [x] 1.4 文末"部署决策规则"：P0 全绿 + P1 ≥90% → GO；P0 任一红 → BLOCKED；P1 红灯 >10% → HOLD（PM 决策）
  - 验收：`wc -l docs/pre-deploy-checklist.md` ≥ 200；含 12 个一级章节；P0 项合计 ≥ 24

- [x] Task 2: 起草 `docs/pre-deploy-checklist-history.md`（空模板）
  - [x] 2.1 表格列：部署时间 / 版本 / 操作人 / P0 通过数 / P1 通过率 / 结果 / 备注 / 回滚记录
  - [x] 2.2 预置表头与说明
  - 验收：文件可读，含示例空行

- [x] Task 3: 新增 `scripts/check-site-url.mjs`
  - [x] 3.1 读取 `process.env.PUBLIC_SITE_URL`；若未设 → exit 1 + 提示"必须设置部署域名"
  - [x] 3.2 校验：URL 格式合法（`new URL()`）、协议 https、长度 ≤253、host 非 `example-calculator.cn` 与 `localhost`
  - [x] 3.3 输出「✅ PUBLIC_SITE_URL 校验通过: <url>」或错误信息
  - 验证：故意设 `PUBLIC_SITE_URL=https://example-calculator.cn` 与合法域名各跑一次

- [x] Task 4: 更新 `package.json`
  - [x] 4.1 新增 `predeploy`：`node scripts/check-site-url.mjs && pnpm verify`
  - [x] 4.2 新增 `predeploy:report`：输出 `{ timestamp, site, node, pnpm, ...}` JSON 到 stdout
  - [x] 4.3 `deploy` 脚本前置 `pnpm predeploy`：`pnpm predeploy && PUBLIC_SITE_URL=... astro build && wrangler pages deploy dist`
  - 验证：未设 PUBLIC_SITE_URL 跑 predeploy 应 exit 1；设合法域名后 exit 0

- [x] Task 5: 集成验证
  - [x] 5.1 `pnpm predeploy` 端到端跑通（先阻断场景，再放行场景）
  - [x] 5.2 `pnpm verify` 全绿仍不变（231 测试 + 5 项门禁）
  - 验收：CI 友好（exit codes 正确、无交互）

- [x] Task 6: 交叉引用与登记
  - [x] 6.1 更新 `docs/README.md`（若不存在则跳过；不要新建 README）将本清单链接挂到合适位置
  - [x] 6.2 在 `strategy-50-calculators/acceptance-plan.md` 中追加"已升级为 pre-deploy-checklist v1.0.0"说明（不删原文）
  - 验收：grep 能在两处找到「pre-deploy-checklist」字样

# Task Dependencies

- Task 3 独立，可与 Task 1 并行
- Task 4 依赖 Task 3
- Task 5 依赖 Task 3、4
- Task 6 依赖 Task 1、5
