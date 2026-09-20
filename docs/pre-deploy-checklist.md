# 部署前最终检查清单 (Pre-Deploy Checklist)

> **版本**: v1.0.0  **日期**: 2026-09-19  **适用范围**: 计算器大全项目 (Astro 7 静态站 / Cloudflare Pages)

## 文档关系

- **上游依赖**：[`docs/design-system.md`](design-system.md) v2.0.0（设计/性能/可访问性基线）
- **战略对齐**：[`strategy-50-calculators/acceptance-plan.md`](../.trae/specs/strategy-50-calculators/acceptance-plan.md) v1（其发布验收章节已升级为本清单）
- **配套交付**：[`docs/reports/perf-report-redesign.md`](reports/perf-report-redesign.md) / [`docs/reports/a11y-report-redesign.md`](reports/a11y-report-redesign.md)

## 优先级约定

| 级别 | 含义 | 部署决策 |
|---|---|---|
| **P0** | 阻断部署（任一红 → BLOCKED） | 必须全绿 |
| **P1** | 建议部署（P1 红灯 ≤10% 仍可 GO；>10% 触发 HOLD） | 通过率 ≥90% |
| **P2** | 知情记录 | 不影响决策 |

---

## 1. 环境配置验证（7 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 环境 | `PUBLIC_SITE_URL` 已注入且非占位符 | **P0** | PM | `node scripts/check-site-url.mjs` | exit 0 | | 见 [§13 决策规则](#13-部署决策规则) | ☐ |
| 环境 | Node 版本 ≥20 | **P0** | 前端 | `node -p "process.versions.node"` | ≥ 20.0.0 | | 升级 Node 至 20 LTS | ☐ |
| 环境 | pnpm 版本 ≥9 | **P0** | 前端 | `pnpm -v` | ≥ 9.0.0 | | `npm i -g pnpm@latest` | ☐ |
| 环境 | wrangler 认证态 | P1 | DevOps | `npx wrangler whoami` | 输出账户邮箱 | | 重新 `wrangler login` | ☐ |
| 环境 | Cloudflare Pages Account ID 配置 | P1 | DevOps | `echo $CLOUDFLARE_ACCOUNT_ID` | 非空 | | Cloudflare Dashboard → Workers & Pages → 复制 | ☐ |
| 环境 | API Token 权限 (Pages: Edit) | P1 | DevOps | `npx wrangler pages deployment list --project-name=calculator-site` | exit 0 + 列表 | | dash.cloudflare.com → My Profile → API Tokens → Edit Template | ☐ |
| 环境 | 磁盘空间 ≥500MB | P2 | DevOps | `df -h . \| tail -1 \| awk '{print $4}'` | ≥500M | | 清理 `node_modules` 重建或扩盘 | ☐ |

## 2. 代码质量审核（8 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 代码 | TypeScript 类型零错 | **P0** | 前端 | `pnpm typecheck` | exit 0 | | 修复 ts 错误后重跑 | ☐ |
| 代码 | Vitest 单元测试全过 | **P0** | 前端 | `pnpm test:run` | 231/231 pass | | 修复失败用例，禁止 `--update` 跳过 | ☐ |
| 代码 | Prettier 格式合规 | **P0** | 前端 | `pnpm format:check` | exit 0 | | `pnpm format` 自动修复 | ☐ |
| 代码 | MCP JSON 元数据校验 | P1 | 前端 | `pnpm mcp:check` | 11 JSON 全 valid | | 修复 schema 违规 | ☐ |
| 代码 | Bundle 体积限额 | P1 | 前端 | `pnpm bundle:check` | JS ≤100KB / CSS ≤30KB | | 见 §4 性能章节 | ☐ |
| 代码 | TODO/FIXME/XXX 标记 | P1 | 前端 | `grep -R "TODO\|FIXME\|XXX" src/ \| wc -l` | ≤3 | | 集中处理或纳入下迭代 | ☐ |
| 代码 | 关键模块 cyclomatic 复杂度 | P2 | 前端 | 抽样审查 `src/lib/calculators/*.ts` | ≤10 | | 重构或拆分 | ☐ |
| 代码 | 代码重复率 | P2 | 前端 | `jscpd src/ --threshold 5`（可选） | ≤5% | | 抽取公共工具函数 | ☐ |

