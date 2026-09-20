// 养老金计算器（简化估算）
import { validateNumber, formatResult } from "./_shared";

export type PensionInput = {
  currentAge: string;
  retireAge: string;
  monthlySalary: string;
  cityAvgSalary: string; // 当地社平工资
};

export type PensionResult = {
  monthlyPension: number;
  accountTotal: number;
};

export type PensionCalcResult =
  | { ok: true; value: PensionResult }
  | { ok: false; error: { code: string; message: string } };

export function calculatePension(input: PensionInput): PensionCalcResult {
  const c = validateNumber(input.currentAge);
  if (!c.ok) return c;
  const r = validateNumber(input.retireAge);
  if (!r.ok) return r;
  const s = validateNumber(input.monthlySalary);
  if (!s.ok) return s;
  const a = validateNumber(input.cityAvgSalary);
  if (!a.ok) return a;
  if (c.value < 18 || c.value > 70)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "当前年龄须 18-70" },
    };
  if (r.value <= c.value || r.value > 70)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "退休年龄须大于当前年龄且 ≤ 70" },
    };
  if (s.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "月薪须大于 0" },
    };
  if (a.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "社平工资须大于 0" },
    };
  const years = r.value - c.value;
  // 简化：个人账户累计 = 月薪 × 8% × 12 × 工作年限；基础养老金 = (个人月均缴费基数 + 社平) / 2 × 1% × 年限
  const accountTotal = s.value * 0.08 * 12 * years;
  const baseMonthly = ((s.value + a.value) / 2) * 0.01 * years * 12;
  const monthlyPension = baseMonthly + (accountTotal * 0.01) / 139; // 个人账户按 139 个月领
  return { ok: true, value: { monthlyPension, accountTotal } };
}

export function formatPension(value: PensionResult) {
  return {
    monthlyPension: "¥" + formatResult(value.monthlyPension),
    accountTotal: "¥" + formatResult(value.accountTotal),
  };
}
