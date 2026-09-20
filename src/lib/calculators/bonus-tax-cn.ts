// 年终奖个税计算器（单独计税）
import { validateNumber, formatResult } from "./_shared";

// 全月一次性奖金税率表（按月换算）
const BONUS_BRACKETS: Array<{
  upTo: number;
  rate: number;
  quickDeduct: number;
}> = [
  { upTo: 3000, rate: 0.03, quickDeduct: 0 },
  { upTo: 12000, rate: 0.1, quickDeduct: 210 },
  { upTo: 25000, rate: 0.2, quickDeduct: 1410 },
  { upTo: 35000, rate: 0.25, quickDeduct: 2660 },
  { upTo: 55000, rate: 0.3, quickDeduct: 4410 },
  { upTo: 80000, rate: 0.35, quickDeduct: 7160 },
  { upTo: Infinity, rate: 0.45, quickDeduct: 15160 },
];

export function calculateBonusTax(bonus: number): number {
  if (bonus <= 0) return 0;
  // 全月应纳税所得额 = bonus / 12
  const monthlyTaxable = bonus / 12;
  const bracket = BONUS_BRACKETS.find((b) => monthlyTaxable <= b.upTo);
  if (!bracket) return 0;
  return bonus * bracket.rate - bracket.quickDeduct;
}

export type BonusInput = { bonus: string };

export type BonusCalcResult =
  | { ok: true; value: { bonus: number; tax: number; afterTax: number } }
  | { ok: false; error: { code: string; message: string } };

export function calculateBonus(input: BonusInput): BonusCalcResult {
  const b = validateNumber(input.bonus);
  if (!b.ok) return b;
  if (b.value < 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年终奖不能为负" },
    };
  const tax = calculateBonusTax(b.value);
  return { ok: true, value: { bonus: b.value, tax, afterTax: b.value - tax } };
}

export function formatBonus(value: {
  bonus: number;
  tax: number;
  afterTax: number;
}) {
  return {
    bonus: "¥" + formatResult(value.bonus),
    tax: "¥" + formatResult(value.tax),
    afterTax: "¥" + formatResult(value.afterTax),
  };
}
