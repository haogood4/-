// 汇率换算计算器（用户输入汇率，不接入实时数据）
import { validateNumber, formatResult } from "./_shared";

export type Currency =
  "CNY" | "USD" | "HKD" | "EUR" | "JPY" | "GBP" | "AUD" | "KRW";

export const CURRENCIES: Array<{
  code: Currency;
  name: string;
  symbol: string;
}> = [
  { code: "CNY", name: "人民币", symbol: "¥" },
  { code: "USD", name: "美元", symbol: "$" },
  { code: "HKD", name: "港币", symbol: "HK$" },
  { code: "EUR", name: "欧元", symbol: "€" },
  { code: "JPY", name: "日元", symbol: "¥" },
  { code: "GBP", name: "英镑", symbol: "£" },
  { code: "AUD", name: "澳元", symbol: "A$" },
  { code: "KRW", name: "韩元", symbol: "₩" },
];

export type ExchangeInput = {
  amount: string;
  rate: string; // 1 单位 from = rate 单位 to
  from: Currency;
  to: Currency;
};

export type ExchangeResult = {
  converted: number;
  rate: number;
  reverseRate: number;
};

export type ExchangeCalcResult =
  | { ok: true; value: ExchangeResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateExchange(input: ExchangeInput): ExchangeCalcResult {
  const a = validateNumber(input.amount);
  if (!a.ok) return a;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  if (r.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "汇率须大于 0" },
    };
  const converted = a.value * r.value;
  const reverseRate = 1 / r.value;
  return { ok: true, value: { converted, rate: r.value, reverseRate } };
}

export function formatExchange(value: ExchangeResult, targetSymbol: string) {
  return {
    converted: targetSymbol + formatResult(value.converted),
    rate: formatResult(value.rate),
    reverseRate: formatResult(value.reverseRate),
  };
}