## 3. 功能完整性测试（9 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 功能 | 页面构建数 | **P0** | 前端 | `find dist -name index.html \| wc -l` | = 52 | | 检查排除目录与新页面是否漏构建 | ☐ |
| 功能 | sitemap URL 数 | **P0** | 前端 | `grep -c "<loc>" dist/sitemap-0.xml` | = 52 | | 重启 astro build；检查排除规则 | ☐ |
| 功能 | 首页 + 5 抽样工具页 HTTP 200 | **P0** | QA | `curl -fsS -o /dev/null -w "%{http_code}" $PUBLIC_SITE_URL{,,/finance/mortgage-cn,/finance/income-tax-cn,/health/bmi-cn,/daily/basic,/finance/prepayment-cn}` | 全部 200 | | Pages 回滚至上一 known-good | ☐ |
| 功能 | 6 抽样计算结果与基线偏差 <1% | P1 | QA | 浏览器代理对每个工具填入预设输入，对比库函数输出 | 偏差 <1% | | 修复公式 bug，回滚部署 | ☐ |
| 功能 | 库函数边缘场景覆盖 | P1 | 前端 | `pnpm test:run --reporter=verbose` | 除零/负数/边界值用例全过 | | 补测试用例 | ☐ |
| 功能 | 前端错误提示覆盖率 | P1 | 前端 | `grep -c "result-hint\|field-error" src/scripts/*-page.ts` | ≥95% 错误路径 | | 补错误反馈 | ☐ |
| 功能 | axe-core 无 critical/serious | P1 | QA | 浏览器代理 axe.run()（首页+房贷+BMI） | 0 critical/serious | | 修复 a11y 违规 | ☐ |
| 功能 | 键盘走查 | P2 | QA | 抽样 5 页 Tab/Enter/Esc 流程 | 无焦点陷阱 | | 修复焦点顺序与 ARIA | ☐ |
| 功能 | 错误码库测试覆盖 | P2 | 前端 | 检查 `src/lib/calculators/*.ts` 错误分支 | ≥90% | | 补测试用例 | ☐ |

### 6 个抽样工具基线数据（参考）

| 工具 | 输入 | 期望输出（参考） |
|---|---|---|
| 房贷（等额本息） | 本金 100 万 / 30 年 / 4.2% | 月供 ¥4,890.17 |
| 个税（年终奖单独计税） | 应税 36000 | 1,080 |
| BMI | 身高 170 / 体重 65 | 22.5（双标准正常） |
| 四则 | 12 + 30 | 42 |
| 提前还款 | 本金 100 万 / 30 年 / 4.2% / 已还 12 期 / 提前还 10 万 | 方案 A 省息 ≈¥202,690 |
| 复利 | 本金 1 万 / 5% / 10 年 | ≈¥16,289 |

