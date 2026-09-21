// 经济补偿金计算器 —— 依据《中华人民共和国劳动合同法》第四十七条、第八十七条：
//   N：每满 1 年按 1 个月工资；6 个月以上不满 1 年按 1 年算；不满 6 个月支付半月
//   N+1：经济补偿 + 代通知金（按上月工资）
//   2N：违法解除赔偿金，2 倍
//   月工资三倍封顶：超过社平 3 倍时按 3 倍，且年限最高 12 年
// 「月工资」指解除/终止前 12 个月平均工资（含计时/计件工资、奖金、津贴、补贴）。
// 本工具按用户输入的月薪、工作年限、地区社平口径计算，最终以劳动仲裁/法院裁决为准。

import { NUMBER_RE } from "./_shared";

export type CompensationErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "INVALID_TYPE";

export type CompensationField = "salary" | "years" | "regionAvgSalary";

export type CompensationType = "N" | "N+1" | "2N";

export type CompensationResult =
  | {
      ok: true;
      result: number; // 应付总额（元，2 位小数）
      months: number; // 计发月数（含封顶）
      capped: boolean; // 是否触发「3 倍社平 + 12 年」封顶
      cappedSalary: number; // 实际计入月数的月薪
      cappedYears: number; // 实际计入月数的年限
      type: CompensationType;
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: CompensationErrorCode;
        message: string;
        field: CompensationField | "type";
      };
    };

export const COMPENSATION_TYPE_OPTIONS: ReadonlyArray<{
  value: CompensationType;
  label: string;
}> = [
  { value: "N", label: "N（合法解除经济补偿）" },
  { value: "N+1", label: "N+1（含代通知金）" },
  { value: "2N", label: "2N（违法解除赔偿金）" },
];

const MAX_DECIMALS = 2;
const SALARY_MIN = 1;
const SALARY_MAX = 1_000_000;
const YEARS_MIN = 0.5;
const YEARS_MAX = 50;
const REGION_AVG_MIN = 1;
const REGION_AVG_MAX = 1_000_000;
const HALF_MONTH = 0.5; // 不满 6 个月按半月
const SIX_MONTHS = 0.5; // 6 个月以上不满 1 年按 1 年（即 0.5 < y < 1 → 1 月）
const YEAR_CAP_MONTHS = 12; // 高薪封顶：年限最高 12 年
const SALARY_CAP_MULTIPLIER = 3; // 高薪封顶：按社平 3 倍
const TWO_N_MULTIPLIER = 2; // 违法解除 2 倍
const PLUS_ONE_MONTHS = 1; // 代通知金 = 1 个月

export interface CompensationInput {
  salary: string;
  years: string;
  type: string;
  regionAvgSalary: string; // 留空 = 不触发封顶
}

function fail(
  code: CompensationErrorCode,
  message: string,
  field: CompensationField | "type",
): CompensationResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseSalary(raw: string): number | CompensationResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写月工资", "salary");
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "salary");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "salary");
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "salary");
  }
  if (n < SALARY_MIN || n > SALARY_MAX) {
    return fail("OUT_OF_RANGE", "月工资需在 1 ~ 1000000 元之间", "salary");
  }
  return n;
}

function parseYears(raw: string): number | CompensationResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写工作年限", "years");
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "years");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "years");
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > 1) {
    return fail("TOO_MANY_DECIMALS", "年限小数位最多 1 位", "years");
  }
  if (n < YEARS_MIN || n > YEARS_MAX) {
    return fail("OUT_OF_RANGE", "年限需在 0.5 ~ 50 年之间", "years");
  }
  return n;
}

function parseRegionAvg(raw: string): number | CompensationResult {
  const trimmed = raw.trim();
  if (trimmed === "") return 0; // 留空 = 不触发封顶
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "regionAvgSalary");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "regionAvgSalary");
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail(
      "TOO_MANY_DECIMALS",
      "小数位数不能超过 2 位",
      "regionAvgSalary",
    );
  }
  if (n < REGION_AVG_MIN || n > REGION_AVG_MAX) {
    return fail(
      "OUT_OF_RANGE",
      "社平工资需在 1 ~ 1000000 元之间",
      "regionAvgSalary",
    );
  }
  return n;
}

function monthsForYears(years: number): number {
  // 6 个月以上不满 1 年按 1 年；不满 6 个月按半月
  if (years <= SIX_MONTHS) return HALF_MONTH;
  return Math.floor(years) + (years - Math.floor(years) >= SIX_MONTHS ? 1 : 0);
}

export function calculateCompensation(
  input: CompensationInput,
): CompensationResult {
  const type = input.type as CompensationType;
  if (type !== "N" && type !== "N+1" && type !== "2N") {
    return fail("INVALID_TYPE", "请选择补偿类型", "type");
  }

  const salary = parseSalary(input.salary);
  if (typeof salary !== "number") return salary;
  const years = parseYears(input.years);
  if (typeof years !== "number") return years;
  const regionAvg = parseRegionAvg(input.regionAvgSalary);
  if (typeof regionAvg !== "number") return regionAvg;

  // 月数 = 工龄换算月数 × 类型倍数（N、N+1 +1、2N ×2）
  const baseMonths = monthsForYears(years);
  let months = baseMonths;
  if (type === "N+1") months += PLUS_ONE_MONTHS;
  if (type === "2N") months = baseMonths * TWO_N_MULTIPLIER;

  // 高薪封顶：月薪 > 社平 ×3 → 按 3 倍社平计入；年限最高 12 年
  let capped = false;
  let cappedSalary = salary;
  let cappedYears = years;
  if (regionAvg > 0 && salary > regionAvg * SALARY_CAP_MULTIPLIER) {
    capped = true;
    cappedSalary = round2(regionAvg * SALARY_CAP_MULTIPLIER);
    cappedYears = Math.min(years, YEAR_CAP_MONTHS);
    const baseMonthsCapped = monthsForYears(cappedYears);
    months =
      type === "N+1"
        ? baseMonthsCapped + PLUS_ONE_MONTHS
        : type === "2N"
          ? baseMonthsCapped * TWO_N_MULTIPLIER
          : baseMonthsCapped;
  }

  const result = round2(cappedSalary * months);
  const formulaParts = [
    `基础月数 = ${baseMonths}（工龄 ${years} 年按劳 47 条换算）`,
    capped
      ? `高薪封顶：月薪按 ${cappedSalary} 元计入（社平 ${regionAvg} ×${SALARY_CAP_MULTIPLIER}），年限上限 ${YEAR_CAP_MONTHS} 年，实际工龄 ${cappedYears} 年`
      : `未触发 3 倍社平封顶`,
    `计发月数 ${months} × 实际月薪 ${cappedSalary} = ¥${result.toFixed(2)}`,
  ];
  if (type === "2N") {
    formulaParts.push("违法解除赔偿金按经济补偿 2 倍计发（第八十七条）");
  } else if (type === "N+1") {
    formulaParts.push("代通知金 = 上月工资（第四十条）");
  }

  return {
    ok: true,
    result,
    months,
    capped,
    cappedSalary,
    cappedYears,
    type,
    formulaText: formulaParts.join("；"),
  };
}
