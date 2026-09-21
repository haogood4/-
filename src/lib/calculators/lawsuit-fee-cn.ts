// 诉讼费计算器 —— 依据《诉讼费用交纳办法》（国务院令第 481 号，2007-04-01 起施行）：
// 财产案件按第十三条第一项分段累计（速算扣除法）；离婚、劳动争议、其他非财产案件
// 适用第十三条第二、四、三项定额/区间收费。
// 本工具以用户输入的「标的金额（财产案件）」或固定档位返回案件受理费，
// 不含申请费（执行、保全、支付令等）与公告、评估、拍卖等「谁主张谁负担」的费用。
// 各地可在第（二）（三）（六）项规定幅度内制定具体标准，最终以受诉法院与省级公告为准。

import { NUMBER_RE } from "./_shared";

export type LawsuitFeeErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "TOO_MANY_DECIMALS" | "OUT_OF_RANGE";

export type LawsuitFeeField = "amount";

export type LawsuitFeeCaseType = "property" | "divorce" | "labor" | "other";

export type LawsuitFeeResult =
  | {
      ok: true;
      fee: number;
      note: string;
      formula: string;
      caseType: LawsuitFeeCaseType;
    }
  | {
      ok: false;
      error: {
        code: LawsuitFeeErrorCode;
        message: string;
        field: LawsuitFeeField;
      };
    };

export const LAWSUIT_FEE_CASE_TYPE_OPTIONS: ReadonlyArray<{
  value: LawsuitFeeCaseType;
  label: string;
}> = [
  { value: "property", label: "财产案件" },
  { value: "divorce", label: "离婚案件" },
  { value: "labor", label: "劳动争议案件" },
  { value: "other", label: "其他非财产案件" },
];

export interface LawsuitFeeInput {
  caseType: string;
  amount: string;
}

const MAX_DECIMALS = 2;
const AMOUNT_MIN = 1;
const AMOUNT_MAX = 1_000_000_000;
const PROPERTY_TIER_BASE_FEE = 50;
const DIVORCE_BASE_MAX = 300;
const DIVORCE_PROPERTY_THRESHOLD = 200_000;
const DIVORCE_OVER_RATE = 0.005;
const OTHER_NON_PROPERTY_MAX = 100;
const LABOR_FEE = 10;

function fail(
  code: LawsuitFeeErrorCode,
  message: string,
  field: LawsuitFeeField,
): LawsuitFeeResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseAmount(raw: string): number | LawsuitFeeResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写标的金额", "amount");
  if (!NUMBER_RE.test(trimmed)) {
    return fail(
      "INVALID_NUMBER",
      "请输入有效数字（不支持科学计数法）",
      "amount",
    );
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "amount");
  }
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "amount");
  }
  if (n < AMOUNT_MIN || n > AMOUNT_MAX) {
    return fail("OUT_OF_RANGE", "标的金额需在 1 ~ 1000000000 元之间", "amount");
  }
  return n;
}

// 速算法（三元组：[cap, rate, 速算附加 C]）—— 与《诉讼费用交纳办法》第十三条附表逐段累计核验：
// 不超过 1 万元 → 50 元（定额）
// 1~10 万 → 2.5%，速算附加 −200（即减 200）
// 10~20 万 → 2%，速算附加 +300
// 20~50 万 → 1.5%，速算附加 +1300
// 50~100 万 → 1%，速算附加 +3800
// 100~200 万 → 0.9%，速算附加 +4800
// 200~500 万 → 0.8%，速算附加 +6800
// 500~1000 万 → 0.7%，速算附加 +11800
// 1000~2000 万 → 0.6%，速算附加 +21800
// 2000 万以上 → 0.5%，速算附加 +41800
// 通式：受理费 = 标的 × 本档比例 + C，其中 C = 上一档累计 − 上一档上界 × 本档比例。
// 逐档累计核验（2026-09-21 复算，修正初版把「附加」误作「扣除」的符号错误）：
// 10 万 → 2300、20 万 → 4300、50 万 → 8800、100 万 → 13800、200 万 → 22800、
// 500 万 → 46800、1000 万 → 81800、2000 万 → 141800。
const PROPERTY_TIERS: ReadonlyArray<[number, number, number]> = [
  [10_000, 0, PROPERTY_TIER_BASE_FEE],
  [100_000, 0.025, -200],
  [200_000, 0.02, 300],
  [500_000, 0.015, 1300],
  [1_000_000, 0.01, 3800],
  [2_000_000, 0.009, 4800],
  [5_000_000, 0.008, 6800],
  [10_000_000, 0.007, 11_800],
  [20_000_000, 0.006, 21_800],
  [Number.POSITIVE_INFINITY, 0.005, 41_800],
];

