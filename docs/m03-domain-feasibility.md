---
project: calculator-site
doc_id: docs/m03-domain-feasibility
type: feasibility-analysis
locale: zh-CN
version: v1.0
status: ready-for-review
created: 2026-09-20
owner: 项目经理（决策由项目负责人）
related: M-03 / M-04
---

# M-03 域名可行性分析（2026-09-20）

## 一、结论先行

推荐 **3 套候选**，按优先级：

| 优选 | 域名（含 www + apex） | 后缀 | 适配场景 | 预估年成本 |
|---|---|---|---|---|
| 🥇 **首选** | `jisuanqi.cn` + `www.jisuanqi.cn` | .cn | 中文 SEO 偏好、国内访问快、纯静态站无需 ICP（解析至 CF 境外节点） | ¥35–80/年 |
| 🥈 次选 | `calculator.tools` + `tools.cn`（双备）| .tools / .cn | 国际用户工具站属性强 | ¥60–120/年 |
| 🥉 三选 | `calc-cn.com` + `www.calc-cn.com` | .com | 国际通用、品牌词简短 | ¥70–100/年 |

**核心建议**：
- 站点是**纯静态站 + Cloudflare Pages 全球节点**，**不强制 ICP 备案**（仅当解析到大陆服务器时才需要；CF 全球节点对大陆访问走香港/海外边缘）
- 大陆用户访问体验关键在「DNS 国内解析质量」+「CDN 边缘节点」，域名后缀次要
- **首选 .cn 后缀**：百度信任偏好 + 国内解析节点 + 续费便宜 + 注册门槛（实名）一次性投入
- **避免**：.top/.xyz/.vip 等小众后缀（沙盒期长、风控严）[来源](https://tname.cn/article/inside/?id=46)

## 二、域名后缀对比矩阵（基于 2026-09 资料）

| 后缀 | 注册门槛 | 续费/年 | 国内速度 | 百度信任 | 沙盒期 | 适合本项目 |
|---|---|---|---|---|---|---|
| **.cn** | 实名（身份证/营业执照） | ¥30–80 | ⭐⭐⭐ 最快 | ⭐⭐⭐ 偏好 | 短 | ✅ 首选 |
| **.com** | 无 | ¥70–100 | ⭐⭐ 良好 | ⭐⭐ 通用 | 短 | ✅ 国际品牌备选 |
| **.net** | 无 | ¥70–100 | ⭐⭐ 良好 | ⭐⭐ 通用 | 短 | ⚠️ 备选 |
| **.tools** | 无 | ¥80–150 | ⭐⭐ 良好 | ⭐ 无加成 | 中 | ✅ 工具站属性强 |
| **.top** | 无 | ¥30–40 | ⭐⭐ 良好 | ⚠️ 沙盒长 | **长** | ❌ 不推荐 |
| **.xyz** | 无 | ¥20–60 | ⭐⭐ 良好 | ⚠️ 沙盒长 | **长** | ❌ 不推荐 |
| **.site** | 无 | ¥30–50 | ⭐⭐ 良好 | ⚠️ 沙盒长 | **长** | ❌ 不推荐 |

**判断依据**：搜索引擎（Google/Baidu）对 gTLD 一视同仁，无直接加分；后缀主要影响用户信任与 CTR（间接 SEO）[来源 1](https://vikilinks.com.au/domain-extensions-seo-rankings) [来源 2](https://hashedomains.com/does-domain-name-affect-seo/)。.cn 因 ccTLD 地理信号对百度有偏好加成 [来源 3](https://tname.cn/article/inside/?id=46)。

## 三、候选域名清单（15 个 + 评估）

> 评估维度：①字符数（≤8 易记）②行业属性（计算器/工具）③品牌可保护性（可申请同名主流后缀）④注册可行性（未注册或低权重可买）

| # | 候选 | 后缀 | 可行性 | 备注 |
|---|---|---|---|---|
| 1 | `jisuanqi.cn` | .cn | 高 | 计算器拼音，最直白 |
| 2 | `jisuanqi.com` | .com | 中 | 可能被占，可能需二级市场购 |
| 3 | `jisuanqidaquan.cn` | .cn | 高 | 「计算器大全」全拼 |
| 4 | `jisuanqi.tools` | .tools | 高 | 工具站属性 |
| 5 | `calc.tools` | .tools | 中 | 国际短词，可能溢价 |
| 6 | `cncalc.com` | .com | 中 | 缩写 + 区域 |
| 7 | `calc-cn.com` | .com | 高 | 区域属性 |
| 8 | `tools.cn` | .cn | 极高/溢价 | 可能天价，但 SEO 强 |
| 9 | `online-calc.cn` | .cn | 高 | 长尾精准 |
| 10 | `suanshu.cn` | .cn | 中 | 「算术」拼音短 |
| 11 | `calcsu.cn` | .cn | 高 | 自造短词 |
| 12 | `quickcalc.cn` | .cn | 高 | 国际化 |
| 13 | `mycalc.com.cn` | .com.cn | 高 | 二级，信任中等 |
| 14 | `jisuan.com` | .com | 中 | 短但可能被占 |
| 15 | `tools-cn.com` | .com | 高 | 区域 + 工具 |

**建议主选 `jisuanqi.cn`**，理由：①直白可记忆 ②.cn 后缀百度偏好 ③低注册成本 ④可同时申请 `jisuanqi.com.cn` 与 `jisuanqi.com` 做品牌保护。

## 四、Cloudflare 接入路径（2 选 1）

### 路径 A：全球节点（推荐本期）
- 域名注册商：阿里云 / 腾讯云 / Cloudflare Registrar
- DNS 解析：域名 NS 指向 Cloudflare
- 部署目标：**Cloudflare Pages（全球）**
- ICP 备案：**无需**（不解析到大陆服务器）
- 大陆访问：经香港/海外边缘，速度中等（200–500ms）
- 适合：**MVP 验证、SEO 起步、不急于打开速度**

### 路径 B：中国网络（后期优化）
- 域名注册商：同上
- DNS：Cloudflare
- 部署目标：Cloudflare China Network（**Enterprise 套餐 + JD Cloud 审核**）
- ICP 备案：**需要**（4–8 周）
- 大陆访问：境内 CDN 节点，速度优（<100ms）
- 适合：**流量起来后、商业化前**

**决策建议**：**本期走路径 A**。等大陆自然流量起来（预估 3–6 个月）后再评估是否升级到路径 B，避免企业套餐年费（$5,000+/月起）与 ICP 备案周期阻塞。

## 五、上线前必做（DAG 顺序）

```
D+0 (今天)    项目负责人：选定候选域名（如 jisuanqi.cn）
              ↓
D+1           域名注册（实名认证，需身份证/营业执照；约 1 小时通过）
              ↓
D+2           Cloudflare 添加站点 → 修改 NS 服务器
              ↓
D+3 (DNS 生效) wrangler login → 首次 `pnpm deploy`
              ↓
D+3           GSC 添加属性 + 提交 sitemap
              ↓
D+5~30        收录爬取期（百度/Google）
```

## 六、风险登记

| ID | 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|---|
| M-03-R1 | 注册域名被占（短词主流后缀） | 高 | 中 | 准备 ≥3 备选；二手市场评估 ≤¥2,000 |
| M-03-R2 | .cn 实名审核驳回（个人/企业资质不全） | 中 | 中 | 个人备案需身份证；企业备案需营业执照；提前 1 天准备 |
| M-03-R3 | NS 切换后 DNS 解析未全球生效 | 低 | 低 | TTL 默认 5 分钟；最长 24–48 小时 |
| M-03-R4 | 大陆访问速度不达标 | 中 | 中 | 本期可接受（路径 A）；若达标压力上升则升级路径 B |
| M-03-R5 | 域名被墙（GFW） | 极低 | 高 | 静态站无敏感内容；纯工具站被墙概率近零 |
| M-03-R6 | Cloudflare Pages 项目名冲突 | 极低 | 低 | 备选名 `calculator-site-cn` / `calc-quan` |

## 七、决策点（需您确认）

请在以下选项中明确：

| 问题 | 选项 |
|---|---|
| Q1：主选后缀？ | A) **.cn 首选** / B) .com 首选 / C) .tools 首选 |
| Q2：主域名字符？ | A) 拼音（`jisuanqi*`）/ B) 英文（`calc*`）/ C) 自造词 |
| Q3：注册主体？ | A) 个人（身份证）/ B) 企业（营业执照）|
| Q4：路径选择？ | A) **全球节点（本期）** / B) 中国网络（需企业套餐 + ICP）|

