// 股票佣金计算器 —— 用户输入费率（v2 裁决 deferred 项的实施版）
// 依据：沪深 A 股默认费率口径来自上交所/深交所公示（A 股 B 股基金最高 3‰，向下浮动；印花税 0.5‰ 卖方单边；过户费 0.01‰ 双向；交易规费 ≈ 0.0541‰ 双向已含在券商佣金）。
// 来源：[上交所股票投资一件事](https://one.sse.com.cn/onething/gptz/) · [中国证券业协会交易费用](https://www.sac.net.cn/sjb/tzzzj_799/yctjcpwap/qtwap/201209/t20120914_35909.html)
// 注意：本工具按用户输入的「净佣金费率」+ 最低起收 5 元计算券商应收；规费/过户/印花税按公示默认；实际费率以券商报价与协议为准。

export type StockDirection = "buy" | "sell";
export type CommissionMode = "by_amount" | "by_shares";

export type StockCommissionErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_VALUE"
  | "INVALID_RATE"
  | "UNSUPPORTED_UNIT";

export type StockCommissionResult =
  | {
      ok: true;
      grossAmount: number;
      brokerFee: number; // 券商佣金（含规费）
      transferFee: number; // 过户费
      stampTax: number; // 印花税（卖出时为正，买入为 0）
      totalCost: number; // 买入总成本 = 成交 + 佣金 + 过户费；卖出净到手 = 成交 - 佣金 - 过户费 - 印花税
      netCashFlow: number; // 买入为 -grossAmount - brokerFee - transferFee；卖出为 +grossAmount - brokerFee - transferFee - stampTax
      breakdownText: string;
    }
  | {
      ok: false;
      error: { code: StockCommissionErrorCode; message: string };
    };

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_DECIMALS = 6;
const MAX_VALUE = 1e15;
const RATE_PCT_MAX = 100; // 费率不超过 100%

// 默认参数（按上交所公示 2024 年口径）
// 内部统一：所有用户输入的「‱」（万分之 X）均按 1‱ = 0.0001 处理
const DEFAULT_RATE_REFERENCE_PER_MILLE = 2.5; // 行业平均 1.78‱ ~ 2.5‱

interface CalcInput {
  price: string; // 单价（元/股）
  shares: string; // 股数
  rate: string; // 用户输入佣金费率（万分之 X）
  minFee: string; // 最低起收（元）
  stampTaxRate: string; // 印花税 ‰
  transferFeeRate: string; // 过户费 ‰
  direction: string; // 买/卖
}

function fail(
  code: StockCommissionErrorCode,
  message: string,
): StockCommissionResult {
  return { ok: false, error: { code, message } };
}

function formatCNY(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const factor = 10 ** 2;
  const rounded = Math.round(value * factor) / factor;
  let text = rounded.toFixed(2);
  if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, "");
  if (text === "-0") text = "0";
  return text;
}

function parseDecimal(
  s: string,
  code: StockCommissionErrorCode,
): number | StockCommissionResult {
  const trimmed = s.trim();
  if (trimmed === "") return fail(code, "请填写数值");
  if (!NUMBER_RE.test(trimmed)) return fail("INVALID_NUMBER", "请输入有效数字");
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return fail("INVALID_NUMBER", "请输入有效数字");
  const dot = trimmed.indexOf(".");
  const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;
  if (decimals > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", `小数位数不能超过 ${MAX_DECIMALS} 位`);
  }
  if (n > MAX_VALUE)
    return fail("OUT_OF_RANGE", "数值超出范围（不能超过 1e15）");
  return n;
}

function isDirection(s: string): s is StockDirection {
  return s === "buy" || s === "sell";
}

export function calculateStockCommission(
  input: CalcInput,
): StockCommissionResult {
  const {
    price,
    shares,
    rate,
    minFee,
    stampTaxRate,
    transferFeeRate,
    direction,
  } = input;
  const p = parseDecimal(price, "EMPTY");
  if (typeof p !== "number") return p;
  const sh = parseDecimal(shares, "EMPTY");
  if (typeof sh !== "number") return sh;
  const r = parseDecimal(rate, "EMPTY");
  if (typeof r !== "number") return r;
  const mFee = parseDecimal(minFee, "EMPTY");
  if (typeof mFee !== "number") return mFee;
  const stax = parseDecimal(stampTaxRate, "EMPTY");
  if (typeof stax !== "number") return stax;
  const tfee = parseDecimal(transferFeeRate, "EMPTY");
  if (typeof tfee !== "number") return tfee;
  if (!isDirection(direction)) {
    return fail("UNSUPPORTED_UNIT", "不支持的买卖方向");
  }

  if (p <= 0) return fail("NON_POSITIVE_VALUE", "价格必须大于 0");
  if (sh <= 0) return fail("NON_POSITIVE_VALUE", "股数必须大于 0");
  if (r < 0) return fail("INVALID_RATE", "佣金费率不能为负");
  if (r > RATE_PCT_MAX) return fail("INVALID_RATE", "佣金费率不能超过 100‱");
  if (mFee < 0) return fail("INVALID_RATE", "最低起收不能为负");
  if (stax < 0 || tfee < 0) return fail("INVALID_RATE", "税率不能为负");

  const grossAmount = p * sh;
  // 行业惯用「万分之 X」输入，1‱ = 0.0001
  const brokerFeeRaw = (grossAmount * r) / 10000;
  const brokerFee = Math.max(mFee, brokerFeeRaw);
  const transferFee = (grossAmount * tfee) / 10000;
  const stampTax = direction === "sell" ? (grossAmount * stax) / 10000 : 0;
  const totalCost =
    direction === "buy"
      ? brokerFee + transferFee
      : brokerFee + transferFee + stampTax;
  const netCashFlow =
    direction === "buy"
      ? -grossAmount - brokerFee - transferFee
      : grossAmount - brokerFee - transferFee - stampTax;

  const breakdown = [
    `成交金额 = ${formatCNY(p)} × ${formatCNY(sh)} = ¥${formatCNY(grossAmount)}`,
    `券商佣金 = ¥${formatCNY(grossAmount)} × ${r}‱ = ¥${formatCNY(brokerFeeRaw)}` +
      (brokerFeeRaw < mFee
        ? `（不足 ¥${formatCNY(mFee)} 最低，按 ¥${formatCNY(mFee)} 收取）`
        : ""),
    `过户费 = ¥${formatCNY(transferFee)}（沪深 A 股 ${tfee}‱ 双向）`,
    direction === "sell"
      ? `印花税 = ¥${formatCNY(stampTax)}（${stax}‱ 卖方单边）`
      : `印花税 = ¥0（买入免征）`,
  ].join("；");

  return {
    ok: true,
    grossAmount,
    brokerFee,
    transferFee,
    stampTax,
    totalCost,
    netCashFlow,
    breakdownText: breakdown,
  };
}

export const STOCK_COMMISSION_DEFAULTS = {
  rate: "2.5", // ‱ 万分之 2.5
  minFee: "5",
  stampTaxRate: "0.5",
  transferFeeRate: "0.01",
  averageRateHint: DEFAULT_RATE_REFERENCE_PER_MILLE,
};
