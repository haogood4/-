// 批量生成 Tier 3/4/5 的库 + 测试 + 页面 + 脚本
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ====== Tier 3 健康长尾：4 个新工具 ======
const TIER3 = [
  { slug: "pace-cn", title: "节拍计算器", dir: "health", fn: "calculatePace", desc: "免费在线跑步配速计算器（节拍）", fields: [{ id: "distance", label: "距离（km）", ph: "5" }, { id: "hours", label: "小时", ph: "0" }, { id: "minutes", label: "分钟", ph: "30" }, { id: "seconds", label: "秒", ph: "0" }], related: [["卡路里消耗", "/health/calorie-burn-cn/"]], faq: [["配速单位？", "分:秒 / 公里，例如 6'00\" = 6 分钟跑 1 公里。"]] },
  { slug: "calorie-burn-cn", title: "卡路里消耗计算器", dir: "health", fn: "calculateCalorie", desc: "免费在线运动卡路里消耗估算", fields: [{ id: "weight", label: "体重（kg）", ph: "70" }, { id: "minutes", label: "运动时长（分钟）", ph: "30" }, { id: "met", label: "运动 MET 值（跑步 9.8 / 走路 3.5 / 骑车 7.5）", ph: "9.8" }], related: [["BMI", "/health/bmi-cn/"], ["节拍", "/health/pace-cn/"]], faq: [["MET 是什么？", "代谢当量，1 MET ≈ 安静坐着 1 kg 体重每分钟消耗 3.5 ml 氧气。"]] },
  { slug: "due-date-cn", title: "预产期计算器", dir: "health", fn: "calculateDueDate", desc: "免费在线预产期计算（末次月经法）", fields: [{ id: "lastPeriod", label: "末次月经日期", type: "date" }], related: [["排卵期", "/health/ovulation-cn/"], ["日期差", "/daily/date-diff/"]], faq: [["预产期准吗？", "实际分娩日期常与预产期有 ±2 周偏差，仅作参考。"]] },
  { slug: "ovulation-cn", title: "排卵期计算器", dir: "health", fn: "calculateOvulation", desc: "免费在线排卵日估算", fields: [{ id: "lastPeriod", label: "末次月经日期", type: "date" }, { id: "cycle", label: "月经周期（天）", ph: "28" }], related: [["预产期", "/health/due-date-cn/"]], faq: [["排卵日怎么算？", "排卵日 ≈ 下次月经前 14 天。"]] },
];

