// 通用贷款计算器（消费贷 / 车贷等）
import { validateNumber, formatResult } from "./_shared";

export type LoanInput = {
  principal: string;
  years: string;
  rate: string;
};

export type LoanResult = {
  monthly: number;
  totalPayment: number;
  totalInterest: number;
};

export type LoanCalcResult =
  | { ok: true; value: LoanResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateLoan(input: LoanInput): LoanCalcResult {
  const p = validateNumber(input.principal);
  if (!p.ok) return p;
  const y = validateNumber(input.years);
  if (!y.ok) return y;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  if (p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "贷款本金须大于 0" },
    };
  if (!Number.isInteger(y.value) || y.value <= 0 || y.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年限须为 1-30 的整数" },
    };
  }
  if (r.value < 0 || r.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年利率须在 0-30% 之间" },
    };
  }
  const months = y.value * 12;
  const mr = r.value / 100 / 12;
  let monthly: number;
  if (mr === 0) monthly = p.value / months;
  else {
    const f = Math.pow(1 + mr, months);
    monthly = (p.value * mr * f) / (f - 1);
  }
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - p.value;
  return { ok: true, value: { monthly, totalPayment, totalInterest } };
}

export function formatLoan(value: LoanResult) {
  return {
    monthly: "¥" + formatResult(value.monthly),
    totalPayment: "¥" + formatResult(value.totalPayment),
    totalInterest: "¥" + formatResult(value.totalInterest),
  };
}
