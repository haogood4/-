// 渐进式延迟法定退休年龄计算器 —— 纯函数，无 DOM 依赖
// 依据：全国人大常委会《关于实施渐进式延迟法定退休年龄的决定》（2024-09-13 通过，2025-01-01 起施行）
// 国务院《渐进式延迟法定退休年龄的办法》第一条 + 附件 1/2/3 对照表
// 口径：男职工 60→63、原 55 周岁女职工 55→58（每 4 个月延迟 1 个月）；原 50 周岁女职工 50→55（每 2 个月延迟 1 个月）
// 起始：改革后法定退休年龄首月为 2025-01（1965-01 男、1970-01 原 55 岁女、1975-01 原 50 岁女均对应 1 个月延迟）

export type RetirementCategory =
  | "male" // 男职工（原 60 周岁）
  | "female55" // 原法定退休年龄 55 周岁的女职工
  | "female50"; // 原法定退休年龄 50 周岁的女职工

export type RetirementErrorCode =
  | "EMPTY"
  | "INVALID_YEAR"
  | "INVALID_MONTH"
  | "INVALID_DATE"
  | "OUT_OF_RANGE"
  | "UNSUPPORTED_CATEGORY";

export type RetirementResult =
  | {
      ok: true;
      originalAgeYears: number;
      originalRetireYear: number;
      originalRetireMonth: number;
      newRetireAgeMonths: number;
      newRetireAgeText: string; // 「60 岁 1 个月」
      newRetireYear: number;
      newRetireMonth: number;
      newRetireDateText: string; // 「2025-02」
      delayMonths: number;
      delayYears: number; // 换算年（含小数）
      minContributionYears: number; // 当前/改革后最低缴费年限
    }
  | { ok: false; error: { code: RetirementErrorCode; message: string } };

interface CategoryConfig {
  label: string;
  originalAge: number;
  newAge: number; // 改革后法定退休年龄上限
  birthMonthStep: number; // 出生月滞后 1 个月对应延迟月数
}

const CATEGORY: Record<RetirementCategory, CategoryConfig> = {
  male: {
    label: "男职工（原 60 周岁）",
    originalAge: 60,
    newAge: 63,
    birthMonthStep: 4,
  },
  female55: {
    label: "女职工（原 55 周岁）",
    originalAge: 55,
    newAge: 58,
    birthMonthStep: 4,
  },
  female50: {
    label: "女职工（原 50 周岁）",
    originalAge: 50,
    newAge: 55,
    birthMonthStep: 2,
  },
};

// 改革后最低缴费年限（2030-01 起每年 +6 月，从 15 → 20 年；上限 20 年）
// 例：2030 退休 → 15 年；2031 退休 → 15.5 年；2040 退休 → 20 年
function currentMinContributionYears(retireYear: number): number {
  if (retireYear < 2030) return 15;
  const addedMonths = Math.min(60, (retireYear - 2030) * 12);
  return Math.round((15 + addedMonths / 12) * 100) / 100;
}

function isCategory(s: string): s is RetirementCategory {
  return s in CATEGORY;
}

function fail(code: RetirementErrorCode, message: string): RetirementResult {
  return { ok: false, error: { code, message } };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function isValidYmd(y: number, m: number, d: number): boolean {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return false;
  }
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= daysInMonth(y, m);
}

function addMonths(
  year: number,
  month: number,
  add: number,
): { year: number; month: number } {
  // 月份以 1-12 表示，循环进位
  const total = (year - 1) * 12 + (month - 1) + add;
  const newYear = Math.floor(total / 12) + 1;
  const newMonth = (total % 12) + 1;
  return { year: newYear, month: newMonth };
}

function lastDayOfMonth(year: number, month: number): number {
  return daysInMonth(year, month);
}