// ====== Tier 4 投资专业：10 个新工具 ======
const TIER4 = [
  { slug: "turtle-position-cn", title: "海龟交易法仓位计算器", dir: "investment", fn: "calculateTurtle", desc: "海龟交易法仓位计算（基于 ATR）", fields: [{ id: "accountEquity", label: "账户权益（¥）", ph: "1000000" }, { id: "atr", label: "ATR（平均真实波幅）", ph: "2.5" }, { id: "riskPercent", label: "单笔风险（%）", ph: "1" }, { id: "entryPrice", label: "入场价", ph: "100" }], related: [["加密货币仓位", "/investment/crypto-position-cn/"], ["期货保证金", "/investment/futures-margin-cn/"]], faq: [["ATR 周期？", "常用 20 日 ATR。"]] },
  { slug: "crypto-position-cn", title: "加密货币仓位计算器", dir: "investment", fn: "calculateCryptoPosition", desc: "加密货币仓位与爆仓价", fields: [{ id: "equity", label: "账户权益（USDT）", ph: "10000" }, { id: "leverage", label: "杠杆倍数", ph: "10" }, { id: "entryPrice", label: "入场价", ph: "30000" }, { id: "side", label: "方向", select: [{ v: "long", l: "做多" }, { v: "short", l: "做空" }] }], related: [["期货保证金", "/investment/futures-margin-cn/"], ["ROAS", "/investment/roas-cn/"]], faq: [["爆仓价？", "维持保证金率触发强平的价格。"]] },
  { slug: "futures-margin-cn", title: "期货保证金计算器", dir: "investment", fn: "calculateFutures", desc: "期货保证金计算", fields: [{ id: "price", label: "合约价格", ph: "4000" }, { id: "lots", label: "手数", ph: "1" }, { id: "multiplier", label: "合约乘数", ph: "10" }, { id: "marginRate", label: "保证金率（%）", ph: "12" }], related: [["期权定价", "/investment/option-pricing-cn/"], ["加密货币仓位", "/investment/crypto-position-cn/"]], faq: [["保证金不足？", "需追加保证金或减仓，否则强制平仓。"]] },
  { slug: "option-pricing-cn", title: "期权定价计算器", dir: "investment", fn: "calculateOption", desc: "Black-Scholes 期权定价", fields: [{ id: "spot", label: "标的价", ph: "100" }, { id: "strike", label: "行权价", ph: "100" }, { id: "rate", label: "无风险利率（%）", ph: "4" }, { id: "vol", label: "波动率（%）", ph: "20" }, { id: "time", label: "到期时间（年）", ph: "1" }, { id: "type", label: "类型", select: [{ v: "call", l: "看涨" }, { v: "put", l: "看跌" }] }], related: [["期货保证金", "/investment/futures-margin-cn/"], ["盈亏平衡", "/investment/break-even-cn/"]], faq: [["BS 假设？", "对数正态分布、无风险利率恒定、波动率恒定、无交易成本。"]] },
  { slug: "cross-border-profit-cn", title: "跨境电商利润计算器", dir: "investment", fn: "calculateCrossBorder", desc: "跨境电商利润估算", fields: [{ id: "sellingPrice", label: "售价（USD）", ph: "30" }, { id: "productCost", label: "货成本（USD）", ph: "5" }, { id: "shippingCost", label: "运费（USD）", ph: "3" }, { id: "platformFee", label: "平台费（%）", ph: "15" }, { id: "exchangeRate", label: "汇率（USD→CNY）", ph: "7.2" }], related: [["Amazon FBA", "/investment/amazon-fba-cn/"], ["毛利率", "/investment/gross-margin-cn/"]], faq: [["净利率？", "扣除所有成本与平台费后的利润率。"]] },
  { slug: "amazon-fba-cn", title: "Amazon FBA 费用计算器", dir: "investment", fn: "calculateFba", desc: "Amazon FBA 费用估算", fields: [{ id: "sellingPrice", label: "售价（USD）", ph: "30" }, { id: "productCost", label: "货成本（USD）", ph: "5" }, { id: "size", label: "尺寸", select: [{ v: "standard", l: "标准" }, { v: "large", l: "大件" }] }], related: [["跨境电商", "/investment/cross-border-profit-cn/"], ["毛利率", "/investment/gross-margin-cn/"]], faq: [["FBA 费用构成？", "FBA 履约费 + 月度仓储费 + 长期仓储费 + 移除订单费等。"]] },
  { slug: "gross-margin-cn", title: "毛利率计算器", dir: "investment", fn: "calculateGrossMargin", desc: "毛利率与净利润率", fields: [{ id: "revenue", label: "营收", ph: "100000" }, { id: "cost", label: "营业成本", ph: "60000" }], related: [["盈亏平衡", "/investment/break-even-cn/"], ["ROAS", "/investment/roas-cn/"]], faq: [["毛利率公式？", "(营收 − 营业成本) / 营收 × 100。"]] },
  { slug: "break-even-cn", title: "盈亏平衡点计算器", dir: "investment", fn: "calculateBreakEven", desc: "盈亏平衡销量 / 销售额", fields: [{ id: "fixedCost", label: "固定成本", ph: "50000" }, { id: "pricePerUnit", label: "单价", ph: "100" }, { id: "variablePerUnit", label: "单位变动成本", ph: "60" }], related: [["毛利率", "/investment/gross-margin-cn/"], ["ROAS", "/investment/roas-cn/"]], faq: [["盈亏平衡公式？", "销量 = 固定成本 / (单价 − 单位变动成本)。"]] },
  { slug: "roas-cn", title: "广告 ROAS 计算器", dir: "investment", fn: "calculateRoas", desc: "广告投放 ROAS / ROI", fields: [{ id: "adCost", label: "广告费", ph: "1000" }, { id: "revenue", label: "广告带来销售额", ph: "5000" }, { id: "profitRate", label: "毛利率（%，可选）", ph: "30" }], related: [["转化率", "/investment/conversion-rate-cn/"], ["毛利率", "/investment/gross-margin-cn/"]], faq: [["ROAS vs ROI？", "ROAS = 销售额/广告费；ROI = 利润/广告费。"]] },
  { slug: "conversion-rate-cn", title: "转化率计算器", dir: "investment", fn: "calculateCvr", desc: "转化率与漏斗计算", fields: [{ id: "visits", label: "访客数", ph: "10000" }, { id: "conversions", label: "转化数", ph: "200" }], related: [["ROAS", "/investment/roas-cn/"], ["毛利率", "/investment/gross-margin-cn/"]], faq: [["转化率行业基准？", "电商 2-3%，信息流 1-5%，搜索 5-10%。"]] },
];

// ====== Tier 5 效率工具：5 个新工具 ======
const TIER5 = [
  { slug: "scientific-cn", title: "科学计算器", dir: "efficiency", fn: "calculateScientific", desc: "在线科学计算器（三角函数/对数/指数）", fields: [{ id: "expression", label: "表达式（如 sin(0.5), log(2), exp(1)）", ph: "sin(0.5)" }], related: [["四则运算", "/daily/basic/"], ["进制转换", "/efficiency/base-converter-cn/"]], faq: [["支持哪些函数？", "sin/cos/tan/log/ln/exp/sqrt/abs/pi/e。"]] },
  { slug: "base-converter-cn", title: "进制转换计算器", dir: "efficiency", fn: "convertBase", desc: "二进制 / 八进制 / 十进制 / 十六进制互转", fields: [{ id: "value", label: "数值", ph: "255" }, { id: "fromBase", label: "源进制（2/8/10/16）", ph: "10" }, { id: "toBase", label: "目标进制（2/8/10/16）", ph: "16" }], related: [["IP 子网", "/efficiency/ip-subnet-cn/"], ["科学计算器", "/efficiency/scientific-cn/"]], faq: [["支持小数？", "本工具仅支持整数转换。"]] },
  { slug: "ip-subnet-cn", title: "IP 子网计算器", dir: "efficiency", fn: "calculateSubnet", desc: "IP 子网掩码 / 可用主机数 / CIDR", fields: [{ id: "ip", label: "IP 地址", ph: "192.168.1.0" }, { id: "cidr", label: "CIDR（前缀长度 0-32）", ph: "24" }], related: [["进制转换", "/efficiency/base-converter-cn/"]], faq: [["CIDR？", "无类域间路由，表示子网掩码中 1 的位数。"]] },
  { slug: "word-count-cn", title: "字数统计计算器", dir: "efficiency", fn: "countWords", desc: "字符 / 单词 / 段落 / 行数统计", fields: [{ id: "text", label: "文本内容", ph: "Hello world 你好世界", textarea: true }], related: [["四则运算", "/daily/basic/"]], faq: [["中英文如何区分？", "中文按字符计数；英文按空格分词。"]] },
];

