// 批量生成 Tier 3/4/5 的页面 + 脚本
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const TIER3 = [
  { slug: "pace-cn", title: "节拍计算器", dir: "health", fn: "calculatePace", formatFn: "formatPace", main: "pacePerKm", desc: "免费在线跑步配速计算器", fields: [{ id: "distance", label: "距离（km）", ph: "5" }, { id: "hours", label: "小时", ph: "0" }, { id: "minutes", label: "分钟", ph: "30" }, { id: "seconds", label: "秒", ph: "0" }], related: [["卡路里消耗", "/health/calorie-burn-cn/"]], faq: [["配速单位？", "分:秒 / 公里，例如 6'00\" = 6 分钟跑 1 公里。"]] },
  { slug: "calorie-burn-cn", title: "卡路里消耗计算器", dir: "health", fn: "calculateCalorie", formatFn: "formatCalorie", main: "kcal", desc: "免费在线运动卡路里消耗估算", fields: [{ id: "weight", label: "体重（kg）", ph: "70" }, { id: "minutes", label: "运动时长（分钟）", ph: "30" }, { id: "met", label: "运动 MET 值（跑步 9.8）", ph: "9.8" }], related: [["BMI", "/health/bmi-cn/"], ["节拍", "/health/pace-cn/"]], faq: [["MET 是什么？", "代谢当量；跑步 9.8 / 走路 3.5 / 骑车 7.5。"]] },
  { slug: "due-date-cn", title: "预产期计算器", dir: "health", fn: "calculateDueDate", formatFn: "formatDueDate", main: "dueDate", desc: "免费在线预产期计算", fields: [{ id: "lastPeriod", label: "末次月经日期", type: "date" }], related: [["排卵期", "/health/ovulation-cn/"]], faq: [["预产期准吗？", "实际分娩日期常与预产期有 ±2 周偏差。"]] },
  { slug: "ovulation-cn", title: "排卵期计算器", dir: "health", fn: "calculateOvulation", formatFn: "formatOvulation", main: "ovulationDate", desc: "免费在线排卵日估算", fields: [{ id: "lastPeriod", label: "末次月经日期", type: "date" }, { id: "cycle", label: "月经周期（天）", ph: "28" }], related: [["预产期", "/health/due-date-cn/"]], faq: [["排卵日怎么算？", "排卵日 ≈ 下次月经前 14 天。"]] },
];

