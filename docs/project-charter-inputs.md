---
project: calculator-site
doc_id: docs/project-charter-inputs
type: sop
domain: governance
locale: zh-CN
version: v1.0.0
status: draft
effective_from: 2025-01-01
owner: 项目经理（你）
last_updated: 2025-01-01
---

## 如何使用本文档

本文档是项目经理（PM）推进计算器网站项目所需的输入表，共 8 项关键决策。PM 需在每节"当前值"位置填写最终决定，未填写的字段默认按 AI 推荐值执行；为保证风险可控，代码层与广告脚本相关下游任务在缺失必要输入时保持 BLOCKED 状态，等待 PM 补齐。

---

## 1. 目标市场

- **决策项**：目标市场
- **说明**：明确产品主要面向的地理与语言用户群体，决定文案、UI 语言、合规要求与本地化策略。
- **影响范围**：
  - 前端文案与界面语言（zh-CN / en-US）
  - 货币符号与单位显示
  - 法律合规（隐私政策、备案）
  - SEO 与关键词策略
  - 客服与文档语言
- **当前值**：**大陆中文用户**（**已批准事实**，2026-09-19）。合规口径按 PIPL + 银保监会 + 国税总局要求执行；金融/税务/健康类工具接受"草案/参考"标注上线，不要求外部专业审核。来源：`.trae/specs/strategy-50-calculators/spec.md`。
- **AI 推荐默认值（含理由）**：同上已批准事实。原推荐理由仍适用：团队工作语言为中文，预算以人民币计量且无跨境支付通道准备，最小化合规与翻译成本。

**BLOCKED: false**

---

## 2. 一次性预算上限

- **决策项**：一次性预算上限
- **说明**：用于一次性投入的预算上限，例如域名、服务器、设计资产、外包等。
- **影响范围**：
  - 域名与服务器采购档位
  - 设计外包或素材库订阅
  - 第三方 SaaS 工具采购
  - 法律咨询与备案费用
- **未填后果**：任何对外采购动作 BLOCKED，remediate-foundation 中所有 Procurement SubTask 无法放行。
- **AI 推荐默认值（含理由）**：**¥5,000**。覆盖 1 年域名 + 基础云资源 + 一次性素材，足以支撑 MVP；超出部分需走变更审批。

**BLOCKED: true**

---

## 3. 月度运营预算上限

- **决策项**：月度运营预算上限
- **说明**：每月可消耗的运营成本上限，含云资源、广告投放、第三方订阅等持续性支出。
- **影响范围**：
  - 云资源套餐选择
  - 广告投放日预算与渠道
  - 第三方监控/分析工具订阅
  - 内容更新与外链维护
- **未填后果**：广告与持续性订阅 BLOCKED，docs-and-team-setup 中的运营 SOP 无法固化。
- **AI 推荐默认值（含理由）**：**¥500**。用于基础云资源 + 小额测试投放；超出需逐月审批，控制初期烧钱风险。

**BLOCKED: true**

---

## 4. 启动日

- **决策项**：启动日
- **说明**：项目正式启动日期，作为排期基线与里程碑零点。
- **影响范围**：
  - 整体项目排期与甘特图
  - 团队 Onboarding 计划
  - 里程碑 KPI 计算起点
  - 法务/合同生效日
- **未填后果**：排期与里程碑全部 BLOCKED，remediate-foundation 中 Schedule SubTask 不可提交。
- **AI 推荐默认值（含理由）**：**等你提供**。启动日需 PM 结合资源到位情况决策，AI 无法代替商业判断。

**BLOCKED: true**

---

## 5. 最晚上线日

- **决策项**：最晚上线日
- **说明**：业务可接受的最新上线日期，用于倒推各阶段交付时间。
- **影响范围**：
  - 各阶段截止日期倒推
  - 资源与人力调度上限
  - 风险评估的"硬截止"基线
  - 推广与广告投放节奏
