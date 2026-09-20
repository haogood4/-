// 提前还款计算器（中国大陆口径）
// 等额本息贷款已还 N 期后一次性提前还款 X 元，对比两种方案：
// 方案 A：月供基本不变，缩短剩余年限；方案 B：年限不变，重算降低月供
import { validateNumber, formatResult, type SharedErrorCode } from "./_shared";

export type PrepaymentInput = {
  principal: string; // 贷款本金 ¥
  years: string; // 贷款年限
  rate: string; // 年利率 %
  paidMonths: string; // 已还期数 N
  prepay: string; // 提前还款金额 X
};

export type PrepaymentPlan = {
  monthly: number; // 新月供（方案 A 维持原月供，最后一期为尾款）
  months: number; // 剩余期数
  totalInterest: number; // 剩余还款期总利息
  savedInterest: number; // 相比不提前还款节省的利息
};

export type PrepaymentResult = {
  originalMonthly: number; // 原月供
  balance: number; // 已还 N 期后的剩余本金
  newPrincipal: number; // 提前还款后的剩余本金
  baselineInterest: number; // 不提前还款的剩余利息
  planA: PrepaymentPlan; // 缩短年限
  planB: PrepaymentPlan; // 降低月供
};

export type PrepaymentError = {
  code: SharedErrorCode | "OVER_LIMIT";
  message: string;
};
export type PrepaymentResult2 =
  { ok: true; value: PrepaymentResult } | { ok: false; error: PrepaymentError };

// 等额本息月供：M = P·i·(1+i)^n / ((1+i)^n − 1)；利率为 0 时退化为均摊
function annuityMonthly(p: number, i: number, n: number): number {
  if (i === 0) return p / n;
  const f = Math.pow(1 + i, n);
  return (p * i * f) / (f - 1);
}

export function calculatePrepayment(input: PrepaymentInput): PrepaymentResult2 {
  const p = validateNumber(input.principal);
  if (!p.ok) return p;
  const y = validateNumber(input.years);
  if (!y.ok) return y;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  const k = validateNumber(input.paidMonths);
  if (!k.ok) return k;
  const x = validateNumber(input.prepay);
  if (!x.ok) return x;
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
  if (!Number.isInteger(k.value) || k.value < 0 || k.value >= months) {
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: `已还期数须为 0-${months - 1} 的整数`,
      },
    };
  }
  if (x.value < 0) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "提前还款金额不能为负数" },
    };
  }
  const i = r.value / 100 / 12;
  const originalMonthly = annuityMonthly(p.value, i, months);
  // 已还 k 期后的剩余本金：B = P(1+i)^k − M((1+i)^k − 1)/i
  const f = Math.pow(1 + i, k.value);
  const balance =
    i === 0
      ? p.value - originalMonthly * k.value
      : p.value * f - (originalMonthly * (f - 1)) / i;
  if (x.value >= balance) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "提前还款金额须小于剩余本金" },
    };
  }
  const newPrincipal = balance - x.value;
  const remaining = months - k.value;
  const baselineInterest = originalMonthly * remaining - balance;
  // 方案 A：月供维持原值 M，逐期模拟摊还，缩短剩余期数（最后一期为尾款）
  let bal = newPrincipal;
  let paid = 0;
  let monthsA = 0;
  while (bal > 0.005 && monthsA < 1200) {
    const due = bal + bal * i;
    if (due <= originalMonthly) {
      paid += due;
      monthsA += 1;
      break;
    }
    paid += originalMonthly;
    bal = due - originalMonthly;
    monthsA += 1;
  }
  const interestA = paid - newPrincipal;
  // 方案 B：剩余期数不变，按新本金重算月供
  const monthlyB = annuityMonthly(newPrincipal, i, remaining);
  const interestB = monthlyB * remaining - newPrincipal;
  return {
    ok: true,
    value: {
      originalMonthly,
      balance,
      newPrincipal,
      baselineInterest,
      planA: {
        monthly: originalMonthly,
        months: monthsA,
        totalInterest: interestA,
        savedInterest: baselineInterest - interestA,
      },
      planB: {
        monthly: monthlyB,
        months: remaining,
        totalInterest: interestB,
        savedInterest: baselineInterest - interestB,
      },
    },
  };
}

export function formatPrepayment(value: PrepaymentResult): {
  originalMonthly: string;
  balance: string;
  newPrincipal: string;
  planA: { monthly: string; totalInterest: string; savedInterest: string };
  planB: { monthly: string; totalInterest: string; savedInterest: string };
} {
  const money = (n: number) => "¥" + formatResult(n);
  return {
    originalMonthly: money(value.originalMonthly),
    balance: money(value.balance),
    newPrincipal: money(value.newPrincipal),
    planA: {
      monthly: money(value.planA.monthly),
      totalInterest: money(value.planA.totalInterest),
      savedInterest: money(value.planA.savedInterest),
    },
    planB: {
      monthly: money(value.planB.monthly),
      totalInterest: money(value.planB.totalInterest),
      savedInterest: money(value.planB.savedInterest),
    },
  };
}