const TIER4 = [
  { slug: "turtle-position-cn", title: "海龟交易法仓位计算器", dir: "investment", fn: "calculateTurtle", formatFn: "formatTurtle", main: "totalUnits", desc: "海龟交易法仓位计算（基于 ATR）", fields: [{ id: "accountEquity", label: "账户权益（¥）", ph: "1000000" }, { id: "atr", label: "ATR", ph: "2.5" }, { id: "riskPercent", label: "单笔风险（%）", ph: "1" }, { id: "entryPrice", label: "入场价", ph: "100" }], related: [["加密货币仓位", "/investment/crypto-position-cn/"]], faq: [["ATR 周期？", "常用 20 日 ATR。"]] },
  { slug: "crypto-position-cn", title: "加密货币仓位计算器", dir: "investment", fn: "calculateCryptoPosition", formatFn: "formatCryptoPosition", main: "positionValue", desc: "加密货币仓位 + 爆仓价", fields: [{ id: "equity", label: "账户权益（USDT）", ph: "10000" }, { id: "leverage", label: "杠杆倍数", ph: "10" }, { id: "entryPrice", label: "入场价", ph: "30000" }, { id: "side", label: "方向", select: [{ v: "long", l: "做多" }, { v: "short", l: "做空" }] }], related: [["期货保证金", "/investment/futures-margin-cn/"]], faq: [["爆仓价？", "维持保证金率触发强平的价格。"]] },
  { slug: "futures-margin-cn", title: "期货保证金计算器", dir: "investment", fn: "calculateFutures", formatFn: "formatFutures", main: "margin", desc: "期货保证金计算", fields: [{ id: "price", label: "合约价格", ph: "4000" }, { id: "lots", label: "手数", ph: "1" }, { id: "multiplier", label: "合约乘数", ph: "10" }, { id: "marginRate", label: "保证金率（%）", ph: "12" }], related: [["期权定价", "/investment/option-pricing-cn/"]], faq: [["保证金不足？", "需追加保证金或减仓，否则强制平仓。"]] },
  { slug: "option-pricing-cn", title: "期权定价计算器", dir: "investment", fn: "calculateOption", formatFn: "formatOption", main: "price", desc: "Black-Scholes 期权定价", fields: [{ id: "spot", label: "标的价", ph: "100" }, { id: "strike", label: "行权价", ph: "100" }, { id: "rate", label: "无风险利率（%）", ph: "4" }, { id: "vol", label: "波动率（%）", ph: "20" }, { id: "time", label: "到期时间（年）", ph: "1" }, { id: "type", label: "类型", select: [{ v: "call", l: "看涨" }, { v: "put", l: "看跌" }] }], related: [["期货保证金", "/investment/futures-margin-cn/"]], faq: [["BS 假设？", "对数正态分布、无风险利率恒定、波动率恒定、无交易成本。"]] },
  { slug: "cross-border-profit-cn", title: "跨境电商利润计算器", dir: "investment", fn: "calculateCrossBorder", formatFn: "formatCrossBorder", main: "profitCny", desc: "跨境电商利润估算", fields: [{ id: "sellingPrice", label: "售价（USD）", ph: "30" }, { id: "productCost", label: "货成本（USD）", ph: "5" }, { id: "shippingCost", label: "运费（USD）", ph: "3" }, { id: "platformFee", label: "平台费（%）", ph: "15" }, { id: "exchangeRate", label: "汇率（USD→CNY）", ph: "7.2" }], related: [["Amazon FBA", "/investment/amazon-fba-cn/"]], faq: [["净利率？", "扣除所有成本与平台费后的利润率。"]] },
  { slug: "amazon-fba-cn", title: "Amazon FBA 费用计算器", dir: "investment", fn: "calculateFba", formatFn: "formatFba", main: "profit", desc: "Amazon FBA 费用估算", fields: [{ id: "sellingPrice", label: "售价（USD）", ph: "30" }, { id: "productCost", label: "货成本（USD）", ph: "5" }, { id: "size", label: "尺寸", select: [{ v: "standard", l: "标准" }, { v: "large", l: "大件" }] }], related: [["跨境电商", "/investment/cross-border-profit-cn/"]], faq: [["FBA 费用构成？", "FBA 履约费 + 月度仓储费 + 长期仓储费。"]] },
  { slug: "gross-margin-cn", title: "毛利率计算器", dir: "investment", fn: "calculateGrossMargin", formatFn: "formatGrossMargin", main: "margin", desc: "毛利率", fields: [{ id: "revenue", label: "营收", ph: "100000" }, { id: "cost", label: "营业成本", ph: "60000" }], related: [["盈亏平衡", "/investment/break-even-cn/"]], faq: [["毛利率公式？", "(营收 − 营业成本) / 营收 × 100。"]] },
  { slug: "break-even-cn", title: "盈亏平衡点计算器", dir: "investment", fn: "calculateBreakEven", formatFn: "formatBreakEven", main: "units", desc: "盈亏平衡销量 / 销售额", fields: [{ id: "fixedCost", label: "固定成本", ph: "50000" }, { id: "pricePerUnit", label: "单价", ph: "100" }, { id: "variablePerUnit", label: "单位变动成本", ph: "60" }], related: [["毛利率", "/investment/gross-margin-cn/"]], faq: [["盈亏平衡公式？", "销量 = 固定成本 / (单价 − 单位变动成本)。"]] },
  { slug: "roas-cn", title: "广告 ROAS 计算器", dir: "investment", fn: "calculateRoas", formatFn: "formatRoas", main: "roas", desc: "广告投放 ROAS / ROI", fields: [{ id: "adCost", label: "广告费", ph: "1000" }, { id: "revenue", label: "广告带来销售额", ph: "5000" }, { id: "profitRate", label: "毛利率（%，可选）", ph: "30" }], related: [["转化率", "/investment/conversion-rate-cn/"]], faq: [["ROAS vs ROI？", "ROAS = 销售额/广告费；ROI = 利润/广告费。"]] },
  { slug: "conversion-rate-cn", title: "转化率计算器", dir: "investment", fn: "calculateCvr", formatFn: "formatCvr", main: "cvr", desc: "转化率", fields: [{ id: "visits", label: "访客数", ph: "10000" }, { id: "conversions", label: "转化数", ph: "200" }], related: [["ROAS", "/investment/roas-cn/"]], faq: [["行业基准？", "电商 2-3%，搜索 5-10%。"]] },
];

