import { validateNumber, formatResult } from "./_shared";
export type PaceInput = {
  distance: string;
  hours: string;
  minutes: string;
  seconds: string;
};
export type PaceResult = { pacePerKm: string; speedKmh: number };
export type PaceCalcResult =
  | { ok: true; value: PaceResult }
  | { ok: false; error: { code: string; message: string } };
export function calculatePace(input: PaceInput): PaceCalcResult {
  const d = validateNumber(input.distance);
  if (!d.ok) return d;
  const h = validateNumber(input.hours);
  if (!h.ok) return h;
  const m = validateNumber(input.minutes);
  if (!m.ok) return m;
  const s = validateNumber(input.seconds);
  if (!s.ok) return s;
  if (d.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "距离须大于 0" },
    };
  if (h.value < 0 || m.value < 0 || s.value < 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "时间不能为负" },
    };
  const totalSec = h.value * 3600 + m.value * 60 + s.value;
  if (totalSec === 0)
    return { ok: false, error: { code: "EMPTY", message: "请输入时间" } };
  const secPerKm = totalSec / d.value;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm - min * 60);
  const pacePerKm = min + "'" + (sec < 10 ? "0" + sec : sec) + '"';
  const speedKmh = d.value / (totalSec / 3600);
  return { ok: true, value: { pacePerKm, speedKmh } };
}
export function formatPace(value: PaceResult) {
  return {
    pacePerKm: value.pacePerKm + " /km",
    speedKmh: formatResult(value.speedKmh) + " km/h",
  };
}
