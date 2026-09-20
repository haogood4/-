# 部署前最终检查清单 Spec

## Why

当前项目已具备 52 页静态站点 + 231 单元测试 + SEO/可访问性优化 + 部署脚本 `pnpm deploy`，但缺少一份**结构化、可执行、可追溯的部署前最终检查清单**，导致每次部署存在漏检风险（环境配置、依赖兼容性、监控配置、回滚验证等关键项无统一标准）。本 spec 输出 **12 类检查 + 80+ 检查项**的标准化清单，绑定负责人、检查方法、可量化通过标准与异常处置流程，作为部署准入门槛。

## What Changes

- **BREAKING（流程）**：所有部署（含 `pnpm deploy` / 手动 wrangler pages deploy / CI 自动部署）必须先勾选清单中 P0 项（12 类各 ≥1 项），P0 全绿 + P1 ≥90% 才可执行部署
- 新增 `docs/pre-deploy-checklist.md`（v1.0.0），按 12 大类组织 80+ 检查项，每项含 8 列：检查类别 / 检查项 / 负责人 / 检查方法 / 通过标准 / 结果 / 异常处理 / 完成状态
- 新增 `docs/pre-deploy-checklist-history.md`（首次部署后维护，作为部署回溯日志）
- 修改 `package.json` 新增脚本 `predeploy`（执行 `pnpm verify` 强制门禁）+ `predeploy:report`（输出本次部署的自检报告 JSON）
- **BREAKING（CI/CD）**：CI（未来接入 GitHub Actions 时）必须先跑 `pnpm predeploy` 再执行部署
- 修改 `astro.config.mjs` 站点 URL 必须通过 `PUBLIC_SITE_URL` 注入；新增 `--site` 参数校验脚本（`scripts/check-site-url.mjs`）

## Impact

- Affected specs：`strategy-50-calculators/acceptance-plan.md`（清单 v1 是其子集，本次扩展为 12 类）、`redesign-frontend-uiux`（仅其交付物被清单引用）
- Affected code：
  - `docs/pre-deploy-checklist.md`（新增，核心交付）
  - `docs/pre-deploy-checklist-history.md`（新增）
  - `package.json`（新增 2 个脚本）
  - `scripts/check-site-url.mjs`（新增）
- 不受影响：业务代码、SEO/UI 测试、计算逻辑

## ADDED Requirements

### Requirement: 环境配置验证
清单 SHALL 覆盖：硬件规格（CPU/内存/磁盘 ≥ 推荐配置）、OS 版本（Cloudflare Pages 边缘 Node v20+）、网络（DNS 解析 / HTTPS 证书 / CDN 缓存）、构建工具版本（Node≥20 / pnpm≥9 / astro@7.3.3 / @astrojs/sitemap@3.7.4 / wrangler@4.135.0）、环境变量（`PUBLIC_SITE_URL` 已注入）、Cloudflare 账户（Account ID / API Token 权限 Pages Edit）。

#### Scenario: 构建环境就绪
- **WHEN** 执行 `pnpm predeploy`
- **THEN** `scripts/check-site-url.mjs` 校验通过（域名格式合法、长度 ≤253、非占位符 `example-calculator.cn`），否则部署阻断并提示替换

### Requirement: 代码质量审核
清单 SHALL 覆盖：ESLint/TypeScript 类型零错误、Prettier 格式合规、Vitest 全部用例通过（当前 231）、代码重复率 ≤5%、关键模块（calculators / scripts）复杂度 ≤10 cyclomatic、`grep -R "TODO\|FIXME\|XXX"` ≤3 处。

#### Scenario: 自动化门禁
- **WHEN** 执行 `pnpm verify`
- **THEN** typecheck/test:run/format:check/mcp:check/bundle:check 五项全绿（硬门禁）

### Requirement: 功能完整性测试
清单 SHALL 覆盖：核心 50 工具页面 HTTP 200 + 关键交互返回正确结果（房贷/个税/BMI/四则/复利/提前还款 6 个抽样）、边缘场景（除零/负数/边界值/极长输入）通过率 100%、错误处理（前端 + 库函数错误码）覆盖率 ≥95%、可访问性 axe-core 3 页 0 critical/serious。

### Requirement: 性能与负载测试
清单 SHALL 覆盖：关键路径 gzip ≤25KB、CSS gzip ≤15KB、JS gzip ≤100KB、首页 FCP <1.8s（3G 400kbps）、LCP <2.5s、CLS <0.1。Cloudflare Pages 全球边缘 P95 <500ms。**因本机无 Chrome，真实 Lighthouse/PSI 需部署公网后补测**——清单记录"待补测"项并标注补测截止日期（部署后 24h）。

#### Scenario: 性能预算通过
- **WHEN** `pnpm bundle:check` 与 dist 文件 gzip 实测
- **THEN** 三项预算全绿，否则阻断部署

### Requirement: 安全漏洞扫描
清单 SHALL 覆盖：`pnpm audit`（依赖 CVE）0 high/critical、`grep -R "password\|secret\|token\|api[_-]key"` 排除白名单后 0 命中、CSP `_headers` 正确（已配置 `script-src 'self'`、`object-src 'none'`、`frame-ancestors 'none'`）、HSTS max-age≥31536000、`Content-Security-Policy` 不存在 `unsafe-inline`（除 application/ld+json 数据块）、HTTPS-only（无明文 HTTP 引用）、SEO/Social 元数据无敏感信息泄露。

### Requirement: 数据备份确认
清单 SHALL 覆盖：当前是 100% 静态站 + 无后端 + 无数据库 + 无用户数据 → **备份等价于 dist 构建产物归档**。要求：`tar -czf dist-${VERSION}.tar.gz dist` 产物上传 Cloudflare R2 备份桶 + checksum 校验（sha256）、Sitemap 上次构建快照保留 ≥30 天历史、回滚时可直接用历史构建产物。

