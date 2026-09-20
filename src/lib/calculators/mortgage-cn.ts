// 房贷计算器（中国大陆口径）
// 等额本息 / 等额本金 两种还款方式
import { validateNumber, formatResult, type SharedErrorCode } from "./_shared";

export type RepayType = "equal-installment" | "equal-principal";

export type MortgageScheduleRow = {
  month: number;
  payment: number; // 月供（含本金+利息）
  principal: number; // 当月还本金
  interest: number; // 当月还利息
  balance: number; // 当月末剩余本金
};

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
  schedule: MortgageScheduleRow[]; // 外部实现：月供明细（默认前 12 期）
};

export type MortgageError = {
  code: SharedErrorCode | "OVER_LIMIT";
  message: string;
};
export type MortgageResult2 =
  { ok: true; value: MortgageResult } | { ok: false; error: MortgageError };

// schedule 默认行数：12 期（外部实现展示前 12 期表格）
const SCHEDULE_PREVIEW_ROWS = 12;

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
  const schedule: MortgageScheduleRow[] = [];

  if (input.type === "equal-installment") {
    // 等额本息：M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let mp: number;
    if (monthlyRate === 0) {
      mp = p.value / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      mp = (p.value * monthlyRate * factor) / (factor - 1);
    }
    monthlyFirst = mp;
    totalPayment = mp * months;
    totalInterest = totalPayment - p.value;
    let bal = p.value;
    for (let m = 1; m <= months; m++) {
      const interest = bal * monthlyRate;
      const payP = mp - interest;
      bal -= payP;
      if (m <= SCHEDULE_PREVIEW_ROWS) {
        schedule.push({
          month: m,
          payment: mp,
          principal: payP,
          interest,
          balance: Math.max(bal, 0),
        });
      }
    }
  } else {
    // 等额本金：每月本金固定，利息按剩余本金计算
    const principalPerMonth = p.value / months;
    const firstInterest = p.value * monthlyRate;
    monthlyFirst = principalPerMonth + firstInterest;
    monthlyDecrease = principalPerMonth * monthlyRate;
    totalInterest = (p.value * monthlyRate * (months + 1)) / 2;
    totalPayment = p.value + totalInterest;
    let bal = p.value;
    for (let m = 1; m <= months; m++) {
      const interest = bal * monthlyRate;
      const mp = principalPerMonth + interest;
      bal -= principalPerMonth;
      if (m <= SCHEDULE_PREVIEW_ROWS) {
        schedule.push({
          month: m,
          payment: mp,
          principal: principalPerMonth,
          interest,
          balance: Math.max(bal, 0),
        });
      }
    }
  }
  return {
    ok: true,
    value: {
      monthlyFirst,
      monthlyDecrease,
      totalPayment,
      totalInterest,
      totalMonths: months,
      schedule,
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
