import { validateNumber, formatResult } from "./_shared";
export type FuturesInput = {
  price: string;
  lots: string;
  multiplier: string;
  marginRate: string;
};
export type FuturesResult = { margin: number; value: number };
export type FuturesCalcResult =
  | { ok: true; value: FuturesResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateFutures(input: FuturesInput): FuturesCalcResult {
  const p = validateNumber(input.price);
  if (!p.ok) return p;
  const l = validateNumber(input.lots);
  if (!l.ok) return l;
  const m = validateNumber(input.multiplier);
  if (!m.ok) return m;
  const r = validateNumber(input.marginRate);
  if (!r.ok) return r;
  if (
    p.value <= 0 ||
    l.value <= 0 ||
    m.value <= 0 ||
    r.value <= 0 ||
    r.value > 100
  )
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法" },
    };
  const value = p.value * l.value * m.value;
  const margin = (value * r.value) / 100;
  return { ok: true, value: { margin, value } };
}
export function formatFutures(value: FuturesResult) {
  return {
    margin: formatResult(value.margin),
    value: formatResult(value.value),
  };
}