const TIER5 = [
  { slug: "scientific-cn", title: "科学计算器", dir: "efficiency", fn: "calculateScientific", formatFn: "formatScientific", main: "value", desc: "在线科学计算器（三角/对数/指数）", fields: [{ id: "expression", label: "表达式（如 sin(0.5), sqrt(16)）", ph: "sin(0.5)" }], related: [["四则运算", "/daily/basic/"], ["进制转换", "/efficiency/base-converter-cn/"]], faq: [["支持哪些函数？", "sin/cos/tan/log/ln/exp/sqrt/abs/pi/e。"]] },
  { slug: "base-converter-cn", title: "进制转换计算器", dir: "efficiency", fn: "convertBase", formatFn: "formatBase", main: "result", desc: "二进制/八进制/十进制/十六进制互转", fields: [{ id: "value", label: "数值", ph: "255" }, { id: "fromBase", label: "源进制（2/8/10/16）", ph: "10" }, { id: "toBase", label: "目标进制（2/8/10/16）", ph: "16" }], related: [["IP 子网", "/efficiency/ip-subnet-cn/"]], faq: [["支持小数？", "本工具仅支持整数转换。"]] },
  { slug: "ip-subnet-cn", title: "IP 子网计算器", dir: "efficiency", fn: "calculateSubnet", formatFn: "formatSubnet", main: "network", desc: "IP 子网掩码 / 可用主机数 / CIDR", fields: [{ id: "ip", label: "IP 地址", ph: "192.168.1.0" }, { id: "cidr", label: "CIDR（0-32）", ph: "24" }], related: [["进制转换", "/efficiency/base-converter-cn/"]], faq: [["CIDR？", "子网掩码中 1 的位数。"]] },
  { slug: "word-count-cn", title: "字数统计计算器", dir: "efficiency", fn: "countWords", formatFn: "formatWordCount", main: "chars", desc: "字符 / 单词 / 段落 / 行数统计", fields: [{ id: "text", label: "文本", ph: "Hello world 你好", textarea: true }], related: [["四则运算", "/daily/basic/"]], faq: [["中英文？", "中文按字符计数。"]] },
];

function makeAstro(t) {
  const inputFields = t.fields.map(f => {
    if (f.textarea) return `<div class="field"><label for="${f.id}">${f.label}</label><textarea id="${f.id}" class="field-input" rows="3" placeholder="${f.ph}"></textarea><p class="field-error" id="field-error-${f.id}" hidden></p></div>`;
    if (f.select) return `<div class="field"><label for="${f.id}">${f.label}</label><select id="${f.id}" class="field-select">${f.select.map(o => `<option value="${o.v}">${o.l}</option>`).join("")}</select></div>`;
    if (f.type === "date") return `<div class="field"><label for="${f.id}">${f.label}</label><input id="${f.id}" class="field-input" type="date" /><p class="field-error" id="field-error-${f.id}" hidden></p></div>`;
    return `<div class="field"><label for="${f.id}">${f.label}</label><input id="${f.id}" class="field-input" type="text" inputmode="decimal" autocomplete="off" placeholder="${f.ph}" /><p class="field-error" id="field-error-${f.id}" hidden></p></div>`;
  }).join("\n      ");
  const related = t.related.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("\n        ");
  const faq = t.faq.map(([q, a]) => `{ q: ${JSON.stringify(q)}, a: ${JSON.stringify(a)} }`).join(",\n    ");
  const ymyNotice = (t.dir === "finance" || t.dir === "investment") ? `<p class="result-hint"><strong>⚠️ 计算结果仅供参考，不构成投资/理财/税务建议。</strong></p>` : (t.dir === "health" ? `<p class="result-hint"><strong>⚠️ 本计算结果不能替代医生诊断。</strong></p>` : "");
  const breadcrumbs = t.dir === "health" ? `[{label:"首页",href:"/"},{label:"健康生活"},{label:"${t.title}"}]` : t.dir === "renovation" ? `[{label:"首页",href:"/"},{label:"装修家居"},{label:"${t.title}"}]` : t.dir === "efficiency" ? `[{label:"首页",href:"/"},{label:"效率工具"},{label:"${t.title}"}]` : t.dir === "daily" ? `[{label:"首页",href:"/"},{label:"日常工具"},{label:"${t.title}"}]` : `[{label:"首页",href:"/"},{label:"投资专业"},{label:"${t.title}"}]`;
  return `---
import BaseLayout from "../../layouts/BaseLayout.astro";
import Breadcrumb from "../../components/Breadcrumb.astro";
import AdContainer from "../../components/AdContainer.astro";
import FaqSection from "../../components/FaqSection.astro";
const faqItems = [${faq}];
---
<BaseLayout title="${t.title} — 在线 ${t.title}" description="${t.desc}" >
  <main id="main">
    <Breadcrumb items={${breadcrumbs}} />
    <h1>${t.title}</h1>
    <p class="lead">${t.desc}</p>
    ${ymyNotice}
    <form id="calc-form" class="card" novalidate>
      ${inputFields}
      <div class="form-actions"><button id="calc-btn" type="submit" class="btn btn-primary">计算</button><button id="reset-btn" type="button" class="btn btn-secondary">重置</button></div>
    </form>
    <div id="result" class="result" role="status" aria-live="polite"><p id="result-empty" class="result-empty">填写上方字段后显示结果</p><div id="result-content" hidden><p id="result-caption" class="result-caption"></p><p id="result-main" class="result-main"></p><p id="result-detail" class="result-process"></p><p id="result-stale-hint" class="result-hint" hidden>输入已变更，请重新计算</p><div class="result-actions"><button type="button" id="copy-btn" class="btn btn-secondary" disabled>复制结果</button></div></div></div>
    <AdContainer />
    <FaqSection items={faqItems} />
    <section class="section"><h2>相关工具</h2><ul class="tool-list">
        ${related}
      </ul></section>
  </main>
  <script src="../../scripts/${t.slug}-page.ts"></script>
</BaseLayout>
`;
}

