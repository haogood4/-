import { validateNumber, formatResult } from "./_shared";
export type TurtleInput = {
  accountEquity: string;
  atr: string;
  riskPercent: string;
  entryPrice: string;
};
export type TurtleResult = {
  unitSize: number;
  totalUnits: number;
  stopLoss: number;
};
export type TurtleCalcResult =
  | { ok: true; value: TurtleResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateTurtle(input: TurtleInput): TurtleCalcResult {
  const e = validateNumber(input.accountEquity);
  if (!e.ok) return e;
  const a = validateNumber(input.atr);
  if (!a.ok) return a;
  const r = validateNumber(input.riskPercent);
  if (!r.ok) return r;
  const p = validateNumber(input.entryPrice);
  if (!p.ok) return p;
  if (e.value <= 0 || a.value <= 0 || r.value <= 0 || p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须大于 0" },
    };
  const dollarRisk = (e.value * r.value) / 100;
  const unitSize = dollarRisk / (2 * a.value);
  const totalUnits = Math.floor(unitSize);
  const stopLoss = p.value - 2 * a.value;
  return { ok: true, value: { unitSize, totalUnits, stopLoss } };
}
export function formatTurtle(value: TurtleResult) {
  return {
    unitSize: formatResult(value.unitSize) + " 单位",
    totalUnits: String(value.totalUnits) + " 单位",
    stopLoss: formatResult(value.stopLoss),
  };
}
