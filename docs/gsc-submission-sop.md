---
project: calculator-site
doc_id: docs/gsc-submission-sop
type: sop
locale: zh-CN
version: v1.0
status: ready-for-execution
created: 2026-09-20
prerequisites: M-03 域名就绪 + M-04 CF Pages 已部署
for: 项目负责人手动执行
---

# GSC（Google Search Console）提交 SOP

> 用途：站点部署完成后，向 Google Search Console 添加属性并提交 sitemap，加速收录。
> **执行主体**：项目负责人手动操作（AI 不代持 Google 账号）。
> **前提**：①域名已注册并解析到 Cloudflare Pages；②站点可通过 HTTPS 访问；③sitemap.xml 已生成（部署后位于 `https://你的域名/sitemap-index.xml`）。

## 一、添加 GSC 属性（5 分钟）

### 步骤 1：进入 GSC
- 访问 https://search.google.com/search-console/
- 用项目 Google 账号登录（建议专用账号，非个人）

### 步骤 2：添加资源
- 点击左上角「添加资源」
- 选择「网址前缀」类型（推荐，便于域名所有权校验多方式）
- 输入：`https://jisuanqi.cn`（或您的实际域名）
- 点击「继续」

### 步骤 3：验证所有权（推荐 DNS TXT 方式）
- 推荐方式：**DNS 记录**
  - GSC 会给出 TXT 记录：例如 `google-site-verification=xxxxxxxxxxxxxxxxxxxx`
  - 在 Cloudflare DNS 添加：
    - 类型：`TXT`
    - 名称：`@`
    - 内容：上述 verification 值
  - 回到 GSC 点击「验证」→ 通常 1–5 分钟通过

### 步骤 4（备选）：HTML 文件方式
- GSC 提供 `google<id>.html` 文件
- 下载放到 `public/` → 重新部署 → 验证

## 二、提交 sitemap（2 分钟）

### 步骤 1：定位 sitemap URL
- 部署成功后访问 `https://jisuanqi.cn/sitemap-index.xml`
- 应返回 XML，含若干 sitemap 链接（如 `https://jisuanqi.cn/sitemap-0.xml`）

### 步骤 2：提交主 sitemap
- GSC 左侧菜单 → 「站点地图」
- 输入框填写 `sitemap-index.xml`
- 点击「提交」
- 状态显示「已成功」即完成

### 步骤 3（推荐）：提交子 sitemap
- 如果 `sitemap-index.xml` 引入了多个子 sitemap，GSC 通常会自动发现
- 也可手动逐个提交：`sitemap-0.xml`、`sitemap-1.xml`（如有）

## 三、关键 URL 检查（部署后立即，5 分钟）

| 检查项 | URL | 期望 |
|---|---|---|
| 首页 | `https://jisuanqi.cn/` | 200，HTML 含「计算器大全」标题 |
| 一个计算器 | `https://jisuanqi.cn/finance/mortgage-cn/` | 200，含计算器 UI |
| sitemap | `https://jisuanqi.cn/sitemap-index.xml` | XML 含 70+ 条 URL |
| robots | `https://jisuanqi.cn/robots.txt` | 含 `Sitemap: https://jisuanqi.cn/sitemap-index.xml` |
| manifest | `https://jisuanqi.cn/manifest.json` | JSON，name/short_name/icons |
| RSS | `https://jisuanqi.cn/rss.xml` | XML，11 条文章 |

## 四、百度站长平台同步（强烈推荐大陆流量）

> 国内 SEO 主要靠百度，需同步提交百度站长平台。

### 步骤 1：访问 https://ziyuan.baidu.com/
- 用百度账号登录（建议专用）

### 步骤 2：添加站点
- 「站点管理」→「添加网站」→ 输入 `https://jisuanqi.cn`
- 验证方式：DNS TXT（与 GSC 类似）

### 步骤 3：提交 sitemap
- 「数据管理」→「sitemap」→「添加新数据」→ `https://jisuanqi.cn/sitemap-index.xml`

### 步骤 4：链接提交
- 「链接提交」→「主动推送」/「sitemap」/「手工提交」（任选一种）

## 五、收录观察（持续）

| 阶段 | 时间 | 关注指标 |
|---|---|---|
| 1 | D+1 | GSC「覆盖率」显示已编入索引 |
| 2 | D+3 | 开始出现搜索查询（impressions） |
| 3 | D+7 | 关键词开始有排名 |
| 4 | D+30 | 长尾关键词出量 |

## 七、回滚预案

若 GSC/百度提交后发现严重 SEO 问题（404 死链、违规内容、canonical 错乱）：
1. 立即从 GSC「移除」面板申请临时移除（最多 90 天）
2. 修复站点后重新部署
3. 在 GSC「重新审核」提交复审请求
4. 重大事件：通过 [docs/manual-pending-items.md](manual-pending-items.md) 记录决策

## 八、AI 边界声明

- ❌ AI 不登录/不持有 Google 账号
- ❌ AI 不代您操作 GSC 面板
- ❌ AI 不擅自提交关键 URL（含隐藏/索引指令）
- ✅ AI 准备：sitemap 模板、机器人指令、canonical 检查清单

## 九、参考链接

- [GSC 帮助中心](https://support.google.com/webmasters/)
- [百度站长平台帮助](https://ziyuan.baidu.com/help/)
- [Cloudflare Pages 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)