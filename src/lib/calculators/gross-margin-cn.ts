import { validateNumber, formatResult } from "./_shared";
export type GrossMarginInput = { revenue: string; cost: string };
export type GrossMarginResult = { gross: number; margin: number };
export type GrossMarginCalcResult =
  | { ok: true; value: GrossMarginResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateGrossMargin(
  input: GrossMarginInput,
): GrossMarginCalcResult {
  const r = validateNumber(input.revenue);
  if (!r.ok) return r;
  const c = validateNumber(input.cost);
  if (!c.ok) return c;
  if (r.value <= 0 || c.value < 0 || c.value >= r.value)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法（成本 < 营收）" },
    };
  const gross = r.value - c.value;
  const margin = gross / r.value;
  return { ok: true, value: { gross, margin } };
}
export function formatGrossMargin(value: GrossMarginResult) {
  return {
    gross: formatResult(value.gross),
    margin: formatResult(value.margin * 100) + "%",
  };
}
