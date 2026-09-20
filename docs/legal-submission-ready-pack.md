---
project: calculator-site
doc_id: docs/legal-submission-ready-pack
type: ready-to-send-checklist
locale: zh-CN
version: v1.0
status: ready
created: 2026-09-20
for: 项目负责人手动发送（AI 不代发）
related: DS-202609-08（双签 P1 / 2026-09-26 截止）
---

# 法务提交流包 · 复制前最后一遍自检

> **使用说明**：本文件是发送前的「一键复制」清单。所有 `[[占位]]` 在本仓库已完成标注，您只需在编辑器中替换为真实值，再将模板 [legal-submission-notice.md](legal-submission-notice.md) 内容复制到您的邮件/飞书工具中。
> **AI 边界**：AI 不代发外部通讯（符合运作铁律第 4 条）；本文档不触发任何邮件、IM 工具、外部 API。

## 一、发送前必做（5 项，耗时 ~3 分钟）

- [ ] **1. 取最新 git hash**：在仓库根目录执行 `git log --oneline -1`
   → 当前 main 最新值：`713613e`（填写前再跑一次确认）
- [ ] **2. 替换邮件正文占位符**：在 [legal-submission-notice.md](legal-submission-notice.md) 第 65 行附近：
   - `[[姓名-必填]]` → 您的真实姓名
   - `[[邮箱-必填]]` → 您的真实邮箱
   - `[[账号-必填]]` → 您的飞书账号
   - `[[git-hash-必填]]` → 第 1 步取到的 hash
- [ ] **3. 确认法务部收件方式**：邮箱地址 / 飞书账号 / 微信（任选一种或多种）
- [ ] **4. 选模板**：A 节（邮件） / B 节（飞书） / 两者并发（推荐）
- [ ] **5. 复制模板正文**：打开编辑器 → 替换占位符 → 全选 → 复制

## 二、推荐发送动作（按场景）

### 场景 1：邮件主送 + 飞书提醒（推荐）

| 步骤 | 操作 |
|---|---|
| 1 | 邮箱客户端新建邮件 |
| 2 | To: 法务部邮箱 / Cc: 项目组 |
| 3 | 主题：`[法务审核] 计算器大全 v0.1.0 上线前合规审查请求（DS-202609-08）` |
| 4 | 粘贴邮件模板 A 节正文 |
| 5 | 添加附件：项目仓库链接 `https://github.com/haogood4/-`（对方可直接读 docs/legal-review-package.md） |
| 6 | 发送 |
| 7 | 在项目飞书群发飞书消息（模板 B 节）+ `@法务部老师` |

### 场景 2：仅飞书

| 步骤 | 操作 |
|---|---|
| 1 | 飞书找到法务对接人/群 |
| 2 | 粘贴飞书模板 B 节 |
| 3 | `@法务部老师 麻烦评估` |
| 4 | 发送 |

### 场景 3：仅邮件

跳过飞书，直接走流程 1 的 1-6 步。

## 三、发送后立即回填（耗时 ~2 分钟）

| 操作 | 命令/位置 |
|---|---|
| 1 | 在 [docs/policy-verifications/dual-sign-todo.md](policy-verifications/dual-sign-todo.md) 变更记录区追加一行：日期 / 操作人 / 简述（"转发至法务部邮箱 xx@xxx.com"） |
| 2 | 同步 CSV（同提交） |
| 3 | 记录「D+0」标记到该文件的 C 节「提交回执登记表」 |
| 4 | 如需微信同步，发简短消息："法务已转，DS-202609-08，请关注 9-26 截止" |

## 四、跟进 SOP（按日）

| 日期 | 动作 |
|---|---|
| **D+0**（今天 / 2026-09-20） | 本清单完成 |
| **D+1**（明天） | 检查法务是否已读/已回复；无回复则**不催**（给法务至少 2 工作日静默期） |
| **D+3**（2026-09-23 周二） | 项目组礼貌询问："请问 DS-202609-08 是否有初步反馈？" |
| **D+5**（2026-09-25 周四） | 二次跟进 |
| **D+6**（2026-09-26 周五） | **截止日**。若仍无反馈：状态列追加 🕐，提级项目负责人决策是否延期或带其他条款上线 |
| **反馈到来** | 在资料包 §7 补签字日期；在 dual-sign-todo 流转状态；通知 AI 同步 CHANGELOG |

## 五、回滚预案（若法务反馈「需保留 noindex」或「需修改条款」）

```bash
# 1. 恢复 5 文件（备份在 .tmp-legal-backup/，gitignore 已加）
cp -r .tmp-legal-backup/* .

# 2. 立即跑 verify
PATH=/usr/bin:$PATH /usr/bin/pnpm verify:dist

# 3. 提交 + 推送
git add -A
git commit -m "revert(M-01): 法务要求保留 noindex / 修改条款（commit ${原hash} 回滚）"
git push origin main

# 4. 同步登记
# 在 dual-sign-todo.md 变更记录追加回滚行 + DS-202609-08 状态 → 退回重核
```

## 六、参考链接（发送时如需提供）

| 资料 | 链接 |
|---|---|
| 仓库主页 | https://github.com/haogood4/- |
| 资料包 | 仓库内 `docs/legal-review-package.md`（或 GitHub URL 直链） |
| 三页草稿 | 仓库内 `src/pages/legal/{privacy,terms,disclaimer}.astro` |
| 双签机制 | 仓库内 `docs/policy-verifications/dual-sign-todo.md` |
| AI 提交通知 | 仓库内 `docs/legal-submission-notice.md` |
| 本清单 | 仓库内 `docs/legal-submission-ready-pack.md` |

## 七、绝对禁止（AI 边界）

- ❌ AI 不替您发送邮件/飞书/微信
- ❌ AI 不填写法务部真实邮箱/联系人
- ❌ AI 不擅自把法务回复登记为「通过」（必须您看到书面/邮件回复后再告诉我）

## 八、您完成后告诉我

- 发送时间（精确到小时，用于 D+1 计时起点）
- 收件方式（邮箱/飞书/微信）
- 法务部回执编号（如有）

我会同步到 dual-sign-todo 与 CHANGELOG。