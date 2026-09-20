// 基金定投（DCA）计算器：每月定额投入，按年化收益率复利
import { validateNumber, formatResult } from "./_shared";

export type DcaInput = {
  monthly: string;
  rate: string; // 年化 %
  years: string;
};

export type DcaResult = {
  totalInvest: number;
  totalValue: number;
  totalGain: number;
};

export type DcaCalcResult =
  | { ok: true; value: DcaResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateDca(input: DcaInput): DcaCalcResult {
  const m = validateNumber(input.monthly);
  if (!m.ok) return m;
  const r = validateNumber(input.rate);
  if (!r.ok) return r;
  const y = validateNumber(input.years);
  if (!y.ok) return y;
  if (m.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "月投金额须大于 0" },
    };
  if (r.value < -50 || r.value > 50)
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: "年化收益率须在 -50% ~ 50% 之间",
      },
    };
  if (!Number.isInteger(y.value) || y.value <= 0 || y.value > 50) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "年限须为 1-50 的整数" },
    };
  }
  const months = y.value * 12;
  const mr = r.value / 100 / 12;
  let fv: number;
  if (mr === 0) {
    fv = m.value * months;
  } else {
    fv = m.value * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr);
  }
  const totalInvest = m.value * months;
  const totalGain = fv - totalInvest;
  return { ok: true, value: { totalInvest, totalValue: fv, totalGain } };
}

export function formatDca(value: DcaResult) {
  return {
    totalInvest: "¥" + formatResult(value.totalInvest),
    totalValue: "¥" + formatResult(value.totalValue),
    totalGain: "¥" + formatResult(value.totalGain),
  };
}
