import { validateNumber, formatResult } from "./_shared";
function cdf(x: number): number {
  // 标准正态分布 CDF（Abramowitz & Stegun 近似）
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
export type OptionInput = {
  spot: string;
  strike: string;
  rate: string;
  vol: string;
  time: string;
  type: "call" | "put";
};
export type OptionResult = { price: number; d1: number; d2: number };
export type OptionCalcResult =
  | { ok: true; value: OptionResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateOption(input: OptionInput): OptionCalcResult {
  const s = validateNumber(input.spot);
  if (!s.ok) return s;
  const k = validateNumber(input.strike);
  if (!k.ok) return k;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  const v = validateNumber(input.vol);
  if (!v.ok) return v;
  const t = validateNumber(input.time);
  if (!t.ok) return t;
  if (s.value <= 0 || k.value <= 0 || v.value <= 0 || t.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须大于 0" },
    };
  const rDec = r.value / 100;
  const vDec = v.value / 100;
  const d1 =
    (Math.log(s.value / k.value) + (rDec + (vDec * vDec) / 2) * t.value) /
    (vDec * Math.sqrt(t.value));
  const d2 = d1 - vDec * Math.sqrt(t.value);
  const call =
    s.value * cdf(d1) - k.value * Math.exp(-rDec * t.value) * cdf(d2);
  const put =
    k.value * Math.exp(-rDec * t.value) * cdf(-d2) - s.value * cdf(-d1);
  return {
    ok: true,
    value: { price: input.type === "call" ? call : put, d1, d2 },
  };
}
export function formatOption(value: OptionResult) {
  return {
    price: formatResult(value.price),
    d1: formatResult(value.d1),
    d2: formatResult(value.d2),
  };
}