function propertyTierLookup(amount: number): [number, number, number] {
  for (const tier of PROPERTY_TIERS) {
    if (amount <= tier[0]) return tier;
  }
  return PROPERTY_TIERS[PROPERTY_TIERS.length - 1];
}

export function calculateLawsuitFee(input: LawsuitFeeInput): LawsuitFeeResult {
  const caseType = input.caseType as LawsuitFeeCaseType;
  if (
    caseType !== "property" &&
    caseType !== "divorce" &&
    caseType !== "labor" &&
    caseType !== "other"
  ) {
    return fail("INVALID_NUMBER", "案件类型不合法", "amount");
  }

  let amount = 0;
  if (caseType === "property") {
    const parsed = parseAmount(input.amount);
    if (typeof parsed !== "number") return parsed;
    amount = parsed;
  } else if (caseType === "divorce") {
    // 离婚标的允许 0（无财产/≤20 万档）：仅校验非负，不要求 ≥1
    const trimmed = input.amount.trim();
    if (trimmed === "") amount = 0;
    else if (!NUMBER_RE.test(trimmed)) {
      return fail("INVALID_NUMBER", "请输入有效数字", "amount");
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) {
        return fail("INVALID_NUMBER", "请输入有效数字", "amount");
      }
      const dot = trimmed.indexOf(".");
      if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
        return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "amount");
      }
      if (n < 0 || n > AMOUNT_MAX) {
        return fail(
          "OUT_OF_RANGE",
          "标的金额需在 0 ~ 1000000000 元之间",
          "amount",
        );
      }
      amount = n;
    }
  }

  let fee: number;
  let note: string;
  let formula: string;

  if (caseType === "labor") {
    fee = LABOR_FEE;
    note = "劳动争议案件：每件 10 元（第十三条第四项）";
    formula = `劳动争议案件受理费 = ¥${fee.toFixed(2)}`;
  } else if (caseType === "other") {
    fee = OTHER_NON_PROPERTY_MAX;
    note =
      "其他非财产案件：每件 50~100 元，本工具按上限 100 元估算（第十三条第二项第三目，省级可在幅度内自定）";
    formula = `其他非财产案件受理费 ≈ ¥${fee.toFixed(2)}`;
  } else if (caseType === "divorce") {
    if (amount <= DIVORCE_PROPERTY_THRESHOLD) {
      fee = DIVORCE_BASE_MAX;
      note =
        "离婚案件：每件 50~300 元；财产总额 ≤20 万不另行收费，本工具按 300 元上限示例（第十三条第二项第一目）";
      formula = `离婚案件受理费（无财产或 ≤20 万）≈ ¥${fee.toFixed(2)}`;
    } else {
      const over = amount - DIVORCE_PROPERTY_THRESHOLD;
      const extra = round2(over * DIVORCE_OVER_RATE);
      fee = round2(DIVORCE_BASE_MAX + extra);
      note =
        "离婚案件：每件 50~300 元；财产总额 >20 万部分按 0.5% 加收（第十三条第二项第一目）";
      formula = `离婚案件受理费 = ${DIVORCE_BASE_MAX} + (${over} × 0.5%) ≈ ¥${fee.toFixed(2)}`;
    }
  } else {
    const tier = propertyTierLookup(amount);
    const [cap, rate, deduct] = tier;
    if (rate === 0) {
      fee = deduct; // ≤1 万档位定额收费
    } else {
      fee = round2(amount * rate + deduct);
    }
    note = "财产案件：分段累计，附表速算法（第十三条第一项）";
    const capText = cap === Number.POSITIVE_INFINITY ? "∞" : cap.toString();
    if (rate === 0) {
      formula = `财产案件受理费（≤1 万元档定额）= ¥${fee.toFixed(2)}`;
    } else {
      const sign = deduct < 0 ? "−" : "＋";
      const absAdd = Math.abs(deduct);
      formula = `财产案件受理费 = 标的 ${amount} × ${(rate * 100).toFixed(2)}% ${sign} 速算附加 ${absAdd}（适用档 ≤${capText}）≈ ¥${fee.toFixed(2)}`;
    }
  }

  return {
    ok: true,
    fee,
    note,
    formula,
    caseType,
  };
}