- **未填后果**：上线倒推计划 BLOCKED，docs-and-team-setup 中的里程碑对齐无法完成。
- **AI 推荐默认值（含理由）**：**等你提供**。最晚上线日取决于业务窗口（如开学季、报税季等），必须由 PM 输入。

**BLOCKED: true**

---

## 6. 广告平台账户状态

- **决策项**：广告平台账户状态
- **说明**：百度广告、巨量引擎等广告平台的账户开通与充值情况。
- **影响范围**：
  - 广告投放脚本与对接
  - 落地页与转化追踪
  - 充值与对账流程
  - 合规与资质提交
- **未填后果**：广告脚本、对接与充值流程全部 BLOCKED，remediate-foundation 中 Ads SubTask 阻塞。
- **AI 推荐默认值（含理由）**：**未开通**。MVP 阶段优先验证产品与自然流量，避免过早消耗预算与精力。

**BLOCKED: true**

---

## 7. 6 名员工实际能力

- **决策项**：6 名员工实际能力
- **说明**：对 6 名团队成员在研发、设计、运营、测试、内容、外包等维度上的实际能力评级（高/中/低）。
- **影响范围**：
  - 任务分配与 RACI 矩阵
  - 培训与补强计划
  - 内部培养 vs 外包决策
  - 招聘优先级
- **未填后果**：任务分配与培训计划无法落地，docs-and-team-setup 中 Team SubTask 阻塞。
- **AI 推荐默认值（含理由）**：**均为"中"**。在没有真实评估数据时以中性假设起步，避免误派高难度任务导致风险。

**BLOCKED: true**

---

## 8. 是否引入外部专业审核

- **决策项**：是否引入外部专业审核
- **说明**：是否在关键交付物（合规、法律、安全、内容）上引入外部第三方审核。
- **影响范围**：
  - 合规与法律风险兜底
  - 安全/隐私审核流程
  - 内容质量与品牌审核
  - 一次性预算消耗
- **未填后果**：外部审核合同与对接 BLOCKED，remediate-foundation 中 Review SubTask 阻塞。
- **AI 推荐默认值（含理由）**：**暂不**。MVP 阶段以内部审核为主，待流量与合规风险上升后再评估；节省预算与时间。

**BLOCKED: true**

---

## 汇总 BLOCKED 项

以下项目当前为 BLOCKED 状态，需 PM 填写后方可解除并推进对应下游任务：

1. **目标市场** —— 阻塞：`remediate-foundation` 的 Localization SubTask（Task 1.x）；`docs-and-team-setup` 的 Copywriting SubTask（SubTask 3.2）。
2. **一次性预算上限** —— 阻塞：`remediate-foundation` 的 Procurement SubTask（Task 2.x）；`docs-and-team-setup` 的 Budget SOP SubTask（SubTask 4.1）。
3. **月度运营预算上限** —— 阻塞：`remediate-foundation` 的 Procurement SubTask（Task 2.3 持续项）；`docs-and-team-setup` 的 Ops SOP SubTask（SubTask 4.2）。
4. **启动日** —— 阻塞：`remediate-foundation` 的 Schedule SubTask（Task 5.x）；`docs-and-team-setup` 的 Milestone SubTask（SubTask 5.1）。
5. **最晚上线日** —— 阻塞：`remediate-foundation` 的 Schedule SubTask（Task 5.2）；`docs-and-team-setup` 的 Milestone SubTask（SubTask 5.2）。
6. **广告平台账户状态** —— 阻塞：`remediate-foundation` 的 Ads SubTask（Task 6.x）；`docs-and-team-setup` 的 Growth SOP SubTask（SubTask 6.1）。
7. **6 名员工实际能力** —— 阻塞：`remediate-foundation` 的 Team SubTask（Task 7.x）；`docs-and-team-setup` 的 RACI SubTask（SubTask 7.1）。
8. **是否引入外部专业审核** —— 阻塞：`remediate-foundation` 的 Review SubTask（Task 8.x）；`docs-and-team-setup` 的 Compliance SubTask（SubTask 8.1）。