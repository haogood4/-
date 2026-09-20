// 公积金贷款计算器（等额本息）
// 政策依据：央行 2025-05-08 起施行的个人住房公积金贷款利率（2025 年 5 月 7 日中国人民银行决定下调个人住房公积金贷款利率 0.25 个百分点）：
//   首套：5 年以下（含）2.1%、5 年以上 2.6%；二套：5 年以下（含）2.525%、5 年以上 3.075%。
//   存量贷款自 2026-01-01 起同步下调 25BP。
// 注意：各地公积金中心最高额度不同（如中山单人 80 万/双人 160 万），本工具不限额度只做月供测算。

export type HouseType = "first" | "second";

export type HousingFundLoanErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE" | "NEGATIVE";

export type HousingFundLoanField = "amount" | "years" | "houseType";

export type HousingFundLoanResult =
  | {
      ok: true;
      annualRate: number; // 适用年利率（小数，如 0.026）
      rateLabel: string; // 利率档位说明（如「首套 5 年以上」）
      monthPay: number; // 等额本息月供
      totalPay: number; // 还款总额 = 月供 × n
      totalInterest: number; // 利息总额 = 还款总额 − 本金
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: HousingFundLoanErrorCode;
        message: string;
        field: HousingFundLoanField;
      };
    };

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;

// 央行 2025-05-08 起施行的公积金贷款利率
const RATES: Record<HouseType, { short: number; long: number }> = {
  first: { short: 0.021, long: 0.026 },
  second: { short: 0.02525, long: 0.03075 },
};

const AMOUNT_MIN = 10_000; // 1 万元
const AMOUNT_MAX = 5_000_000; // 500 万元
const YEARS_MIN = 1;
const YEARS_MAX = 30;

interface CalcInput {
  amount: string; // 贷款金额（元）
  years: string; // 贷款年限（年，整数）
  houseType: string; // "first" | "second"
}

function fail(
  code: HousingFundLoanErrorCode,
  message: string,
  field: HousingFundLoanField,
): HousingFundLoanResult {
  return { ok: false, error: { code, message, field } };
}

function parseAmount(s: string): number | HousingFundLoanResult {
  const trimmed = s.trim();
  if (trimmed === "") return fail("EMPTY", "请填写贷款金额", "amount");
  if (!NUMBER_RE.test(trimmed))
    return fail("INVALID_NUMBER", "请输入有效数字", "amount");
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "amount");
  const dot = trimmed.indexOf(".");
  const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;
  if (decimals > 2)
    return fail("INVALID_NUMBER", "金额最多保留 2 位小数", "amount");
  if (n < 0) return fail("NEGATIVE", "贷款金额不能为负数", "amount");
  if (n < AMOUNT_MIN || n > AMOUNT_MAX)
    return fail(
      "OUT_OF_RANGE",
      "贷款金额须在 10,000 ~ 5,000,000 元之间",
      "amount",
    );
  return n;
}

function parseYears(s: string): number | HousingFundLoanResult {
  const trimmed = s.trim();
  if (trimmed === "") return fail("EMPTY", "请填写贷款年限", "years");
  if (!NUMBER_RE.test(trimmed))
    return fail("INVALID_NUMBER", "请输入有效数字", "years");
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "years");
  if (n < 0) return fail("NEGATIVE", "贷款年限不能为负数", "years");
  if (!Number.isInteger(n) || n < YEARS_MIN || n > YEARS_MAX)
    return fail("OUT_OF_RANGE", "年限须为 1-30 的整数", "years");
  return n;
}

function isHouseType(s: string): s is HouseType {
  return s === "first" || s === "second";
}

export function calculateHousingFundLoan(
  input: CalcInput,
): HousingFundLoanResult {
  const { amount, years, houseType } = input;
  const p = parseAmount(amount);
  if (typeof p !== "number") return p;
  const y = parseYears(years);
  if (typeof y !== "number") return y;
  if (!isHouseType(houseType)) {
    return fail("OUT_OF_RANGE", "请选择首套或二套", "houseType");
  }

  // 利率档位：5 年以下（含）用 short 档，5 年以上用 long 档
  const isShort = y <= 5;
  const annualRate = isShort ? RATES[houseType].short : RATES[houseType].long;
  const rateLabel = houseType === "first" ? "首套" : "二套";

  const months = y * 12;
  const i = annualRate / 12;
  const f = Math.pow(1 + i, months);
  const monthPay = (p * i * f) / (f - 1);
  const totalPay = monthPay * months;
  const totalInterest = totalPay - p;

  const formulaText =
    `适用年利率 = ${annualRate * 100}%（${rateLabel} ${isShort ? "5 年以下（含）" : "5 年以上"}，央行 2025-05-08 起施行）` +
    `；月利率 i = ${annualRate * 100}%/12` +
    `；月供 = ${p}×i×(1+i)^${months}÷((1+i)^${months}−1) ≈ ${monthPay.toFixed(2)} 元` +
    `；还款总额 = 月供×${months} ≈ ${totalPay.toFixed(2)} 元` +
    `；利息总额 = 还款总额−本金 ≈ ${totalInterest.toFixed(2)} 元`;

  return {
    ok: true,
    annualRate,
    rateLabel: `${rateLabel} ${isShort ? "5 年以下（含）" : "5 年以上"}`,
    monthPay,
    totalPay,
    totalInterest,
    formulaText,
  };
}

export const HOUSING_FUND_LOAN_DEFAULTS = {
  years: "30",
  houseType: "first" as HouseType,
};
