import { validateNumber, formatResult } from "./_shared";
export type BreakEvenInput = {
  fixedCost: string;
  pricePerUnit: string;
  variablePerUnit: string;
};
export type BreakEvenResult = { units: number; revenue: number };
export type BreakEvenCalcResult =
  | { ok: true; value: BreakEvenResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateBreakEven(input: BreakEvenInput): BreakEvenCalcResult {
  const f = validateNumber(input.fixedCost);
  if (!f.ok) return f;
  const p = validateNumber(input.pricePerUnit);
  if (!p.ok) return p;
  const v = validateNumber(input.variablePerUnit);
  if (!v.ok) return v;
  if (f.value < 0 || p.value <= 0 || v.value < 0 || v.value >= p.value)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "单价须大于变动成本" },
    };
  const contribution = p.value - v.value;
  const units = Math.ceil(f.value / contribution);
  const revenue = units * p.value;
  return { ok: true, value: { units, revenue } };
}
export function formatBreakEven(value: BreakEvenResult) {
  return {
    units: String(value.units) + " 件",
    revenue: formatResult(value.revenue),
  };
}
