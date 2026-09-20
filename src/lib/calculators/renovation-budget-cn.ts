// 装修预算计算器
import { validateNumber, formatResult } from "./_shared";

export type RenoInput = {
  area: string; // 面积 m²
  perSqm: string; // 单价 元/m²
};

export type RenoResult = { total: number; hard: number; soft: number };
export type RenoCalcResult =
  | { ok: true; value: RenoResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateReno(input: RenoInput): RenoCalcResult {
  const a = validateNumber(input.area);
  if (!a.ok) return a;
  const p = validateNumber(input.perSqm);
  if (!p.ok) return p;
  if (a.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "面积须大于 0" },
    };
  if (p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "单价须大于 0" },
    };
  const total = a.value * p.value;
  // 经验比例：硬装 60% / 软装 40%
  const hard = total * 0.6;
  const soft = total * 0.4;
  return { ok: true, value: { total, hard, soft } };
}

export function formatReno(value: RenoResult) {
  return {
    total: "¥" + formatResult(value.total),
    hard: "¥" + formatResult(value.hard),
    soft: "¥" + formatResult(value.soft),
  };
}
