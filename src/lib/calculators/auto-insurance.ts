// 车险保费计算器（交强险 2026 新浮动机制 + 商业险 NCD 折扣）
// 政策依据：2026-06-01 起全国统一实施交强险新浮动机制（告别 950 一口价）：
//   基础保费：家庭自用汽车 6 座以下 950 元、6 座及以上 1100 元。
//   无有责出险折扣：0 年→1.0、1 年→0.9、2 年→0.8、3 年及以上按地区 A=0.5/B=0.55/C=0.6/D=0.65/E=0.7。
//   地区分类：A 内蒙古/海南/青海/西藏；B 陕西/云南/广西；C 甘肃/吉林/山西/黑龙江/新疆；
//             D 北京/天津/河北/宁夏；E 其余省份。
//   有责出险上浮（覆盖无出险折扣）：1 次→1.0、2 次→1.2、3 次→1.5、5 次及以上→2.0。
//   无责出险不计入出险次数，不影响优惠。严重交通违法额外上浮 15%-30% 未纳入本工具。
// 商业险：按连续未出险年数取 NCD 系数（0 年→1.0、1 年→0.85、2 年→0.7、3 年+→0.6）；
//   出险后 NCD 回到 1.0（出险上浮由承保公司核保，不纳入本引擎）。

export type SeatType = "under6" | "over6";
export type NoClaimYears = "0" | "1" | "2" | "3";
export type RegionClass = "A" | "B" | "C" | "D" | "E";
export type ClaimsCount = "0" | "1" | "2" | "3" | "5plus";

export type AutoInsuranceErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE" | "NEGATIVE";

export type AutoInsuranceField =
  "seat" | "noclaim" | "claims" | "region" | "commercial";

export type AutoInsuranceResult =
  | {
      ok: true;
      compulsoryBase: number; // 交强险基础保费（950 / 1100）
      compulsoryRate: number; // 交强险浮动系数
      compulsoryPremium: number; // 交强险保费 = 基础 × 系数
      ncdRate: number; // 商业险 NCD 系数
      commercialPremium: number; // 商业险保费（未填基准保费则为 0）
      totalPremium: number; // 合计保费
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: AutoInsuranceErrorCode;
        message: string;
        field: AutoInsuranceField;
      };
    };

const COMPULSORY_BASE: Record<SeatType, number> = { under6: 950, over6: 1100 };

// 3 年及以上无有责出险的折扣系数（按地区）
const REGION_3Y_RATE: Record<RegionClass, number> = {
  A: 0.5,
  B: 0.55,
  C: 0.6,
  D: 0.65,
  E: 0.7,
};

// 有责出险上浮系数（覆盖无出险折扣）
const CLAIMS_RATE: Record<Exclude<ClaimsCount, "0">, number> = {
  "1": 1.0,
  "2": 1.2,
  "3": 1.5,
  "5plus": 2.0,
};

// 商业险 NCD 系数（连续未出险年数）
const NCD_RATE: Record<NoClaimYears, number> = {
  "0": 1.0,
  "1": 0.85,
  "2": 0.7,
  "3": 0.6,
};

const NO_CLAIM_YEARS_SET = ["0", "1", "2", "3"];
const CLAIMS_SET = ["0", "1", "2", "3", "5plus"];
const REGION_SET = ["A", "B", "C", "D", "E"];

const COMMERCIAL_MIN = 100;
const COMMERCIAL_MAX = 500_000;

interface CalcInput {
  seatType: string; // "under6" | "over6"
  noClaimYears: string; // "0" | "1" | "2" | "3"
  claims: string; // "0" | "1" | "2" | "3" | "5plus"
  regionClass: string; // "A" | "B" | "C" | "D" | "E"
  commercialBase: string; // 商业险基准保费（元，可空）
}

function fail(
  code: AutoInsuranceErrorCode,
  message: string,
  field: AutoInsuranceField,
): AutoInsuranceResult {
  return { ok: false, error: { code, message, field } };
}