## 4. 性能与负载测试（7 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 性能 | CSS gzip ≤15KB | **P0** | 前端 | `for f in dist/_astro/*.css;do gzip -c $f\|wc -c;done` | 累计 ≤ 15,360 | | 拆分样式或重审 IT CSS | ☐ |
| 性能 | JS gzip ≤100KB | **P0** | 前端 | `for f in dist/_astro/*.js;do gzip -c $f\|wc -c;done` | 累计 ≤ 102,400 | | 代码分割、移除死代码 | ☐ |
| 性能 | 首页关键路径 gzip ≤25KB | **P0** | 前端 | `HTML+CSS+menu.js+register-sw.js+favicon.svg` gzip 合计 | ≤ 25,600 | | 见 [`docs/reports/perf-report-redesign.md`](reports/perf-report-redesign.md) 趋势 | ☐ |
| 性能 | 首页 HTML gzip ≤5KB | P1 | 前端 | `gzip -c dist/index.html \| wc -c` | ≤ 5,120 | | 精简 frontmatter、合并样式 | ☐ |
| 性能 | `pnpm build` 52 页时长 | P1 | 前端 | `time pnpm build` | ≤ 10s | | 检查依赖与缓存 | ☐ |
| 性能 | 首屏静态资源请求数 | P1 | 前端 | 浏览器代理 network 面板（首页冷加载） | ≤ 8 个 | | 合并 sprite、内联关键 CSS | ☐ |
| 性能 | PSI 移动端得分 ≥85 | P2 | 前端 | 部署后 [pagespeed.web.dev](https://pagespeed.web.dev) | ≥ 85（截止 24h 内） | | 阻塞后续迭代，记录问题 | ☐ |
| 性能 | Lighthouse 综合 ≥85 | P2 | 前端 | Chrome DevTools Lighthouse | ≥ 85（截止 24h 内） | | 同上 | ☐ |
| 性能 | 3G 模拟 FCP <1.8s | P2 | 前端 | PSI Lab Data | < 1.8s（截止 24h 内） | | 同上 | ☐ |

## 5. 安全漏洞扫描（8 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 安全 | 依赖 CVE | **P0** | 安全 | `pnpm audit --prod --audit-level=high` | 0 high/critical | | `pnpm update <pkg>` 或替换 | ☐ |
| 安全 | 敏感信息泄露 | **P0** | 安全 | `grep -R "password\|secret\|token\|api[_-]key" src/ public/ \| grep -v "siteName\|placeholder\|astro.config"` | 0 命中 | | 移除外置密钥（任何密钥都不应入仓） | ☐ |
| 安全 | CSP `_headers` 正确 | **P0** | 前端 | `cat public/_headers` | 含 `script-src 'self'` + `object-src 'none'` + `frame-ancestors 'none'` | | 修复 CSP（参考 `public/_headers` v2.0.0） | ☐ |
| 安全 | HSTS 强度 | **P0** | DevOps | `grep "Strict-Transport-Security" public/_headers` | max-age ≥ 31536000 + includeSubDomains | | 调整 `_headers` | ☐ |
| 安全 | 无 `unsafe-inline`（CSP） | P1 | 前端 | `grep -i "unsafe-inline" public/_headers` | 仅 application/ld+json 块允许 | | 重构为外链脚本或 nonce | ☐ |
| 安全 | 无明文 HTTP 引用 | P1 | 前端 | `grep -RE "http://[a-z]" src/ public/ \| grep -v "schema.org\|xmlns"` | 0 命中 | | 替换为 https | ☐ |
| 安全 | meta 标签无敏感信息 | P1 | 安全 | `grep -RE "api[_-]?key\|password\|secret" dist/*.html dist/**/*.html` | 0 命中 | | 清理元数据 | ☐ |
| 安全 | favicon/og-image 无 EXIF/GPS | P2 | 安全 | `exiftool public/og-image.png` | 无 GPS/Author 字段 | | 重新导出 PNG（不带 EXIF） | ☐ |

## 6. 数据备份确认（5 项）

> 本项目为 100% 静态站 + 无后端 + 无用户数据 → **备份等价于 dist 构建产物归档**。

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 备份 | dist 产物归档 | **P0** | DevOps | `tar -czf dist-${VERSION}.tar.gz dist` | 文件存在 | | 检查 VERSION 变量 | ☐ |
| 备份 | sha256 校验 | **P0** | DevOps | `sha256sum dist-${VERSION}.tar.gz > dist-${VERSION}.sha256` | 文件存在 | | 重算 | ☐ |
| 备份 | Cloudflare Pages deployment history | P1 | DevOps | `npx wrangler pages deployment list --project-name=calculator-site` | ≥ 3 个历史版本 | | 默认保留；勿手动清理 | ☐ |
| 备份 | `.gitignore` 包含 dist/node_modules | P1 | 前端 | `grep -E "^dist\|node_modules" .gitignore` | 命中 | | 补充忽略规则 | ☐ |
| 备份 | Sitemap 历史快照 ≥30 天 | P2 | SEO | R2 或 git 留存历史 sitemap | ≥ 30 个历史快照 | | 启用版本化存储 | ☐ |

## 7. 文档完整性检查（7 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 文档 | 设计规范 v2.0.0 | **P0** | PM | `test -f docs/design-system.md && head -5 docs/design-system.md` | 含 v2.0.0 + 2026-09-19 | | 补齐设计规范 | ☐ |
| 文档 | PIPL 三件套 | **P0** | 法务 | `ls docs/{privacy-policy,terms-of-service,disclaimer}.md` | 3 个文件存在 | | 法务起草 | ☐ |
| 文档 | README.md | **P0** | PM | `test -f README.md` | 存在 | | 起草 README | ☐ |
| 文档 | 性能报告 | P1 | 前端 | `test -f docs/reports/perf-report-redesign.md` | 存在 | | 重跑性能测试 | ☐ |
| 文档 | 可访问性报告 | P1 | QA | `test -f docs/reports/a11y-report-redesign.md` | 存在 | | 重跑 axe 扫描 | ☐ |
| 文档 | 公式库 | P1 | 法务 | `ls knowledge-base/03-formulas/**/*.yaml \| wc -l` | ≥ 50 | | 补公式文档 | ☐ |
| 文档 | 关键词库 | P1 | SEO | `ls knowledge-base/04-seo-content/keyword-bank/v2/*.md \| wc -l` | ≥ 6 | | 补关键词库 | ☐ |

## 8. 回滚方案验证（5 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 回滚 | Pages 默认部署历史可用 | **P0** | DevOps | Cloudflare Dashboard → Pages → calculator-site → Deployments | 至少保留最近 5 次 | | 默认行为；勿禁用 | ☐ |
| 回滚 | wrangler rollback 命令 | **P0** | DevOps | `npx wrangler pages deployment rollback --help` | 命令可用 | | `wrangler login` 重认证 | ☐ |
| 回滚 | 上一 known-good deployment-id 记录 | **P0** | DevOps | `npx wrangler pages deployment list --project-name=calculator-site` 复制 ID | 写入 `docs/pre-deploy-checklist-history.md` | | 缺失则从前次部署日志查 | ☐ |
| 回滚 | staging 演练 ≤30s | P1 | DevOps | staging 项目跑完整 deploy + rollback | 完成时间 ≤30s | | 联系 Cloudflare 支持 | ☐ |
| 回滚 | 回滚后元数据完整 | P1 | QA | 回滚后 curl `/sitemap-index.xml` + `/` 检查 | sitemap 仍可访问 | | 手动重新部署 | ☐ |

## 9. 部署流程测试（6 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 部署 | 本地 build | **P0** | 前端 | `pnpm build` | 52 页 exit 0 | | 见 §2 代码章节 | ☐ |
| 部署 | `pnpm predeploy` | **P0** | 前端 | `pnpm predeploy` | exit 0 | | 见 §1 环境章节 | ☐ |
| 部署 | `pnpm deploy` 在 staging | **P0** | DevOps | `pnpm deploy` (staging 项目) | exit 0 + Pages status success | | `wrangler login` + 重试 | ☐ |
| 部署 | 部署时长 | P1 | DevOps | `time pnpm deploy` | < 60s | | 检查网络与文件大小 | ☐ |
| 部署 | 部署后 5 分钟内 HTTP 200 | P1 | QA | `curl -fsS $PUBLIC_SITE_URL/` | 200 | | 立即回滚（见 §8） | ☐ |
| 部署 | Dashboard deployment status | P1 | DevOps | Cloudflare Dashboard | success | | 检查日志 | ☐ |

## 10. 第三方依赖兼容性（6 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 依赖 | lockfile 一致 | **P0** | 前端 | `pnpm install --frozen-lockfile` | exit 0 | | `pnpm install --lockfile-only` 同步 | ☐ |
| 依赖 | devDeps 无高危 CVE | **P0** | 安全 | `pnpm audit --prod --audit-level=high` | 0 命中 | | 见 §5 安全章节 | ☐ |
| 依赖 | Node ≥20 | **P0** | 前端 | `node -v` | v20+ | | nvm 切换 | ☐ |
| 依赖 | Astro 7 + sitemap 3.7.4 + vitest 5 + prettier 3.9.7 + wrangler 4.135.0 | **P0** | 前端 | `pnpm ls --depth=0` | 版本精确匹配 | | `pnpm install` 重装 | ☐ |
| 依赖 | rsvg-convert 可用（og-image 重建） | P1 | DevOps | `which rsvg-convert` | 路径存在 | | `apt install librsvg2-bin` | ☐ |
| 依赖 | 依赖兼容矩阵月检 | P2 | 前端 | 每月手动审查 Astro/Wrangler/Vitest changelog | 无 Breaking 影响 | | 升级或回归 | ☐ |

## 11. 监控告警配置（5 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 监控 | Cloudflare Analytics 启用 | **P0** | DevOps | Dashboard → Pages → Settings → Analytics | enabled | | 在 Dashboard 启用 | ☐ |
| 监控 | Cloudflare Web Analytics 嵌入 | **P0** | 前端 | `grep "data-cf-beacon" src/layouts/BaseLayout.astro` 或 dist HTML | 命中 | | 在 head 嵌入 beacon 脚本 | ☐ |
| 监控 | Dashboard 实时流量 | P1 | DevOps | 部署后 5 分钟内 Dashboard 显示访问 | ≥1 个请求 | | 检查 DNS 与 CDN | ☐ |
| 监控 | 错误监控接入 | P1 | 前端 | Sentry/自托管监控（部署后 7 天） | 已配置 | | 接入 Sentry 或 Cloudflare Workers 日志 | ☐ |
| 监控 | 自定义告警 | P2 | DevOps | 5xx 错误率 >1% 告警 | 已配置 | | 接入 Cloudflare Notifications | ☐ |

## 12. 合规性验证（9 项）

| 类别 | 检查项 | P | 负责人 | 检查方法 | 通过标准 | 结果 | 异常处理 | 状态 |
|---|---|---|---|---|---|---|---|---|
| 合规 | 隐私政策 PIPL | **P0** | 法务 | `grep "个人信息保护法\|PIPL" docs/privacy-policy.md` | 命中 | | 法务修订 | ☐ |
| 合规 | 用户协议 | **P0** | 法务 | `test -f docs/terms-of-service.md` | 存在 + 管辖法律明示 | | 法务起草 | ☐ |
| 合规 | 免责声明 | **P0** | 法务 | `test -f docs/disclaimer.md` | 存在 + 金融/健康免责声明 | | 法务起草 | ☐ |
| 合规 | Footer 链接齐全 | **P0** | 前端 | `curl -fsS $PUBLIC_SITE_URL/ \| grep -E "隐私政策\|用户协议\|免责声明"` | 3 命中 | | 补链接 | ☐ |
| 合规 | YMYL 免责文案（金融/健康） | P1 | 法务 | `grep -lE "仅供参考\|结果仅供参考" src/pages/finance src/pages/health -r \| wc -l` | ≥ 49 命中 | | 补免责文案 | ☐ |
| 合规 | 金融公式与官方比对 | P1 | QA | 6 抽样工具 vs 个税计算器 / 银行等额本息 | 偏差 <1% | | 修复公式 | ☐ |
| 合规 | BMI 双标准展示 | P1 | QA | 浏览器访问 /health/bmi-cn/ | 同时显示中国+WHO 标准 | | 补齐双标准 | ☐ |
| 合规 | 政策资讯博客上线准入 | **P0** | 政策研究员 | 每篇 `type==='blog'` 文章附 `docs/policy-verifications/YYYY-MM/<slug>-verification.md`（按 [10 维度 SOP](./policy-verification-checklist.md) 核对） | 核对结论为「通过」或「有条件通过（已闭环）」+ 双签齐全 | | 未通过文章撤下或延期发布 | ☐ |
| 合规 | ICP 备案 | P2 | 法务 | Cloudflare Dashboard 域名设置 → ICP 记录 | 已备案（大陆域名待 BLOCKED 解锁） | | 备案后补 | ☐ |

---

## 13. 部署决策规则

| 决策 | 触发条件 | 下一步 |
|---|---|---|
| **GO** ✅ | P0 全绿 + P1 通过率 ≥90% + 阻断性 P1 全绿 | 执行 `pnpm deploy`；填写历史日志 |
| **HOLD** ⏸ | P0 全绿 + P1 红灯 >10% 或任意阻断性 P1 红 | PM 决策：延期 / 降级发布 / 修复后重审 |
| **BLOCKED** 🚫 | 任意 P0 红 | 修复对应项 → 重跑 `pnpm predeploy` → 重新走清单 |

**首部署特殊规则**：因 PSI/Lighthouse 真实跑分需部署公网后 24h 内补测，§4 性能 P2 项在首次部署前允许标"待补测"（已知限制，不影响 GO 决策）。

---

## 14. 已知限制与待补测

| 项 | 原因 | 截止 |
|---|---|---|
| PSI/Lighthouse 真实跑分 | 本机无 Chrome；需部署公网后 [pagespeed.web.dev](https://pagespeed.web.dev) 实测 | 部署后 24h |
| 屏幕阅读器 NVDA/VoiceOver | 本机无读屏软件；需人工 | 部署后 7 天 |
| Safari/Firefox/Edge 跨浏览器 | 本机仅 Chromium；CSS 特性均 Baseline widely available | 部署后 7 天（抽样 10 页） |
| ICP 备案 | 大陆域名上线前置要求 | BLOCKED 解锁后 |
| 真实 wrangler login | Cloudflare 账户未授权 | 用户授权后 |

---

## 附录 A：部署命令速查

```bash
# 完整部署流程
export PUBLIC_SITE_URL=https://your-domain.com
pnpm predeploy                    # URL 校验 + 5 项门禁
pnpm deploy                       # build + wrangler pages deploy

# 回滚（如需）
npx wrangler pages deployment list --project-name=calculator-site
npx wrangler pages deployment rollback <deployment-id> --project-name=calculator-site

# 健康检查
curl -fsS -o /dev/null -w "%{http_code}\n" $PUBLIC_SITE_URL/
curl -fsS $PUBLIC_SITE_URL/sitemap-index.xml | head
```

## 附录 B：职责矩阵

| 角色 | 主要负责章节 |
|---|---|
| **PM** | §1 §3 §7 §13 决策 |
| **前端** | §1 §2 §4 §5 §7 §9 §10 §11 |
| **QA** | §3 §5 §7 §9 §12 |
| **安全** | §5 §10 §12 |
| **法务** | §7 §12 |
| **DevOps** | §1 §6 §8 §9 §11 |
| **SEO** | §6 §7（关键词库） |