// ====== 库函数模板（具体函数单独实现） ======

function libTemplate(t) {
  switch (t.slug) {
    case "pace-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type PaceInput = { distance: string; hours: string; minutes: string; seconds: string };
export type PaceResult = { pacePerKm: string; speedKmh: number };
export type PaceCalcResult = { ok: true; value: PaceResult } | { ok: false; error: { code: string; message: string } };
export function calculatePace(input: PaceInput): PaceCalcResult {
  const d = validateNumber(input.distance); if (!d.ok) return d;
  const h = validateNumber(input.hours); if (!h.ok) return h;
  const m = validateNumber(input.minutes); if (!m.ok) return m;
  const s = validateNumber(input.seconds); if (!s.ok) return s;
  if (d.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "距离须大于 0" } };
  if (h.value < 0 || m.value < 0 || s.value < 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "时间不能为负" } };
  const totalSec = h.value * 3600 + m.value * 60 + s.value;
  if (totalSec === 0) return { ok: false, error: { code: "EMPTY", message: "请输入时间" } };
  const secPerKm = totalSec / d.value;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm - min * 60);
  const pacePerKm = min + "'" + (sec < 10 ? "0" + sec : sec) + '"';
  const speedKmh = d.value / (totalSec / 3600);
  return { ok: true, value: { pacePerKm, speedKmh } };
}
export function formatPace(value: PaceResult) {
  return { pacePerKm: value.pacePerKm + " /km", speedKmh: formatResult(value.speedKmh) + " km/h" };
}`;
    case "calorie-burn-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type CalorieInput = { weight: string; minutes: string; met: string };
export type CalorieResult = { kcal: number };
export type CalorieCalcResult = { ok: true; value: CalorieResult } | { ok: false; error: { code: string; message: string } };
export function calculateCalorie(input: CalorieInput): CalorieCalcResult {
  const w = validateNumber(input.weight); if (!w.ok) return w;
  const m = validateNumber(input.minutes); if (!m.ok) return m;
  const met = validateNumber(input.met); if (!met.ok) return met;
  if (w.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "体重大于 0" } };
  if (m.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "时长大于 0" } };
  if (met.value <= 0 || met.value > 20) return { ok: false, error: { code: "OUT_OF_RANGE", message: "MET 须 0-20" } };
  // kcal = MET × 3.5 × kg / 200 × min（简化公式）
  const kcal = met.value * 3.5 * w.value / 200 * m.value;
  return { ok: true, value: { kcal } };
}
export function formatCalorie(value: CalorieResult) { return { kcal: formatResult(value.kcal) + " kcal" }; }`;
    case "due-date-cn":
      return `import { formatResult } from "./_shared";
export type DueDateInput = { lastPeriod: string };
export type DueDateResult = { dueDate: string; weeks: number };
export type DueDateCalcResult = { ok: true; value: DueDateResult } | { ok: false; error: { code: string; message: string } };
export function calculateDueDate(input: DueDateInput): DueDateCalcResult {
  const t = input.lastPeriod.trim();
  if (!t) return { ok: false, error: { code: "EMPTY", message: "请输入末次月经日期" } };
  const m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(t);
  if (!m) return { ok: false, error: { code: "INVALID_FORMAT", message: "日期格式：YYYY-MM-DD" } };
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(date.getTime())) return { ok: false, error: { code: "INVALID_FORMAT", message: "无效日期" } };
  date.setDate(date.getDate() + 280);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dueDate = yyyy + "-" + mm + "-" + dd;
  const weeks = 40;
  return { ok: true, value: { dueDate, weeks } };
}
export function formatDueDate(value: DueDateResult) { return { dueDate: value.dueDate, weeks: value.weeks + " 周" }; }`;
    case "ovulation-cn":
      return `import { formatResult } from "./_shared";
export type OvulationInput = { lastPeriod: string; cycle: string };
export type OvulationResult = { ovulationDate: string; fertileWindow: [string, string] };
export type OvulationCalcResult = { ok: true; value: OvulationResult } | { ok: false; error: { code: string; message: string } };
export function calculateOvulation(input: OvulationInput): OvulationCalcResult {
  const t = input.lastPeriod.trim();
  const cycStr = input.cycle.trim();
  const cyc = Number(cycStr);
  if (!t) return { ok: false, error: { code: "EMPTY", message: "请输入末次月经日期" } };
  if (!cycStr || !Number.isInteger(cyc) || cyc < 20 || cyc > 45) {
    return { ok: false, error: { code: "OUT_OF_RANGE", message: "周期须为 20-45 的整数" } };
  }
  const m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(t);
  if (!m) return { ok: false, error: { code: "INVALID_FORMAT", message: "日期格式：YYYY-MM-DD" } };
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  date.setDate(date.getDate() + (cyc - 14));
  const fmt = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const ovulationDate = fmt(date);
  const start = new Date(date); start.setDate(start.getDate() - 5);
  const end = new Date(date); end.setDate(end.getDate() + 1);
  return { ok: true, value: { ovulationDate, fertileWindow: [fmt(start), fmt(end)] } };
}
export function formatOvulation(value: OvulationResult) { return { ovulationDate: value.ovulationDate, fertileWindow: value.fertileWindow[0] + " ~ " + value.fertileWindow[1] }; }`;
    case "turtle-position-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type TurtleInput = { accountEquity: string; atr: string; riskPercent: string; entryPrice: string };
