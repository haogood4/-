# Checklist

## 一、定位与合规切换

- [x] `docs/project-charter-inputs.md` §1 目标市场状态从"推荐默认值"改为"已批准事实：大陆中文用户 + PIPL"
- [x] `docs/market-strategy-cn.md` 存在，覆盖市场定位、用户画像、流量渠道、变现路径、竞争分析、风险矩阵
- [x] `knowledge-base/06-testing-compliance/privacy-policy.md` 切换到 PIPL 口径（v2.0.0）；保留数据控制者、保留期限、用户权利；明示金融信息服务备案声明位
- [x] `knowledge-base/06-testing-compliance/terms-of-service.md` 管辖法律改为中国大陆（v2.0.0）；明示 ICP 备案号字段
- [x] `knowledge-base/06-testing-compliance/disclaimer.md` 明示"仅供参考，不构成投资/税务/健康建议"（v2.0.0）
- [x] `docs/revenue-model.md` 盈亏平衡公式按大陆 CPM/CPC 区间更新（v2.0.0）；广告平台从 AdSense 切到百度联盟/穿山甲候选

## 二、50 工具裁决

- [x] `knowledge-base/02-product-requirements/calculator-list-v2.md` 存在
- [x] 50 个工具逐项裁决（4 态：approved / merged / deferred / rejected）
- [x] 11 个与既有工具重复的标 `merged` 并指向既有 slug
- [x] 「亲缘称谓计算器」「QR 码生成器」「Color Code Converter」标 `rejected`，附驳回理由
- [x] 股票佣金标 `deferred`（实时行情延后；改为用户输入费率模式）
- [x] 命名规范化：所有"Fund定投""Five Insurances"等中英混排重命名为中文标题 + 英文 slug

## 三、5 档排期

- [x] `.trae/specs/strategy-50-calculators/schedule.md` 存在
- [x] 5 档 × 工具数 × 工时 × 起讫日 × 验收标准对照表齐全
- [x] Tier 1 上线日 ≤ 启动日（2026-09-19）+ 2 周 → 2026-10-03
- [x] Tier 5 上线日 ≤ 启动日 + 12 周 → 2026-11-28
- [x] 工具优先级按搜索量 × 转化率 × 开发难度综合打分

## 四、SEO 关键词库

- [x] `knowledge-base/04-seo-content/keyword-bank/v2/finance.md`：金融类 ≥ 30 主词 + 100 长尾
- [x] `knowledge-base/04-seo-content/keyword-bank/v2/health.md`：健康类 ≥ 30 主词 + 100 长尾
- [x] `knowledge-base/04-seo-content/keyword-bank/v2/renovation.md`：装修类 ≥ 30 主词 + 100 长尾
- [x] `knowledge-base/04-seo-content/keyword-bank/v2/investment.md`：投资专业 ≥ 30 主词 + 100 长尾
- [x] `knowledge-base/04-seo-content/keyword-bank/v2/efficiency.md`：效率工具 ≥ 30 主词 + 100 长尾
- [x] `knowledge-base/04-seo-content/keyword-bank/v2/daily.md`：日常工具 ≥ 30 主词 + 100 长尾
- [x] 每个关键词附搜索量区间、竞争度、目标 slug

## 五、首页与既有工具回写

- [x] `src/pages/index.astro` 的 categories 数组改为 6 大类（金融理财 / 健康生活 / 装修家居 / 投资专业 / 效率工具 / 日常工具）
- [x] 既有 11 工具按新分类挂载（URL 与功能完全保留）
- [x] lead 文案改为大陆用户口径（"为中国大陆用户量身打造"）
- [x] description / 标题改为大陆口径
- [x] 既有 11 工具页面无"海外"措辞（grep 验证通过）
- [x] 单位显示统一为大陆口径（人民币 ¥ 在 revenue-model 中明示）

## 六、风险矩阵

- [x] `risk-matrix.md` 存在
- [x] 合规风险（YMYL / ICP / 金融信息服务备案）
- [x] SEO 风险（关键词堆砌、竞品挤压、百度算法变化）
- [x] 运营风险（公式过时、汇率波动、利率调整）
- [x] 法律风险（个税公式准确性、利率合规、医疗健康免责声明）
- [x] 每项风险含概率、影响、缓解措施、Owner
- [x] ≥ 30 项风险登记（实际 38 项）

## 七、验收与发布计划

- [x] `.trae/specs/strategy-50-calculators/acceptance-plan.md` 存在
- [x] 验收清单：定位切换、50 工具裁决、命名规范、5 档排期、关键词库、首页重排、合规回写、风险矩阵
- [x] 发布计划：每档上线日的发布 checklist（含草稿标注、免责声明、ICP 备案号占位）
- [x] 监控埋点：百度统计 / 友盟 / Sentry 占位
- [x] 5 档 change-id 引用位（待分档 spec 产出后回填具体路径）

## 八、文档与任务管理

- [x] `spec.md` / `tasks.md` / `checklist.md` 三件套齐全
- [x] `schedule.md` / `risk-matrix.md` / `acceptance-plan.md` 3 份补充文档齐全
- [x] 三文件与既有 4 份 spec 无矛盾（除已标注的合规口径切换）
- [x] 工程基线未受影响（`pnpm verify` 仍通过；既有 11 工具代码未改）
