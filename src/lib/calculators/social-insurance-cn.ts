// 五险一金计算器（多城市费率）
import { validateNumber, formatResult } from "./_shared";

export type City =
  "beijing" | "shanghai" | "shenzhen" | "guangzhou" | "hangzhou";

const RATES: Record<
  City,
  {
    pension: number; // 养老个人
    medical: number; // 医疗个人
    unemployment: number; // 失业个人
    housingFund: number; // 公积金个人
    name: string;
  }
> = {
  beijing: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.12,
    name: "北京",
  },
  shanghai: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.07,
    name: "上海",
  },
  shenzhen: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.05,
    name: "深圳",
  },
  guangzhou: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.1,
    name: "广州",
  },
  hangzhou: {
    pension: 0.08,
    medical: 0.02,
    unemployment: 0.005,
    housingFund: 0.12,
    name: "杭州",
  },
};

export type SiInput = {
  monthlySalary: string;
  city: City;
};

export type SiResult = {
  pension: number;
  medical: number;
  unemployment: number;
  housingFund: number;
  total: number;
  company: number;
  cityName: string;
};

export type SiCalcResult =
  | { ok: true; value: SiResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateSocialInsurance(input: SiInput): SiCalcResult {
  const salary = validateNumber(input.monthlySalary);
  if (!salary.ok) return salary;
  if (salary.value < 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "月薪不能为负" },
    };
  const r = RATES[input.city];
  if (!r)
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "不支持的城市" },
    };
  // 缴费基数上下限（简化：使用月薪作基数，未做 cap）
  const base = salary.value;
  const pension = base * r.pension;
  const medical = base * r.medical;
  const unemployment = base * r.unemployment;
  const housingFund = base * r.housingFund;
  const total = pension + medical + unemployment + housingFund;
  // 公司部分：养老 16% + 医疗 8-9% + 失业 0.5% + 公积金 同个人
  const company =
    base *
    (0.16 + (input.city === "beijing" ? 0.09 : 0.085) + 0.005 + r.housingFund);
  return {
    ok: true,
    value: {
      pension,
      medical,
      unemployment,
      housingFund,
      total,
      company,
      cityName: r.name,
    },
  };
}

export function formatSocialInsurance(value: SiResult) {
  return {
    pension: "¥" + formatResult(value.pension),
    medical: "¥" + formatResult(value.medical),
    unemployment: "¥" + formatResult(value.unemployment),
    housingFund: "¥" + formatResult(value.housingFund),
    total: "¥" + formatResult(value.total),
    company: "¥" + formatResult(value.company),
  };
}
