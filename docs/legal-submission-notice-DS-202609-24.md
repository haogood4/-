---
project: calculator-site
doc_id: docs/legal-submission-notice-DS-202609-24
type: submission-notice-template
locale: zh-CN
version: v1.0
status: ready
created: 2026-09-21
for: 项目负责人手动发送（AI 不代发）
related: DS-202609-24（双签 P1 / 2026-10-05 截止）
---

# 法务提交通知（DS-202609-24）— 工具页面法律风险加固报告 v1.1

> 提交命令提交时间：2026-09-21
> 关联：[docs/legal-review/legal-hardening-report-20260921.md](./legal-review/legal-hardening-report-20260921.md) v1.1（374 行 / 16 章节）
> 关联：[docs/policy-verifications/dual-sign-todo.md](./policy-verifications/dual-sign-todo.md) § DS-202609-24
> 提交命令状态：仓库内已落 1 个样式 + 18 个页面提示块；astro build 2.87s / 160 页面产物通过

---

## A. 邮件模板（建议 To：法务部 / Cc：项目组）

### 主题
`[法务审核] 工具页面法律风险加固报告 v1.1 — 18 页面 YMYL/合规提示归档（DS-202609-24）`

### 正文

```
法务部 您好，

继 2026-09-20 提交的 DS-202609-08（P1-10 legal 三页法务审核）之后，
项目组已完成「工具页面法律风险加固报告 v1.1」，现提交措辞合规性审核材料，
请按以下要点审阅并反馈结论。

一、待审材料
  1. 加固报告（v1.1）：
        docs/legal-review/legal-hardening-report-20260921.md
        - 一页式摘要（18 页面 / 5 个加固批次 / 100% 覆盖）
        - 4 个法律页面红框强化（laiw / comp / injury / traffic）
        - 4 个工具/隐私页面使用须知（抽卡 / 证件照 / 图片水印 / 语音转文字）
        - 6 个 PDF 工具统一提示（compress / merge / split / to-image / extract-text / watermark）
        - 3 个 P3 低风险工具（pinyin / qr-code / sensitive-word）
        - 1 个 P1 最高风险工具（phone-region：红框 + 数据时效声明）
        - 加固后地图 + 风险矩阵 + 维护节点 + 验收清单
  2. 加固改动文件（1 样式 + 18 页面）：
        src/styles/global.css                                              （+14 行 / 新增 .ymyl-notice--danger）
        src/pages/finance/{lawsuit-fee,compensation,injury,traffic}-cn.astro
        src/pages/efficiency/{game-gacha,image-idphoto,image-watermark,ai-stt}-cn.astro
        src/pages/efficiency/pdf-{compress,merge,split,to-image,extract-text,watermark}-cn.astro
        src/pages/efficiency/{pinyin,qr-code,sensitive-word,phone-region}-cn.astro
  3. 双签机制登记（已同步）：
        docs/policy-verifications/dual-sign-todo.md § DS-202609-24
        docs/policy-verifications/dual-sign-todo.csv（机器可读镜像）
        → 首签：项目负责人；二签/终签：法务
        → P1 优先级 / 2026-10-05 截止

二、特别关注（建议重点审阅）
  - 报告 §1.1 加固后地图：声称 100% 覆盖（18 已加固 + 126 已评估无需加固），
    需复核「工具页面但风险极低」13 个分类是否真的无需加固
  - 报告 §10~§13 三批次加固措辞是否覆盖全部必要合规要素
  - 报告 §12 phone-region 红框措辞（最激进的一处，含 10086/10010/10000 三个权威查询电话）
  - 报告 §13 覆盖度声明与产品实际情况是否一致

三、本次提交性质
  - 性质：内容补丁归档（不是政策资讯核对）
  - 与 DS-202609-08 的差异：DS-202609-08 是「事实核对」（隐私/用户协议/免责声明条款），
    DS-202609-24 是「措辞合规性复核」（YMYL/合规提示文字）
  - 计算逻辑未改动：所有公式、JSON-LD、FAQ 数据、SEO meta、交互脚本均未触碰

四、建议流程
  1. 法务初审（加固报告 + 18 页面产物）：建议 10 工作日（按 P1 优先级）
  2. 法务反馈 → 项目组修订措辞（≤2 轮）
  3. 法务签字 → 项目组流转 DS-202609-24 状态至「通过」→ 归档完成

五、关键风险点（法务可重点审阅）
  | 风险点 | 加固页面 | 关键措辞 |
  |--------|----------|----------|
  | "未经许可提供法律意见" | 4 法律页 | "不构成法律意见" + 权威判定主体差异化 |
  | 商标侵权（游戏名） | game-gacha | "描述性引用" 抗辩句 |
  | 数据时效误导 | game-gacha / phone-region | "截至 2026-09" / "已严重过期" |
  | 敏感个人信息违规 | image-idphoto | "仅上传本人证件照" |
  | 著作权协助侵权 | 6 PDF + image-watermark | "勿处理他人 PDF / 图片" |
  | 偷录他人对话 | ai-stt | "仅录自己声音或已获同意" |
  | 工具被滥用 | qr-code | "不为扫码后落地行为承担责任" |

六、联系人
  项目负责人：**王彦锋**    邮箱：**wyfwyf077@163.com**    飞书：**650196**
  AI Agent 提交编号：TraeCode AI Agent / commit **`55d3d5c`**（最终值，本会话已 commit 并 push 到 origin/main）

> 📌 **已替换为最终 hash `55d3d5c`**（feat(legal): 工具页面法律风险加固报告 v1.1 主 commit）。本 hash 已 commit 并 push 到 origin/main。法务可直接在 GitHub 上查看完整代码改动。

七、附：残余风险待 PM 决策（不影响本次法务复核，可另起流程）
  - phone-region 号段库版本 2302（2023-02），距今已 3.5 年，提示已加固为最高级（红框），
    但**真正解决需要更新数据源**，建议 PM 同步立项

期待您的反馈。

项目组
2026-09-21
```