### Requirement: 文档完整性检查
清单 SHALL 覆盖：`README.md` + `docs/design-system.md` v2.0.0 + 50 工具计算公式（Knowledge Base `knowledge-base/03-formulas/`） + 3 份法律文档（隐私政策/用户协议/免责声明 PIPL 口径）+ 部署文档（本清单即其中之一）+ 性能报告 + 可访问性报告 + 知识库产品需求/SEO 关键词库 ≥6 份。

### Requirement: 回滚方案验证
清单 SHALL 覆盖：Cloudflare Pages 默认保留所有部署历史（dashboard → Deployments → Rollback），回滚 ≤30s 即可完成；手动回滚命令 `wrangler pages deployment rollback <deployment-id>`（需 Pages Edit 权限）。**预生产演练**：在 staging 项目（或临时 pages 项目）跑一次完整 deploy + rollback，确认流程通畅。

#### Scenario: 部署失败回滚
- **WHEN** 生产部署后 5 分钟内健康检查（HTTP 200、关键路径 gzip、sitemap 可访问）失败
- **THEN** 自动触发回滚操作（人工或 CI webhook），恢复至上一个 known-good 部署版本，记录事故时间线

### Requirement: 部署流程测试
清单 SHALL 覆盖：本地 `pnpm build` 52 页成功、`pnpm deploy` 在 staging 环境完整跑通（含 `PUBLIC_SITE_URL` 注入、wrangler 认证、上传、Pages 项目绑定、自定义域名/路径配置）、部署时长参考值（52 页 <60s）、部署后立即访问根路径与 5 个抽样工具页确认 HTTP 200。

### Requirement: 第三方依赖兼容性
清单 SHALL 覆盖：根 `package.json` 中 6 个 devDeps 与 lockfile 一致（`pnpm install --frozen-lockfile`）、Node 版本 ≥20（package.json 已隐式通过 engines 校验？若无则建议加 `"engines"` 字段）、Astro 7 + sitemap 3.7.4 + vitest 5 + prettier 3.9.7 + wrangler 4.135.0 互相兼容、rsvg-convert 工具链用于 og-image 重新渲染（仅本地构建需要，Cloudflare Pages 不需要）。

### Requirement: 监控告警配置
清单 SHALL 覆盖：Cloudflare Analytics 启用、Cloudflare Web Analytics（免费，无需 Cookie）JS 片段已嵌入 `<head>`、Sentry 或自托管错误监控（部署后 7 天内接入；MVP 阶段可用 Cloudflare 邮件告警替代）、部署后 5 分钟内 Cloudflare Pages deployment status 显示 success、若失败 webhook 通知（待配）。

### Requirement: 合规性验证
清单 SHALL 覆盖：PIPL（中国大陆个人隐私法）口径三件套（`docs/privacy-policy.md` + `terms-of-service.md` + `disclaimer.md` 已切换）+ 金融/健康类工具页面 YMYL 免责文案齐备（grep 验证）、金融公式偏差 <1%（与官方个税计算器/房贷等额本息比对）、BMI 双标准（中国/WHO）展示、ad 占位固定尺寸防 CLS、广告位未上线前不投放（避免违规）、ICP 备案状态（待 BLOCKED 解锁）。

## MODIFIED Requirements

### Requirement: 部署入口
既有 `package.json` SHALL 新增 `predeploy` 脚本（强制 `pnpm verify`）与 `predeploy:report`（输出 JSON 自检报告）；`deploy` 脚本在调用 wrangler 前应先跑 `predeploy`。

### Requirement: 站点 URL 校验
既有 `astro.config.mjs` 的 `site` 配置 SHALL 通过 `PUBLIC_SITE_URL` 注入；新增 `scripts/check-site-url.mjs` 在 `predeploy` 中调用，禁止占位符 `example-calculator.cn` 与 localhost。

## REMOVED Requirements

无（本 spec 为新增文档与流程）。

---

## 清单样例节选（完整 80+ 项见交付物 docs/pre-deploy-checklist.md）

| 类别 | 检查项 | 负责人 | 方法 | 通过标准 |
|---|---|---|---|---|
| 环境 | `PUBLIC_SITE_URL` 已注入 | PM | `echo $PUBLIC_SITE_URL` | 非空、非占位符、合法 URL |
| 代码 | TypeScript 类型零错 | 前端 | `pnpm typecheck` | exit 0 |
| 代码 | 单元测试全过 | 前端 | `pnpm test:run` | 231/231 pass |
| 功能 | 6 个抽样工具页结果正确 | QA | 浏览器代理 | 与基线数据偏差 <1% |
| 性能 | 关键路径 gzip | 前端 | `pnpm bundle:check` | ≤25KB |
| 安全 | `pnpm audit` | 安全 | CLI 命令 | 0 high/critical |
| 备份 | dist 产物归档 | DevOps | `tar` + sha256 + R2 上传 | 校验通过 |
| 文档 | PIPL 三件套 | 法务 | grep 关键字 | 内容匹配最新版 |
| 回滚 | staging 演练 | DevOps | wrangler rollback | ≤30s 恢复 |
| 部署 | `pnpm deploy` staging | DevOps | 完整跑通 | exit 0 + Pages success |
| 依赖 | lockfile 一致 | 前端 | `pnpm install --frozen-lockfile` | exit 0 |
| 监控 | Web Analytics 嵌入 | 前端 | grep `<script data-cf-beacon` | 已嵌入 |
| 合规 | YMYL 免责 | 法务 | grep 工具页 | ≥49 命中 |