function makePageScript(t) {
  const inputIds = t.fields.filter(f => !f.select).map(f => f.id);
  const selectIds = t.fields.filter(f => f.select).map(f => f.id);
  const allIds = [...inputIds, ...selectIds];
  const inputSelectors = inputIds.map(id => `const ${id}Input = el<HTMLInputElement>("#${id}");`).join("\n");
  const selectSelectors = selectIds.map(id => `const ${id}Select = el<HTMLSelectElement>("#${id}");`).join("\n");
  const errorSelectors = inputIds.map(id => `const err_${id} = el<HTMLParagraphElement>("#field-error-${id}");`).join("\n");
  const callArgs = t.fields.map(f => f.select ? `${f.id}: ${f.id}Select.value` : (f.textarea ? `${f.id}: ${f.id}Input.value` : `${f.id}: ${f.id}Input.value`)).join(", ");
  return `import { ${t.fn}, ${t.formatFn} } from "../lib/calculators/${t.slug}";
function el<T extends HTMLElement>(s: string): T { const e = document.querySelector<T>(s); if (!e) throw new Error(s); return e; }
const form = el<HTMLFormElement>("#calc-form");
${inputSelectors}
${selectSelectors}
${errorSelectors}
const resultEmpty = el<HTMLParagraphElement>("#result-empty");
const resultContent = el<HTMLDivElement>("#result-content");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const staleHint = el<HTMLParagraphElement>("#result-stale-hint");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
let state: "empty"|"computed"|"stale" = "empty";
let lastCopy = "";
function setError(i: HTMLInputElement | HTMLSelectElement, e: HTMLParagraphElement, m: string) { e.textContent = m; e.hidden = false; i.setAttribute("aria-invalid","true"); }
function clearError(i: HTMLInputElement | HTMLSelectElement, e: HTMLParagraphElement) { e.textContent = ""; e.hidden = true; i.removeAttribute("aria-invalid"); }
function setState(s: "empty"|"computed"|"stale") {
  state = s;
  resultEmpty.hidden = s !== "empty";
  resultContent.hidden = s === "empty";
  staleHint.hidden = s !== "stale";
  copyBtn.disabled = s !== "computed";
}
function firstErrorEl(): HTMLInputElement | HTMLSelectElement | null {
  return document.querySelector("input, select, textarea");
}
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  ${inputIds.map(id => `clearError(${id}Input, err_${id});`).join("\n  ")}
  const r = ${t.fn}({ ${callArgs} });
  if (!r.ok) {
    setError(${inputIds[0]}Input, err_${inputIds[0]}, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value as any;
  const f = ${t.formatFn}(v);
  resultCaption.textContent = "${t.title}";
  resultMain.textContent = String(f.${t.main} ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  ${inputIds.map(id => `${id}Input.value = "";`).join("\n  ")}
  ${selectIds.map(id => `${id}Select.value = "${t.fields.find(f => f.select)?.select?.[0]?.v || ""}";`).join("\n  ")}
  ${inputIds.map(id => `clearError(${id}Input, err_${id});`).join("\n  ")}
  setState("empty");
});
${allIds.map(id => `(${id}Input || ${id}Select).addEventListener("input", () => { if (state === "computed") setState("stale"); });`).join("\n")}
copyBtn.addEventListener("click", () => {
  const ok = navigator.clipboard ? navigator.clipboard.writeText(lastCopy).then(() => true).catch(() => false) : Promise.resolve(false);
  void ok.then(o => { copyBtn.textContent = o ? "已复制" : "复制失败"; setTimeout(() => copyBtn.textContent = "复制结果", 2000); });
});
setState("empty");
`;
}

const ALL = [...TIER3, ...TIER4, ...TIER5];
for (const t of ALL) {
  const pageDir = resolve(ROOT, `src/pages/${t.dir}`);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(resolve(pageDir, `${t.slug}.astro`), makeAstro(t));
  writeFileSync(resolve(ROOT, `src/scripts/${t.slug}-page.ts`), makePageScript(t));
  console.log("✓ " + t.slug);
}
console.log("Done: " + ALL.length + " pages generated.");
