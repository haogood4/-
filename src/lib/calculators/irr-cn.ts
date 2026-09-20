// IRR 内部收益率（Newton-Raphson）
import { validateNumber, formatResult } from "./_shared";

const MAX_ITER = 100;
const EPSILON = 1e-7;

export function calculateIrr(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null;
  let rate = 0.1;
  for (let i = 0; i < MAX_ITER; i++) {
    let npv = 0;
    let dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashflows[t]! / denom;
      if (t > 0) dnpv += (-t * cashflows[t]!) / ((1 + rate) * denom);
    }
    if (Math.abs(dnpv) < 1e-12) return null;
    const newRate = rate - npv / dnpv;
    if (!Number.isFinite(newRate)) return null;
    if (Math.abs(newRate - rate) < EPSILON) return newRate;
    rate = newRate;
  }
  return null;
}

export function parseCashflows(input: string): number[] | { error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { error: "请输入现金流序列" };
  const parts = trimmed.split(/[,\s\n]+/).filter(Boolean);
  if (parts.length < 2) return { error: "至少需要 2 期现金流" };
  const nums: number[] = [];
  for (const p of parts) {
    const v = validateNumber(p);
    if (!v.ok) return { error: `无效输入：${p}` };
    nums.push(v.value);
  }
  return nums;
}

export type IrrResult =
  | { ok: true; value: number }
  | { ok: false; error: { code: string; message: string } };

export function calculateIrrFromInput(input: string): IrrResult {
  const parsed = parseCashflows(input);
  if ("error" in parsed)
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: parsed.error },
    };
  if (parsed[0]! >= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "第 1 期现金流须为负（投资）" },
    };
  const irr = calculateIrr(parsed);
  if (irr === null)
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: "无法求解 IRR（现金流序列无解）",
      },
    };
  return { ok: true, value: irr };
}

export function formatIrr(value: number): string {
  return formatResult(value * 100) + "%";
}