function formatAge(months: number): string {
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} 周岁`;
  return `${years} 岁 ${m} 个月`;
}

export function calculateRetirementAge(input: {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  category: string;
}): RetirementResult {
  const { birthYear, birthMonth, birthDay, category } = input;
  const yearTrim = birthYear.trim();
  const monthTrim = birthMonth.trim();
  const dayTrim = birthDay.trim();

  if (yearTrim === "" || monthTrim === "") {
    return fail("EMPTY", "请输入出生年份与月份");
  }
  if (!/^\d+$/.test(yearTrim) || !/^\d+$/.test(monthTrim)) {
    return fail("INVALID_DATE", "出生日期请填写有效数字");
  }
  // 日期可选：缺省视为 1 号（仅用于合法性兜底，不影响月份级测算）
  const dayNormalized = dayTrim === "" ? "1" : dayTrim;
  if (!/^\d+$/.test(dayNormalized)) {
    return fail("INVALID_DATE", "出生日期请填写有效数字");
  }
  if (!isCategory(category)) {
    return fail("UNSUPPORTED_CATEGORY", "不支持的职工类别");
  }
  const y = Number(yearTrim);
  const m = Number(monthTrim);
  const d = Number(dayNormalized);
  if (y < 1900 || y > 2100) {
    return fail("OUT_OF_RANGE", "年份超出合理范围（1900~2100）");
  }
  if (m < 1 || m > 12) {
    return fail("INVALID_DATE", "月份应在 1~12 之间");
  }
  if (dayTrim !== "" && !isValidYmd(y, m, d)) {
    return fail("INVALID_DATE", "请输入合法的日期（注意闰年与月份天数）");
  }

  const cfg = CATEGORY[category];
  // 改革基准：男 1965-01、原 55 岁女 1970-01、原 50 岁女 1975-01；这些出生月份的「原退休年月」就是改革后首月
  const baseRef: Record<RetirementCategory, { year: number; month: number }> = {
    male: { year: 1965, month: 1 },
    female55: { year: 1970, month: 1 },
    female50: { year: 1975, month: 1 },
  };
  const ref = baseRef[category];
  const monthsFromRef = (y - ref.year) * 12 + (m - ref.month);
  if (monthsFromRef < 0) {
    return fail(
      "OUT_OF_RANGE",
      `${cfg.label}延迟方案不适用此出生月份（须 ${ref.year}-${ref.month} 及之后出生）`,
    );
  }
  // 原退休年月 = 出生年月 + originalAge*12 月
  const originalRetire = addMonths(y, m, cfg.originalAge * 12);
  // 延迟月数：自基准月起，每滞后 birthMonthStep 个月则多延迟 1 个月（即 +1 起步）
  const rawDelay = Math.floor(monthsFromRef / cfg.birthMonthStep) + 1;
  const totalDelayMonths = (cfg.newAge - cfg.originalAge) * 12;
  const cappedDelay = Math.min(rawDelay, totalDelayMonths);
  // 新退休年月 = 原退休年月 + cappedDelay 月
  const newRetire = addMonths(
    originalRetire.year,
    originalRetire.month,
    cappedDelay,
  );
  const newAgeMonths = cfg.originalAge * 12 + cappedDelay;
  const minYears = currentMinContributionYears(newRetire.year);

  return {
    ok: true,
    originalAgeYears: cfg.originalAge,
    originalRetireYear: originalRetire.year,
    originalRetireMonth: originalRetire.month,
    newRetireAgeMonths: newAgeMonths,
    newRetireAgeText: formatAge(newAgeMonths),
    newRetireYear: newRetire.year,
    newRetireMonth: newRetire.month,
    newRetireDateText: `${newRetire.year}-${String(newRetire.month).padStart(2, "0")}`,
    delayMonths: cappedDelay,
    delayYears: cappedDelay / 12,
    minContributionYears: minYears,
  };
}

export const RETIREMENT_CATEGORY_OPTIONS: Array<{
  value: RetirementCategory;
  label: string;
}> = Object.entries(CATEGORY).map(([value, cfg]) => ({
  value: value as RetirementCategory,
  label: cfg.label,
}));

// 暴露 lastDayOfMonth 用于日期选择器补充逻辑（day 输入可选）
export { lastDayOfMonth };