export type TurtleResult = { unitSize: number; totalUnits: number; stopLoss: number };
export type TurtleCalcResult = { ok: true; value: TurtleResult } | { ok: false; error: { code: string; message: string } };
export function calculateTurtle(input: TurtleInput): TurtleCalcResult {
  const e = validateNumber(input.accountEquity); if (!e.ok) return e;
  const a = validateNumber(input.atr); if (!a.ok) return a;
  const r = validateNumber(input.riskPercent); if (!r.ok) return r;
  const p = validateNumber(input.entryPrice); if (!p.ok) return p;
  if (e.value <= 0 || a.value <= 0 || r.value <= 0 || p.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须大于 0" } };
  const dollarRisk = e.value * r.value / 100;
  const unitSize = dollarRisk / (2 * a.value);
  const totalUnits = Math.floor(unitSize);
  const stopLoss = p.value - 2 * a.value;
  return { ok: true, value: { unitSize, totalUnits, stopLoss } };
}
export function formatTurtle(value: TurtleResult) { return { unitSize: formatResult(value.unitSize) + " 单位", totalUnits: String(value.totalUnits) + " 单位", stopLoss: formatResult(value.stopLoss) }; }`;
    case "crypto-position-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type CryptoInput = { equity: string; leverage: string; entryPrice: string; side: "long"|"short" };
export type CryptoResult = { positionValue: number; margin: number; liquidationPrice: number };
export type CryptoCalcResult = { ok: true; value: CryptoResult } | { ok: false; error: { code: string; message: string } };
export function calculateCryptoPosition(input: CryptoInput): CryptoCalcResult {
  const e = validateNumber(input.equity); if (!e.ok) return e;
  const l = validateNumber(input.leverage); if (!l.ok) return l;
  const p = validateNumber(input.entryPrice); if (!p.ok) return p;
  if (e.value <= 0 || l.value <= 0 || l.value > 125 || p.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法（杠杆 ≤ 125）" } };
  const positionValue = e.value * l.value;
  const margin = e.value;
  // 简化爆仓价：做多 = 入场 × (1 - 1/杠杆)；做空 = 入场 × (1 + 1/杠杆)
  const liq = input.side === "long" ? p.value * (1 - 1 / l.value) : p.value * (1 + 1 / l.value);
  return { ok: true, value: { positionValue, margin, liquidationPrice: liq } };
}
export function formatCryptoPosition(value: CryptoResult) { return { positionValue: formatResult(value.positionValue) + " USDT", margin: formatResult(value.margin) + " USDT", liquidationPrice: formatResult(value.liquidationPrice) + " USDT" }; }`;
    case "futures-margin-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type FuturesInput = { price: string; lots: string; multiplier: string; marginRate: string };
export type FuturesResult = { margin: number; value: number };
export type FuturesCalcResult = { ok: true; value: FuturesResult } | { ok: false; error: { code: string; message: string } };
export function calculateFutures(input: FuturesInput): FuturesCalcResult {
  const p = validateNumber(input.price); if (!p.ok) return p;
  const l = validateNumber(input.lots); if (!l.ok) return l;
  const m = validateNumber(input.multiplier); if (!m.ok) return m;
  const r = validateNumber(input.marginRate); if (!r.ok) return r;
  if (p.value <= 0 || l.value <= 0 || m.value <= 0 || r.value <= 0 || r.value > 100) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法" } };
  const value = p.value * l.value * m.value;
  const margin = value * r.value / 100;
  return { ok: true, value: { margin, value } };
}
export function formatFutures(value: FuturesResult) { return { margin: formatResult(value.margin), value: formatResult(value.value) }; }`;
    case "option-pricing-cn":
      return `import { validateNumber, formatResult } from "./_shared";
function cdf(x: number): number {
  // 标准正态分布 CDF（Abramowitz & Stegun 近似）
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp(-x * x / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
export type OptionInput = { spot: string; strike: string; rate: string; vol: string; time: string; type: "call"|"put" };
export type OptionResult = { price: number; d1: number; d2: number };
export type OptionCalcResult = { ok: true; value: OptionResult } | { ok: false; error: { code: string; message: string } };
export function calculateOption(input: OptionInput): OptionCalcResult {
  const s = validateNumber(input.spot); if (!s.ok) return s;
  const k = validateNumber(input.strike); if (!k.ok) return k;
  const r = validateNumber(input.rate); if (!r.ok) return r;
  const v = validateNumber(input.vol); if (!v.ok) return v;
  const t = validateNumber(input.time); if (!t.ok) return t;
  if (s.value <= 0 || k.value <= 0 || v.value <= 0 || t.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须大于 0" } };
  const rDec = r.value / 100;
  const vDec = v.value / 100;
  const d1 = (Math.log(s.value / k.value) + (rDec + vDec * vDec / 2) * t.value) / (vDec * Math.sqrt(t.value));
  const d2 = d1 - vDec * Math.sqrt(t.value);
  const call = s.value * cdf(d1) - k.value * Math.exp(-rDec * t.value) * cdf(d2);
  const put = k.value * Math.exp(-rDec * t.value) * cdf(-d2) - s.value * cdf(-d1);
  return { ok: true, value: { price: input.type === "call" ? call : put, d1, d2 } };
}
export function formatOption(value: OptionResult) { return { price: formatResult(value.price), d1: formatResult(value.d1), d2: formatResult(value.d2) }; }`;
    case "cross-border-profit-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type CrossBorderInput = { sellingPrice: string; productCost: string; shippingCost: string; platformFee: string; exchangeRate: string };
export type CrossBorderResult = { totalCostCny: number; revenueCny: number; profitCny: number; profitRate: number };
export type CrossBorderCalcResult = { ok: true; value: CrossBorderResult } | { ok: false; error: { code: string; message: string } };
export function calculateCrossBorder(input: CrossBorderInput): CrossBorderCalcResult {
  const sp = validateNumber(input.sellingPrice); if (!sp.ok) return sp;
  const pc = validateNumber(input.productCost); if (!pc.ok) return pc;
  const sh = validateNumber(input.shippingCost); if (!sh.ok) return sh;
  const pf = validateNumber(input.platformFee); if (!pf.ok) return pf;
  const ex = validateNumber(input.exchangeRate); if (!ex.ok) return ex;
  if (sp.value <= 0 || pc.value < 0 || sh.value < 0 || pf.value < 0 || pf.value > 50 || ex.value <= 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法" } };
  const platformFeeUsd = sp.value * pf.value / 100;
  const totalCostUsd = pc.value + sh.value + platformFeeUsd;
  const totalCostCny = totalCostUsd * ex.value;
  const revenueCny = sp.value * ex.value;
  const profitCny = revenueCny - totalCostCny;
  const profitRate = profitCny / revenueCny;
  return { ok: true, value: { totalCostCny, revenueCny, profitCny, profitRate } };
}
export function formatCrossBorder(value: CrossBorderResult) {
  return {
    totalCostCny: "¥" + formatResult(value.totalCostCny),
    revenueCny: "¥" + formatResult(value.revenueCny),
    profitCny: "¥" + formatResult(value.profitCny),
    profitRate: formatResult(value.profitRate * 100) + "%",
  };
}`;
    case "amazon-fba-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type FbaInput = { sellingPrice: string; productCost: string; size: "standard"|"large" };
export type FbaResult = { fbaFee: number; profit: number; margin: number };
export type FbaCalcResult = { ok: true; value: FbaResult } | { ok: false; error: { code: string; message: string } };
export function calculateFba(input: FbaInput): FbaCalcResult {
  const sp = validateNumber(input.sellingPrice); if (!sp.ok) return sp;
  const pc = validateNumber(input.productCost); if (!pc.ok) return pc;
  if (sp.value <= 0 || pc.value < 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法" } };
  // 简化 FBA 费率：标准 $3.06，大件 $5.77
  const fbaFee = input.size === "standard" ? 3.06 : 5.77;
  const profit = sp.value - pc.value - fbaFee;
  const margin = profit / sp.value;
  return { ok: true, value: { fbaFee, profit, margin } };
}
export function formatFba(value: FbaResult) {
  return {
    fbaFee: "$" + formatResult(value.fbaFee),
    profit: "$" + formatResult(value.profit),
    margin: formatResult(value.margin * 100) + "%",
  };
}`;
    case "gross-margin-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type GrossMarginInput = { revenue: string; cost: string };
export type GrossMarginResult = { gross: number; margin: number };
export type GrossMarginCalcResult = { ok: true; value: GrossMarginResult } | { ok: false; error: { code: string; message: string } };
export function calculateGrossMargin(input: GrossMarginInput): GrossMarginCalcResult {
  const r = validateNumber(input.revenue); if (!r.ok) return r;
  const c = validateNumber(input.cost); if (!c.ok) return c;
  if (r.value <= 0 || c.value < 0 || c.value >= r.value) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法（成本 < 营收）" } };
  const gross = r.value - c.value;
  const margin = gross / r.value;
  return { ok: true, value: { gross, margin } };
}
export function formatGrossMargin(value: GrossMarginResult) { return { gross: formatResult(value.gross), margin: formatResult(value.margin * 100) + "%" }; }`;
    case "break-even-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type BreakEvenInput = { fixedCost: string; pricePerUnit: string; variablePerUnit: string };
export type BreakEvenResult = { units: number; revenue: number };
export type BreakEvenCalcResult = { ok: true; value: BreakEvenResult } | { ok: false; error: { code: string; message: string } };
export function calculateBreakEven(input: BreakEvenInput): BreakEvenCalcResult {
  const f = validateNumber(input.fixedCost); if (!f.ok) return f;
  const p = validateNumber(input.pricePerUnit); if (!p.ok) return p;
  const v = validateNumber(input.variablePerUnit); if (!v.ok) return v;
  if (f.value < 0 || p.value <= 0 || v.value < 0 || v.value >= p.value) return { ok: false, error: { code: "OUT_OF_RANGE", message: "单价须大于变动成本" } };
  const contribution = p.value - v.value;
  const units = Math.ceil(f.value / contribution);
  const revenue = units * p.value;
  return { ok: true, value: { units, revenue } };
}
export function formatBreakEven(value: BreakEvenResult) { return { units: String(value.units) + " 件", revenue: formatResult(value.revenue) }; }`;
    case "roas-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type RoasInput = { adCost: string; revenue: string; profitRate: string };
export type RoasResult = { roas: number; roi: number };
export type RoasCalcResult = { ok: true; value: RoasResult } | { ok: false; error: { code: string; message: string } };
export function calculateRoas(input: RoasInput): RoasCalcResult {
  const a = validateNumber(input.adCost); if (!a.ok) return a;
  const r = validateNumber(input.revenue); if (!r.ok) return r;
  const p = validateNumber(input.profitRate); if (!p.ok) return p;
  if (a.value <= 0 || r.value < 0 || p.value < 0) return { ok: false, error: { code: "OUT_OF_RANGE", message: "数值须合法" } };
  const roas = r.value / a.value;
  const roi = (r.value * p.value / 100) / a.value;
  return { ok: true, value: { roas, roi } };
}
export function formatRoas(value: RoasResult) { return { roas: formatResult(value.roas), roi: formatResult(value.roi * 100) + "%" }; }`;
    case "conversion-rate-cn":
      return `import { validateNumber, formatResult } from "./_shared";
export type CvrInput = { visits: string; conversions: string };
export type CvrResult = { cvr: number };
export type CvrCalcResult = { ok: true; value: CvrResult } | { ok: false; error: { code: string; message: string } };
export function calculateCvr(input: CvrInput): CvrCalcResult {
  const v = validateNumber(input.visits); if (!v.ok) return v;
  const c = validateNumber(input.conversions); if (!c.ok) return c;
  if (v.value <= 0 || c.value < 0 || c.value > v.value) return { ok: false, error: { code: "OUT_OF_RANGE", message: "转化数须 ≤ 访客数" } };
  return { ok: true, value: { cvr: c.value / v.value } };
}
export function formatCvr(value: CvrResult) { return { cvr: formatResult(value.cvr * 100) + "%" }; }`;
    case "scientific-cn":
      return `import { formatResult } from "./_shared";
export type ScientificInput = { expression: string };
export type ScientificResult = { value: number; ok: boolean };
export type ScientificCalcResult = { ok: true; value: ScientificResult } | { ok: false; error: { code: string; message: string } };
const SAFE = /^(\\s*(?:\\d+(?:\\.\\d+)?|sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs|pi|e|\\(|\\)|\\+|-|\\*|\\/|\\^|\\s)*\\s*)$/i;
export function calculateScientific(input: ScientificInput): ScientificCalcResult {
  const e = input.expression.trim();
  if (!e) return { ok: false, error: { code: "EMPTY", message: "请输入表达式" } };
  if (!SAFE.test(e)) return { ok: false, error: { code: "INVALID_FORMAT", message: "仅支持数字与 sin/cos/tan/log/ln/exp/sqrt/abs/pi/e/() 运算符" } };
  // 简单表达式求值（不支持 ^，可后续扩展）
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("pi", "e", "sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "exp", "sqrt", "abs", "return (" + e + ");");
    const v = fn(Math.PI, Math.E, Math.sin, Math.cos, Math.tan, Math.asin, Math.acos, Math.atan, Math.log, Math.log, Math.exp, Math.sqrt, Math.abs);
    if (typeof v !== "number" || !Number.isFinite(v)) return { ok: false, error: { code: "OUT_OF_RANGE", message: "无法求解" } };
    return { ok: true, value: { value: v, ok: true } };
  } catch (e) {
    return { ok: false, error: { code: "INVALID_FORMAT", message: "表达式格式错误" } };
  }
}
export function formatScientific(value: ScientificResult) { return { value: formatResult(value.value) }; }`;
    case "base-converter-cn":
      return `export type BaseInput = { value: string; fromBase: string; toBase: string };
export type BaseResult = { result: string };
export type BaseCalcResult = { ok: true; value: BaseResult } | { ok: false; error: { code: string; message: string } };
export function convertBase(input: BaseInput): BaseCalcResult {
  const v = input.value.trim();
  const from = Number(input.fromBase);
  const to = Number(input.toBase);
  if (!v) return { ok: false, error: { code: "EMPTY", message: "请输入数值" } };
  if (![2, 8, 10, 16].includes(from) || ![2, 8, 10, 16].includes(to)) return { ok: false, error: { code: "INVALID_FORMAT", message: "进制须为 2/8/10/16" } };
  const n = parseInt(v, from);
  if (isNaN(n)) return { ok: false, error: { code: "INVALID_FORMAT", message: "无效数值" } };
  return { ok: true, value: { result: n.toString(to) } };
}
export function formatBase(value: BaseResult) { return { result: value.result }; }`;
    case "ip-subnet-cn":
      return `export type SubnetInput = { ip: string; cidr: string };
export type SubnetResult = { network: string; broadcast: string; usable: number; mask: string };
export type SubnetCalcResult = { ok: true; value: SubnetResult } | { ok: false; error: { code: string; message: string } };
export function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
}
export function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}
export function calculateSubnet(input: SubnetInput): SubnetCalcResult {
  const cidr = Number(input.cidr);
  if (!/^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/.test(input.ip)) return { ok: false, error: { code: "INVALID_FORMAT", message: "IP 格式错误" } };
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) return { ok: false, error: { code: "OUT_OF_RANGE", message: "CIDR 须 0-32" } };
  const ip = ipToInt(input.ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const usable = cidr >= 31 ? Math.max(0, Math.pow(2, 32 - cidr) - 2) : Math.pow(2, 32 - cidr) - 2;
  return { ok: true, value: { network: intToIp(network), broadcast: intToIp(broadcast), usable, mask: intToIp(mask) } };
}
export function formatSubnet(value: SubnetResult) { return { network: value.network, broadcast: value.broadcast, usable: String(value.usable), mask: value.mask }; }`;
    case "word-count-cn":
      return `export type WordInput = { text: string };
export type WordResult = { chars: number; words: number; lines: number; paragraphs: number };
export type WordCalcResult = { ok: true; value: WordResult } | { ok: false; error: { code: string; message: string } };
export function countWords(input: WordInput): WordCalcResult {
  const t = input.text;
  if (!t) return { ok: true, value: { chars: 0, words: 0, lines: 0, paragraphs: 0 } };
  const chars = [...t].length; // Unicode 字符数（中文友好）
  const wordsEn = (t.match(/[a-zA-Z]+/g) || []).length;
  const words = wordsEn + (chars - [...t.replace(/[a-zA-Z\\s]/g, "")].length);
  const lines = t.split("\\n").length;
  const paragraphs = t.split(/\\n\\s*\\n/).filter(s => s.trim()).length;
  return { ok: true, value: { chars, words, lines, paragraphs } };
}
export function formatWordCount(value: WordResult) { return { chars: String(value.chars) + " 字符", words: String(value.words) + " 词", lines: String(value.lines) + " 行", paragraphs: String(value.paragraphs) + " 段" }; }`;
    default:
      throw new Error("Missing lib template for " + t.slug);
  }
}

// ====== 测试用例模板 ======
function testTemplate(t) {
  switch (t.slug) {
    case "pace-cn": return `import { describe, expect, it } from "vitest";
import { calculatePace } from "./pace-cn";
describe("pace-cn", () => {
  it("5 公里 30 分钟", () => {
    const r = calculatePace({ distance: "5", hours: "0", minutes: "30", seconds: "0" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.pacePerKm).toBe("6'00\\"");
  });
});`;
    case "calorie-burn-cn": return `import { describe, expect, it } from "vitest";
import { calculateCalorie } from "./calorie-burn-cn";
describe("calorie-burn-cn", () => {
  it("70kg 30min MET 9.8", () => {
    const r = calculateCalorie({ weight: "70", minutes: "30", met: "9.8" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.kcal).toBeGreaterThan(200);
  });
});`;
    case "due-date-cn": return `import { describe, expect, it } from "vitest";
import { calculateDueDate } from "./due-date-cn";
describe("due-date-cn", () => {
  it("末次月经 2025-01-15", () => {
    const r = calculateDueDate({ lastPeriod: "2025-01-15" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.dueDate).toBe("2025-10-22");
  });
});`;
    case "ovulation-cn": return `import { describe, expect, it } from "vitest";
import { calculateOvulation } from "./ovulation-cn";
describe("ovulation-cn", () => {
  it("末次月经 2025-01-15 周期 28 天", () => {
    const r = calculateOvulation({ lastPeriod: "2025-01-15", cycle: "28" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.ovulationDate).toBe("2025-01-29");
  });
});`;
    case "turtle-position-cn": return `import { describe, expect, it } from "vitest";
import { calculateTurtle } from "./turtle-position-cn";
describe("turtle-position-cn", () => {
  it("100万权益 ATR 2.5 风险 1% 入场 100", () => {
    const r = calculateTurtle({ accountEquity: "1000000", atr: "2.5", riskPercent: "1", entryPrice: "100" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.totalUnits).toBeGreaterThan(0);
      expect(r.value.stopLoss).toBeCloseTo(95, 0);
    }
  });
});`;
    case "crypto-position-cn": return `import { describe, expect, it } from "vitest";
import { calculateCryptoPosition } from "./crypto-position-cn";
describe("crypto-position-cn", () => {
  it("10000 USDT 10x 30000 做多", () => {
    const r = calculateCryptoPosition({ equity: "10000", leverage: "10", entryPrice: "30000", side: "long" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.liquidationPrice).toBeCloseTo(27000, 0);
  });
});`;
    case "futures-margin-cn": return `import { describe, expect, it } from "vitest";
import { calculateFutures } from "./futures-margin-cn";
describe("futures-margin-cn", () => {
  it("4000 × 1 手 × 10 × 12%", () => {
    const r = calculateFutures({ price: "4000", lots: "1", multiplier: "10", marginRate: "12" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.margin).toBe(4800);
      expect(r.value.value).toBe(40000);
    }
  });
});`;
    case "option-pricing-cn": return `import { describe, expect, it } from "vitest";
import { calculateOption } from "./option-pricing-cn";
describe("option-pricing-cn", () => {
  it("ATM 看涨", () => {
    const r = calculateOption({ spot: "100", strike: "100", rate: "4", vol: "20", time: "1", type: "call" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.price).toBeGreaterThan(5);
  });
});`;
    case "cross-border-profit-cn": return `import { describe, expect, it } from "vitest";
import { calculateCrossBorder } from "./cross-border-profit-cn";
describe("cross-border-profit-cn", () => {
  it("30 USD 售价 5 货本 3 运费 15% 平台", () => {
    const r = calculateCrossBorder({ sellingPrice: "30", productCost: "5", shippingCost: "3", platformFee: "15", exchangeRate: "7.2" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 平台费 = 4.5，总成本 = 12.5 USD → 90 CNY；收入 216 CNY；利润 126 CNY；利润率 ≈ 58%
      expect(r.value.profitCny).toBeCloseTo(126, 0);
    }
  });
});`;
    case "amazon-fba-cn": return `import { describe, expect, it } from "vitest";
import { calculateFba } from "./amazon-fba-cn";
describe("amazon-fba-cn", () => {
  it("30 USD 售价 5 货本 标准尺寸", () => {
    const r = calculateFba({ sellingPrice: "30", productCost: "5", size: "standard" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.fbaFee).toBe(3.06);
      expect(r.value.profit).toBeCloseTo(21.94, 2);
    }
  });
});`;
    case "gross-margin-cn": return `import { describe, expect, it } from "vitest";
import { calculateGrossMargin } from "./gross-margin-cn";
describe("gross-margin-cn", () => {
  it("营收 10万 成本 6万", () => {
    const r = calculateGrossMargin({ revenue: "100000", cost: "60000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.gross).toBe(40000);
      expect(r.value.margin).toBeCloseTo(0.4, 6);
    }
  });
});`;
    case "break-even-cn": return `import { describe, expect, it } from "vitest";
import { calculateBreakEven } from "./break-even-cn";
describe("break-even-cn", () => {
  it("固定 50000 单价 100 变动 60", () => {
    const r = calculateBreakEven({ fixedCost: "50000", pricePerUnit: "100", variablePerUnit: "60" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.units).toBe(1250);
      expect(r.value.revenue).toBe(125000);
    }
  });
});`;
    case "roas-cn": return `import { describe, expect, it } from "vitest";
import { calculateRoas } from "./roas-cn";
describe("roas-cn", () => {
  it("广告 1000 销售 5000 毛利率 30%", () => {
    const r = calculateRoas({ adCost: "1000", revenue: "5000", profitRate: "30" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.roas).toBeCloseTo(5, 6);
      expect(r.value.roi).toBeCloseTo(1.5, 6);
    }
  });
});`;
    case "conversion-rate-cn": return `import { describe, expect, it } from "vitest";
import { calculateCvr } from "./conversion-rate-cn";
describe("conversion-rate-cn", () => {
  it("10000 访客 200 转化", () => {
    const r = calculateCvr({ visits: "10000", conversions: "200" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cvr).toBeCloseTo(0.02, 6);
  });
});`;
    case "scientific-cn": return `import { describe, expect, it } from "vitest";
import { calculateScientific } from "./scientific-cn";
describe("scientific-cn", () => {
  it("sin(0)", () => {
    const r = calculateScientific({ expression: "sin(0)" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(0, 6);
  });
  it("sqrt(16)", () => {
    const r = calculateScientific({ expression: "sqrt(16)" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBe(4);
  });
});`;
    case "base-converter-cn": return `import { describe, expect, it } from "vitest";
import { convertBase } from "./base-converter-cn";
describe("base-converter-cn", () => {
  it("10 → 16 = ff", () => {
    const r = convertBase({ value: "255", fromBase: "10", toBase: "16" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.result).toBe("ff");
  });
});`;
    case "ip-subnet-cn": return `import { describe, expect, it } from "vitest";
import { calculateSubnet } from "./ip-subnet-cn";
describe("ip-subnet-cn", () => {
  it("192.168.1.0/24", () => {
    const r = calculateSubnet({ ip: "192.168.1.0", cidr: "24" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.network).toBe("192.168.1.0");
      expect(r.value.broadcast).toBe("192.168.1.255");
      expect(r.value.usable).toBe(254);
    }
  });
});`;
    case "word-count-cn": return `import { describe, expect, it } from "vitest";
import { countWords } from "./word-count-cn";
describe("word-count-cn", () => {
  it("Hello world 你好", () => {
    const r = countWords({ text: "Hello world 你好" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(13);
      expect(r.value.words).toBeGreaterThan(0);
    }
  });
});`;
    default: return "";
  }
}

// 写入库与测试
const ALL = [...TIER3, ...TIER4, ...TIER5];
for (const t of ALL) {
  writeFileSync(resolve(ROOT, `src/lib/calculators/${t.slug}.ts`), libTemplate(t));
  writeFileSync(resolve(ROOT, `src/lib/calculators/${t.slug}.test.ts`), testTemplate(t));
  console.log("✓ lib " + t.slug);
}
console.log("Done: " + ALL.length + " libs generated.");