## 八、后续 AI 可立即做（不动用您资源）

- 选定域名后，**草拟 `pnpm deploy` 完整命令**与 `PUBLIC_SITE_URL` 注入模板
- 准备 `wrangler.toml` / `wrangler pages deploy` 配置
- 起草 GSC 属性添加与 sitemap 提交脚本（含凭据占位）
- 准备 ICP 备案资料清单（如未来选路径 B）

## 十、参考来源

- [Cloudflare China Network: Get started](https://developers.cloudflare.com/china-network/get-started/index.md)
- [Cloudflare: ICP 概念](https://developers.cloudflare.com/china-network/concepts/icp/)
- [阿里云/腾讯云 ICP 备案指引](https://icp.nic.edu.cn/ICP%E5%A4%87%E6%A1%88%E6%8C%87%E5%8D%97.html)
- [腾讯云: 公安联网备案](https://cloud.tencent.com/document/product/243/19142)
- [域名后缀 SEO 对比 2026](https://tname.cn/article/inside/?id=46)
- [Domain extensions and SEO rankings](https://vikilinks.com.au/domain-extensions-seo-rankings)
- [Does domain name affect SEO 2026](https://hashedomains.com/does-domain-name-affect-seo/)
- [.com / .cn / .top 怎么选](https://blog.csdn.net/zacji/article/details/164223031)