import { validateNumber, formatResult } from "./_shared";
export type CalorieInput = { weight: string; minutes: string; met: string };
export type CalorieResult = { kcal: number };
export type CalorieCalcResult =
  | { ok: true; value: CalorieResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateCalorie(input: CalorieInput): CalorieCalcResult {
  const w = validateNumber(input.weight);
  if (!w.ok) return w;
  const m = validateNumber(input.minutes);
  if (!m.ok) return m;
  const met = validateNumber(input.met);
  if (!met.ok) return met;
  if (w.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "体重大于 0" },
    };
  if (m.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "时长大于 0" },
    };
  if (met.value <= 0 || met.value > 20)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "MET 须 0-20" },
    };
  // kcal = MET × 3.5 × kg / 200 × min（简化公式）
  const kcal = ((met.value * 3.5 * w.value) / 200) * m.value;
  return { ok: true, value: { kcal } };
}
export function formatCalorie(value: CalorieResult) {
  return { kcal: formatResult(value.kcal) + " kcal" };
}
