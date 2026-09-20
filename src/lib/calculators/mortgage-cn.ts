// 房贷计算器（中国大陆口径）
// 等额本息 / 等额本金 两种还款方式
import { validateNumber, formatResult, type SharedErrorCode } from "./_shared";

export type RepayType = "equal-installment" | "equal-principal";

export type MortgageInput = {
  principal: string;
  years: string;
  rate: string; // 年利率 %
  type: RepayType;
};

export type MortgageResult = {
  monthlyFirst: number; // 首月月供
  monthlyDecrease?: number; // 等额本金每月递减
  totalPayment: number;
  totalInterest: number;
  totalMonths: number;
};

export type MortgageError = {
  code: SharedErrorCode | "OVER_LIMIT";
  message: string;
};
export type MortgageResult2 =
  { ok: true; value: MortgageResult } | { ok: false; error: MortgageError };

export function calculateMortgage(input: MortgageInput): MortgageResult2 {
  const p = validateNumber(input.principal);
  if (!p.ok) return p;
  const y = validateNumber(input.years);
  if (!y.ok) return y;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  if (!Number.isInteger(y.value) || y.value <= 0 || y.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年限须为 1-30 的整数" },
    };
  }
  if (p.value <= 0) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "贷款本金须大于 0" },
    };
  }
  if (r.value < 0 || r.value > 20) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年利率须在 0-20% 之间" },
    };
  }
  const months = y.value * 12;
  const monthlyRate = r.value / 100 / 12;
  let monthlyFirst: number;
  let totalPayment: number;
  let totalInterest: number;
  let monthlyDecrease: number | undefined;
  if (input.type === "equal-installment") {
    // 等额本息：M = P * [r(1+r)^n] / [(1+r)^n - 1]
    if (monthlyRate === 0) {
      monthlyFirst = p.value / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      monthlyFirst = (p.value * monthlyRate * factor) / (factor - 1);
    }
    totalPayment = monthlyFirst * months;
    totalInterest = totalPayment - p.value;
  } else {
    // 等额本金：每月本金固定，利息按剩余本金计算
    const principalPerMonth = p.value / months;
    // 首月利息 = P * 月利率
    const firstInterest = p.value * monthlyRate;
    monthlyFirst = principalPerMonth + firstInterest;
    // 每月递减 = 本金/月份 * 月利率
    monthlyDecrease = principalPerMonth * monthlyRate;
    // 总利息 = (P / n) * [2P + (n-1)P*r/12] / 2 = P*n/2 * 月利率 + (n-1)*P/2 * 月利率/n
    // 标准公式：总利息 = (P / n) * [n*r + 1] / 2 * (n+1)? 简化：每期利息之和
    // 等额本金总利息 = P * 月利率 * (n+1) / 2
    totalInterest = (p.value * monthlyRate * (months + 1)) / 2;
    totalPayment = p.value + totalInterest;
  }
  return {
    ok: true,
    value: {
      monthlyFirst,
      monthlyDecrease,
      totalPayment,
      totalInterest,
      totalMonths: months,
    },
  };
}

export function formatMortgage(value: MortgageResult): {
  monthlyFirst: string;
  monthlyDecrease?: string;
  totalPayment: string;
  totalInterest: string;
} {
  return {
    monthlyFirst: "¥" + formatResult(value.monthlyFirst),
    monthlyDecrease:
      value.monthlyDecrease !== undefined
        ? "¥" + formatResult(value.monthlyDecrease)
        : undefined,
    totalPayment: "¥" + formatResult(value.totalPayment),
    totalInterest: "¥" + formatResult(value.totalInterest),
  };
}
