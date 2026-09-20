import { validateNumber, formatResult } from "./_shared";
export type CvrInput = { visits: string; conversions: string };
export type CvrResult = { cvr: number };
export type CvrCalcResult =
  | { ok: true; value: CvrResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateCvr(input: CvrInput): CvrCalcResult {
  const v = validateNumber(input.visits);
  if (!v.ok) return v;
  const c = validateNumber(input.conversions);
  if (!c.ok) return c;
  if (v.value <= 0 || c.value < 0 || c.value > v.value)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "转化数须 ≤ 访客数" },
    };
  return { ok: true, value: { cvr: c.value / v.value } };
}
export function formatCvr(value: CvrResult) {
  return { cvr: formatResult(value.cvr * 100) + "%" };
}
