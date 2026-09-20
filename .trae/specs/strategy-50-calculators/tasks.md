# Tasks

> 排序原则：先解决定位冲突与既有事实冲突 → 50 工具逐项裁决 → 关键词库 → 排期 → 既有工具回写 → 文档落地。
> 本 spec 仅裁决与文档；不实施任何工具代码。5 档实施在后续 5 份 change-id 中进行。

---

## 阶段一：定位与合规裁决（P0）

- [ ] Task 1: 市场定位切换生效
  - [ ] SubTask 1.1: 修改 `docs/project-charter-inputs.md` §1 目标市场：从「推荐默认值：大陆中文」改为「已批准事实：大陆中文用户 + PIPL + 银保监会/国税口径」
  - [ ] SubTask 1.2: 新增 `docs/market-strategy-cn.md`：覆盖市场定位、用户画像、流量渠道（百度搜索 / 微信生态 / 小红书 / 知乎 / 头条搜索）、变现路径（百度联盟 / 穿山甲 / 360 联盟）、竞争分析、风险矩阵
  - [ ] SubTask 1.3: 修改 `knowledge-base/06-testing-compliance/privacy-policy.md`：从 GDPR/CCPA 切换到 PIPL；保留数据控制者、保留期限、用户权利；明示"金融信息服务备案"声明位
  - [ ] SubTask 1.4: 修改 `knowledge-base/06-testing-compliance/terms-of-service.md`：管辖法律改为「中国大陆法律」；明示 ICP 备案号字段；明示"金融类工具仅供参考"
  - [ ] SubTask 1.5: 修改 `knowledge-base/06-testing-compliance/disclaimer.md`：明示"计算结果仅供参考，不构成投资 / 税务 / 健康建议"；明示草稿标注边界
  - [ ] SubTask 1.6: 修改 `docs/revenue-model.md`：盈亏平衡公式按大陆 CPM/CPC 区间更新；广告平台从 AdSense 切到百度联盟 / 穿山甲候选

## 阶段二：50 工具裁决（P0）

- [ ] Task 2: 新增 50 工具裁决清单
  - [ ] SubTask 2.1: 新增 `knowledge-base/02-product-requirements/calculator-list-v2.md`：含 slug、分类、YMYL 等级、SEO 主关键词（≥5）、优先级、去留决定
  - [ ] SubTask 2.2: 11 个与既有 11 工具重复的（Discount、Percentage、Age、Date Diff、Timestamp、Length、Temperature、Unit Price、Average、Ratio、Basic）标 `merged` 并指向既有 slug
  - [ ] SubTask 2.3: 「亲缘称谓计算器」「QR 码生成器」「Color Code Converter」标 `rejected`，附驳回理由
  - [ ] SubTask 2.4: 股票佣金标 `deferred`（实时行情接入延后），并改为"用户输入费率"模式
  - [ ] SubTask 2.5: 命名规范化：所有"Fund定投""Five Insurances"等中英混排重命名为中文标题 + 英文 slug

- [ ] Task 3: 5 档排期与对照表
  - [ ] SubTask 3.1: 5 档 × 工具数 × 工时 × 起讫日 × 验收标准对照表
  - [ ] SubTask 3.2: 每档工时上限：Tier 1 ≤ 2 周；Tier 2 ≤ 3 周；Tier 3-5 各 ≤ 2 周
  - [ ] SubTask 3.3: 每档上线日 ≤ 启动日（2026-09-19）+ 对应周数
  - [ ] SubTask 3.4: 工具优先级按搜索量 × 转化率 × 开发难度综合打分

## 阶段三：SEO 关键词库（P1）

- [ ] Task 4: 6 类关键词库
  - [ ] SubTask 4.1: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/finance.md`：金融类 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.2: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/health.md`：健康类 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.3: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/renovation.md`：装修类 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.4: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/investment.md`：投资专业 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.5: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/efficiency.md`：效率工具 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.6: 新增 `knowledge-base/04-seo-content/keyword-bank/v2/daily.md`：日常工具 ≥ 30 主词 + 100 长尾
  - [ ] SubTask 4.7: 每个关键词附：搜索量区间、竞争度（低/中/高）、目标页面 slug、内容大纲

## 阶段四：首页与既有工具回写（P1）

- [ ] Task 5: 首页导航重排
  - [ ] SubTask 5.1: 修改 `src/pages/index.astro` 的 categories 数组：6 大类（金融理财 / 健康生活 / 装修家居 / 投资专业 / 效率工具 / 日常工具）
  - [ ] SubTask 5.2: 既有 11 工具按新分类挂载
  - [ ] SubTask 5.3: lead 文案改写为大陆用户口径
  - [ ] SubTask 5.4: description / 标题改写

- [ ] Task 6: 既有 11 工具的合规口径回写（不改逻辑）
  - [ ] SubTask 6.1: 既有 11 个工具的页面 lead 文案去除"海外华人"措辞
  - [ ] SubTask 6.2: 既有 11 个工具的 FAQ 中"GDPR/CCPA"措辞去除
  - [ ] SubTask 6.3: 既有 11 个工具的"相关工具"链接更新到新分类
  - [ ] SubTask 6.4: 单位显示统一为大陆口径（人民币 ¥、公斤 kg、米 m）

## 阶段五：风险矩阵与验收（P0）

- [ ] Task 7: 风险矩阵
  - [ ] SubTask 7.1: 合规风险（YMYL / ICP / 金融信息服务备案）
  - [ ] SubTask 7.2: SEO 风险（关键词堆砌、竞品挤压、百度算法变化）
  - [ ] SubTask 7.3: 运营风险（公式过时、汇率波动、利率调整）
  - [ ] SubTask 7.4: 法律风险（个税公式准确性、利率合规、医疗健康免责声明）
  - [ ] SubTask 7.5: 每项风险含概率、影响、缓解措施、Owner

- [ ] Task 8: 验收与发布计划
  - [ ] SubTask 8.1: 验收清单：定位切换、50 工具裁决、命名规范、5 档排期、关键词库、首页重排、合规回写、风险矩阵
  - [ ] SubTask 8.2: 发布计划：每档上线日的发布 checklist（含草稿标注、免责声明、ICP 备案号占位）
  - [ ] SubTask 8.3: 监控埋点：百度统计 / 友盟 / Sentry 占位
  - [ ] SubTask 8.4: 5 档 change-id 的 spec 草稿与本总规交叉引用

---

# Task Dependencies

- Task 2 依赖 Task 1（定位切换后才能裁决 50 工具的去留）
- Task 3 依赖 Task 2（裁决决定排期）
- Task 4 依赖 Task 2（关键词库按裁决后的分类）
- Task 5 依赖 Task 1（首页文案与定位一致）
- Task 6 依赖 Task 5（既有工具的合规口径回写与首页分类对齐）
- Task 7 与 Task 1-6 并行
- Task 8 依赖 Task 1-7

# 可并行项

- Task 1（合规文档）与 Task 7（风险矩阵）可在不同代理中并行
- Task 4（关键词库）的 6 个子任务可全部并行

# 仍 BLOCKED（来自上游 Goal）

1. 域名
2. 一次性预算、月度运营预算
3. 6 名数字员工能力等级
4. 百度联盟 / 穿山甲 / 360 联盟账户申请状态
5. ICP 备案主体

# 不在本规格范围内

- 50 个工具的实际代码实现（5 份分档 spec 各自负责）
- 既有 11 工具的库函数修改（仅回写合规口径，不改逻辑）
- 域名解析、DNS 配置、Cloudflare Pages 部署（属于上一 Goal 的部署子任务）
