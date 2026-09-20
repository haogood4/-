// 信用卡分期计算器（按月手续费率换算实际年化）
import { validateNumber, formatResult } from "./_shared";

export type CreditInput = {
  principal: string;
  monthlyRate: string; // 月手续费率 %
  months: string;
};

export type CreditResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalFee: number;
  effectiveAnnualRate: number;
};

export type CreditCalcResult =
  | { ok: true; value: CreditResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateCredit(input: CreditInput): CreditCalcResult {
  const p = validateNumber(input.principal);
  if (!p.ok) return p;
  const r = validateNumber(input.monthlyRate);
  if (!r.ok) return r;
  const m = validateNumber(input.months);
  if (!m.ok) return m;
  if (p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "本金须大于 0" },
    };
  if (r.value < 0 || r.value > 5)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "月手续费率须 0-5%" },
    };
  if (!Number.isInteger(m.value) || m.value < 1 || m.value > 60) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "期数须为 1-60 的整数" },
    };
  }
  const monthlyFee = (p.value * r.value) / 100;
  const monthlyPrincipal = p.value / m.value;
  const monthlyPayment = monthlyPrincipal + monthlyFee;
  const totalFee = monthlyFee * m.value;
  const totalPayment = p.value + totalFee;
  // 实际年化（IRR 近似）：用简化公式 EAR ≈ 2 * m / (n + 1) * 12
  const effectiveAnnualRate = (r.value * 24 * m.value) / (m.value + 1);
  return {
    ok: true,
    value: { monthlyPayment, totalPayment, totalFee, effectiveAnnualRate },
  };
}

export function formatCredit(value: CreditResult) {
  return {
    monthlyPayment: "¥" + formatResult(value.monthlyPayment),
    totalPayment: "¥" + formatResult(value.totalPayment),
    totalFee: "¥" + formatResult(value.totalFee),
    effectiveAnnualRate: formatResult(value.effectiveAnnualRate) + "%",
  };
}