---

## B. 飞书消息模板（适用于群通知 / 一对一）

```
@法务部老师 麻烦评估

【工具页面法律风险加固报告 v1.1 · 18 页面措辞复核】
📎 加固报告：docs/legal-review/legal-hardening-report-20260921.md（v1.1 / 374 行）
📎 改动文件：1 样式 + 18 页面提示块（已 commit）
📋 双签号：DS-202609-24
⏰ 建议反馈：2026-10-05（10 工作日）
⚠️ 重点关注：报告 §1.1 覆盖度声明 / §10~§13 三批次措辞 / §12 phone-region 红框措辞

性质：内容补丁归档（不是政策核对）
计算逻辑 / JSON-LD / FAQ / SEO / 交互脚本：均未改动

有问题随时群里 @ 我，谢谢！
```

---

## C. 提交回执登记表

| 项 | 内容 |
|----|------|
| 提交时间 | 2026-09-21（AI Agent 自动产出 + 项目负责人确认转发） |
| 提交方式 | 待定（邮件 / 飞书 / 微信） |
| 回执收件 | 待法务反馈（建议 2026-10-05 前） |
| 资料 git 提交 | **`55d3d5c`**（feat(legal): 工具页面法律风险加固报告 v1.1 — 23 files / +681 / -9；本会话已 push 到 origin/main） |
| 仓库路径 | 本仓库 `/docs/legal-review/legal-hardening-report-20260921.md` |
| 关联 DS | DS-202609-24（已同步登记 dual-sign-todo.md 与 .csv） |

---

## D. 跟进 SOP

1. **D+0（2026-09-21）**：项目负责人转发本通知，登记回执编号（由法务部提供）
2. **D+1（2026-09-22）**：项目组同步回执到 dual-sign-todo DS-202609-24 状态列
3. **D+5（2026-09-26）**：项目组礼貌提醒法务（仅当无反馈）
4. **D+10（2026-10-01 国庆假期前）**：假前最后一次跟进
5. **D+14（2026-10-05）**：截止日；若仍无反馈，状态追加 🕐 并提级项目负责人
6. **收到反馈后**：法务在加固报告 §8 验收清单签字；项目组流转 DS-202609-24 至「通过」；登 CHANGELOG
7. **签字通过后**：若法务要求修改措辞，撤回提示块文案后重新提交；若法务要求下架某些提示，转入「退回重核」流程

---

## E. 邮件 / 飞书发送前自检清单

- [ ] 法务部邮箱 / 飞书账号已确认
- [ ] 项目负责人姓名 / 联系方式已填入正文
- [ ] 加固报告 git 提交 hash 已确认（`git log --oneline -1`）
- [ ] dual-sign-todo.md / .csv 状态列已同步为"已提交"
- [ ] CHANGELOG Unreleased 已记录提交动作
- [ ] 与 DS-202609-08 是否合并发送（建议分开发送，便于法务分别登记）

---

## F. 与 DS-202609-08 的关键差异

| 维度 | DS-202609-08（P1-10 legal 三页） | DS-202609-24（工具页面加固 v1.1） |
|------|--------------------------------|----------------------------------|
| 性质 | 政策资讯事实核对 | 内容补丁归档 |
| 对象 | 3 个法律页面（privacy / terms / disclaimer） | 18 个工具页面 + 1 个样式 |
| 复核重点 | 条款是否合规 | 措辞是否覆盖合规要素 |
| 第一签 | 项目负责人 | 项目负责人 |
| 第二签 | 法务 | 法务 |
| 截止 | 2026-09-26 | 2026-10-05 |
| 已落地生产？ | 是（2026-09-20 提前切换） | **是**（加固本身已 commit 到 main） |
| 回滚难度 | 高（5 文件备份 `.tmp-legal-backup/`） | 低（仅 HTML 输出，不影响逻辑） |

**回滚预案**（若法务要求修改措辞）：
```bash
# 1. 修改对应 src/pages/**/*.astro 中的 ymyl-notice 块
# 2. 重新构建
node node_modules/astro/bin/astro.mjs build
# 3. 提交 + 推送
git add -A
git commit -m "fix(legal): 法务复核调整 DS-202609-24 措辞"
git push origin main
# 4. 同步登记：dual-sign-todo.md 变更记录追加 + DS-202609-24 状态流转
```

---

## G. 关联文件快速跳转

| 资料 | 路径 |
|------|------|
| 加固报告（主件） | `docs/legal-review/legal-hardening-report-20260921.md` |
| 双签清单（md 主表） | `docs/policy-verifications/dual-sign-todo.md` |
| 双签清单（CSV 镜像） | `docs/policy-verifications/dual-sign-todo.csv` |
| 法务资料包（背景） | `docs/legal-review-package.md` |
| 上次提交通知（DS-202609-08） | `docs/legal-submission-notice.md` |
| 上次 ready-pack | `docs/legal-submission-ready-pack.md` |
| 加固改动样式 | `src/styles/global.css`（+ 14 行） |
| 加固改动页面 | 18 个 `src/pages/**/*.astro`（详见报告 §9.1 + §9.1.1） |

---

**提示**：本通知模板仅含内容；具体邮件发送 / 飞书@人 / 微信对话需项目负责人
手动操作（AI 不代发外部通讯，符合运作铁律第 4 条）。
