// 存款利息计算器（到期本息）
import { validateNumber, formatResult } from "./_shared";

export type DepositInput = {
  principal: string;
  rate: string; // 年利率 %
  years: string;
  type: "compound" | "simple";
};

export type DepositResult = {
  total: number;
  interest: number;
};

export type DepositCalcResult =
  | { ok: true; value: DepositResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateDeposit(input: DepositInput): DepositCalcResult {
  const p = validateNumber(input.principal);
  if (!p.ok) return p;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  const y = validateNumber(input.years);
  if (!y.ok) return y;
  if (p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "本金须大于 0" },
    };
  if (r.value < 0 || r.value > 20)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年利率须在 0-20%" },
    };
  if (!Number.isInteger(y.value) || y.value <= 0 || y.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年限须为 1-30 的整数" },
    };
  }
  let total: number;
  if (input.type === "compound") {
    total = p.value * Math.pow(1 + r.value / 100, y.value);
  } else {
    total = p.value * (1 + (r.value / 100) * y.value);
  }
  return { ok: true, value: { total, interest: total - p.value } };
}

export function formatDeposit(value: DepositResult) {
  return {
    total: "¥" + formatResult(value.total),
    interest: "¥" + formatResult(value.interest),
  };
}
