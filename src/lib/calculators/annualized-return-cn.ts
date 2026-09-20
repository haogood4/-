// 年化收益率计算器
import { validateNumber, formatResult } from "./_shared";

export type ReturnInput = {
  totalReturn: string; // 总收益 %
  days: string;
};

export type ReturnCalcResult =
  | { ok: true; value: number }
  | { ok: false; error: { code: string; message: string } };

export function calculateAnnualizedReturn(
  input: ReturnInput,
): ReturnCalcResult {
  const t = validateNumber(input.totalReturn);
  if (!t.ok) return t;
  const d = validateNumber(input.days);
  if (!d.ok) return d;
  if (d.value <= 0 || d.value > 3650)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "持有天数须 1-3650" },
    };
  const totalRate = t.value / 100;
  const years = d.value / 365;
  const annualized = (Math.pow(1 + totalRate, 1 / years) - 1) * 100;
  return { ok: true, value: annualized };
}

export function formatAnnualizedReturn(value: number): string {
  return formatResult(value) + "%";
}
