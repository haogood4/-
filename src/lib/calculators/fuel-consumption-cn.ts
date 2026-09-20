// 油耗计算器
import { validateNumber, formatResult } from "./_shared";

export type FuelInput = {
  distance: string; // km
  fuel: string; // L
};

export type FuelResult = { perHundred: number; perKm: number };
export type FuelCalcResult =
  | { ok: true; value: FuelResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateFuel(input: FuelInput): FuelCalcResult {
  const d = validateNumber(input.distance);
  if (!d.ok) return d;
  const f = validateNumber(input.fuel);
  if (!f.ok) return f;
  if (d.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "里程须大于 0" },
    };
  if (f.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "油量须大于 0" },
    };
  const perHundred = (f.value / d.value) * 100;
  const perKm = f.value / d.value;
  return { ok: true, value: { perHundred, perKm } };
}

export function formatFuel(value: FuelResult) {
  return {
    perHundred: formatResult(value.perHundred) + " L/100km",
    perKm: formatResult(value.perKm) + " L/km",
  };
}
