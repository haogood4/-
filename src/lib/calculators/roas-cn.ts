import { validateNumber, formatResult } from "./_shared";
export type RoasInput = { adCost: string; revenue: string; profitRate: string };
export type RoasResult = { roas: number; roi: number };
export type RoasCalcResult =
  | { ok: true; value: RoasResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateRoas(input: RoasInput): RoasCalcResult {
  const a = validateNumber(input.adCost);
  if (!a.ok) return a;
  const r = validateNumber(input.revenue);
  if (!r.ok) return r;
  const p = validateNumber(input.profitRate);
  if (!p.ok) return p;
  if (a.value <= 0 || r.value < 0 || p.value < 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法" },
    };
  const roas = r.value / a.value;
  const roi = (r.value * p.value) / 100 / a.value;
  return { ok: true, value: { roas, roi } };
}
export function formatRoas(value: RoasResult) {
  return {
    roas: formatResult(value.roas),
    roi: formatResult(value.roi * 100) + "%",
  };
}
