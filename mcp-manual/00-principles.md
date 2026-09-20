---
project: calculator-site
doc_id: mcp/principles
type: sop
domain: mcp
locale: zh-CN
version: v1.0.0
status: human-verified
effective_from: 2025-01-01
owner: 技术负责人 + PM
last_updated: 2025-01-01
---

> **权限说明**：配置中的 `tier` 字段（P0/P1/P2）仅为团队优先级约定，不构成任何技术管控。真实权限管控依赖 MCP 服务端令牌作用域（token scopes）与仓库分支保护规则。

# MCP 总原则（给 AI 项目经理）

## 1. 先知识库，后 MCP

任何决策前，先读 `knowledge-base/`；MCP 只用于"读实时数据"或"执行已批准的写操作"。

## 2. 三级权限

| 等级 | AI 行为 |
|---|---|
| `read` | 直接调用 |
| `propose` | 生成草稿，等待人类确认 |
| `approve` | 触发审批流；绝不自动批准自己 |

## 3. 所有写操作必须留痕

写操作必须进入 `mcp-audit.log`：

```
[2025-01-15T10:23:11Z] actor=AI mcp=linear tool=create_issue_draft status=draft_id=DRAFT-001
[2025-01-15T10:25:32Z] actor=human(alice) approved=true target=DRAFT-001
```

## 4. 黑名单（任何情况都不允许）

- 直接修改生产数据库
- 合并到 main / 触发 release workflow
- 修改税务/健康/金融类公式或文案
- 关闭 / 删除 Sentry issue 凭 AI 自行决定
- 发送外部邮件 / 公告
- 修改广告位 / 商业化配置

## 5. 速率与超时

- 默认每分钟 ≤ 30 次（Playwright ≤ 10）。
- 默认超时 15s；超时即放弃 + 重试 ≤ 2 次。

## 6. 失败处理

- 任何 MCP 调用失败必须：
  - 记录到 `mcp-audit.log`；
  - 在周报中体现；
  - 必要时触发 `incident-response` 工作流。

## 7. 隐私

- 不上传用户输入值（如贷款金额、身高、出生日期）。
- 不读取 / 输出任何 API Key / 用户敏感数据。
- 所有公共输出前自动脱敏。

---