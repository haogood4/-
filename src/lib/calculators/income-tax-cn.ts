// 工资个税计算器（2024 年度累进税率，含 5000 起征点 + 专项附加扣除）
import { validateNumber, formatResult } from "./_shared";

// 综合所得月度税率表（按累计预扣预缴）
const BRACKETS: Array<{ upTo: number; rate: number; quickDeduct: number }> = [
  { upTo: 3000, rate: 0.03, quickDeduct: 0 },
  { upTo: 12000, rate: 0.1, quickDeduct: 210 },
  { upTo: 25000, rate: 0.2, quickDeduct: 1410 },
  { upTo: 35000, rate: 0.25, quickDeduct: 2660 },
  { upTo: 55000, rate: 0.3, quickDeduct: 4410 },
  { upTo: 80000, rate: 0.35, quickDeduct: 7160 },
  { upTo: Infinity, rate: 0.45, quickDeduct: 15160 },
];

export type IncomeTaxInput = {
  monthlySalary: string;
  socialInsurance: string;
  specialDeduction: string;
};

export type IncomeTaxResult = {
  taxable: number;
  tax: number;
  afterTax: number;
  net: number;
  effectiveRate: number;
};

export type IncomeTaxCalcResult =
  | { ok: true; value: IncomeTaxResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxCalcResult {
  const salary = validateNumber(input.monthlySalary);
  if (!salary.ok) return salary;
  const si = validateNumber(input.socialInsurance);
  if (!si.ok) return si;
  const sp = validateNumber(input.specialDeduction);
  if (!sp.ok) return sp;
  if (salary.value < 0 || si.value < 0 || sp.value < 0) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值不能为负" },
    };
  }
  // 月度应纳税所得额 = 月薪 - 5000 - 社保 - 专项附加扣除
  const taxable = salary.value - 5000 - si.value - sp.value;
  if (taxable <= 0) {
    return {
      ok: true,
      value: {
        taxable: 0,
        tax: 0,
        afterTax: salary.value - si.value,
        net: salary.value - si.value,
        effectiveRate: 0,
      },
    };
  }
  const bracket = BRACKETS.find((b) => taxable <= b.upTo)!;
  const tax = taxable * bracket.rate - bracket.quickDeduct;
  const afterTax = salary.value - si.value - tax;
  const effectiveRate = tax / salary.value;
  return {
    ok: true,
    value: { taxable, tax, afterTax, net: afterTax, effectiveRate },
  };
}

export function formatIncomeTax(value: IncomeTaxResult) {
  return {
    taxable: "¥" + formatResult(value.taxable),
    tax: "¥" + formatResult(value.tax),
    afterTax: "¥" + formatResult(value.afterTax),
    effectiveRate: formatResult(value.effectiveRate * 100) + "%",
  };
}