function parseCommercialBase(s: string): number | null | AutoInsuranceResult {
  const trimmed = s.trim();
  if (trimmed === "") return null; // 不计算商业险
  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(trimmed))
    return fail(
      "INVALID_NUMBER",
      "商业险基准保费请输入有效数字或留空",
      "commercial",
    );
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail(
      "INVALID_NUMBER",
      "商业险基准保费请输入有效数字或留空",
      "commercial",
    );
  const dot = trimmed.indexOf(".");
  const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;
  if (decimals > 2)
    return fail("INVALID_NUMBER", "金额最多保留 2 位小数", "commercial");
  if (n < 0) return fail("NEGATIVE", "商业险基准保费不能为负数", "commercial");
  if (n < COMMERCIAL_MIN || n > COMMERCIAL_MAX)
    return fail(
      "OUT_OF_RANGE",
      "商业险基准保费须在 100 ~ 500,000 元之间（或留空不计算）",
      "commercial",
    );
  return n;
}

export function calculateAutoInsurance(input: CalcInput): AutoInsuranceResult {
  const { seatType, noClaimYears, claims, regionClass, commercialBase } = input;

  if (seatType !== "under6" && seatType !== "over6")
    return fail("OUT_OF_RANGE", "请选择汽车座位数类型", "seat");
  if (!NO_CLAIM_YEARS_SET.includes(noClaimYears))
    return fail("OUT_OF_RANGE", "连续无有责出险年数无效", "noclaim");
  if (!CLAIMS_SET.includes(claims))
    return fail("OUT_OF_RANGE", "上年有责出险次数无效", "claims");
  if (!REGION_SET.includes(regionClass))
    return fail("OUT_OF_RANGE", "所在地区类别无效", "region");
  const base = parseCommercialBase(commercialBase);
  if (typeof base !== "number" && base !== null) return base;

  const seat = seatType as SeatType;
  const region = regionClass as RegionClass;
  const compulsoryBase = COMPULSORY_BASE[seat];

  // 交强险浮动系数：有责出险上浮优先（覆盖无出险折扣）
  let compulsoryRate: number;
  let rateReason: string;
  if (claims !== "0") {
    const c = claims as Exclude<ClaimsCount, "0">;
    compulsoryRate = CLAIMS_RATE[c];
    rateReason =
      c === "5plus" ? "上年有责出险 5 次及以上" : `上年有责出险 ${c} 次`;
  } else {
    const years = noClaimYears as NoClaimYears;
    if (years === "3") {
      compulsoryRate = REGION_3Y_RATE[region];
      rateReason = `连续 3 年及以上无有责出险（${region} 类地区）`;
    } else {
      compulsoryRate = 1 - Number(years) * 0.1;
      rateReason =
        years === "0" ? "上年无优惠记录" : `连续 ${years} 年无有责出险`;
    }
  }
  const compulsoryPremium = compulsoryBase * compulsoryRate;

  // 商业险 NCD：出险后回 1.0（出险上浮由承保公司核保，不纳入引擎）
  const ncdRate = claims !== "0" ? 1.0 : NCD_RATE[noClaimYears as NoClaimYears];
  const commercialPremium = base === null ? 0 : base * ncdRate;
  const totalPremium = compulsoryPremium + commercialPremium;

  const formulaText =
    `交强险 = ${compulsoryBase}×${compulsoryRate}（${rateReason}）= ${compulsoryPremium.toFixed(2)} 元` +
    (base === null
      ? "；商业险基准保费未填，按 0 计"
      : `；商业险 = ${base.toFixed(2)}×${ncdRate}（NCD${claims !== "0" ? "，出险后无折扣" : ""}）= ${commercialPremium.toFixed(2)} 元`) +
    `；合计保费 = ${totalPremium.toFixed(2)} 元`;

  return {
    ok: true,
    compulsoryBase,
    compulsoryRate,
    compulsoryPremium,
    ncdRate,
    commercialPremium,
    totalPremium,
    formulaText,
  };
}

export const AUTO_INSURANCE_DEFAULTS = {
  noClaimYears: "0" as NoClaimYears,
  claims: "0" as ClaimsCount,
};
