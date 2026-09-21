// 工伤赔偿计算器 —— 依据《工伤保险条例》（国务院令第 375 号，修订 586 号）第三十五、三十七条：
//   一次性伤残补助金月数：1-10 级 = 27/25/23/21/18/16/13/11/9/7
//   1-4 级按月发放伤残津贴，比例 = 90% − (等级 − 1) × 5%
//   5-10 级解除劳动合同时：一次性工伤医疗补助金 + 一次性伤残就业补助金
//     （具体标准由各省自定；本工具按常见「1-6 级 18 个月、7-8 级 12 个月、9 级 8 个月、10 级 6 个月」供参考）
// 本工具以用户输入的「受伤前月工资、伤残等级、是否解除/终止」自动估算一次性待遇；
// 不含医疗费、康复费、辅助器具费、护理费等「实报实销」项目，最终以统筹地区社保机构核定为准。

import { NUMBER_RE } from "./_shared";

export type InjuryErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "INVALID_LEVEL";

export type InjuryField = "salary" | "level";

export type InjuryResult =
  | {
      ok: true;
      level: number;
      salary: number;
      disabilityMonths: number;
      disabilityAmount: number;
      monthlyPension?: number;
      medicalAmount?: number;
      employmentAmount?: number;
      total: number;
      resign: boolean;
      formulaText: string;
      note: string;
    }
  | {
      ok: false;
      error: {
        code: InjuryErrorCode;
        message: string;
        field: InjuryField;
      };
    };

// 1-10 级一次性伤残补助金月数
const DISABILITY_MONTHS: ReadonlyArray<number> = [
  27, 25, 23, 21, 18, 16, 13, 11, 9, 7,
];

// 1-4 级伤残津贴比例（按月发放，90% / 85% / 80% / 75%）
const PENSION_RATIO: ReadonlyArray<number> = [0.9, 0.85, 0.8, 0.75];

// 5-10 级解除/终止劳动合同时，一次性工伤医疗补助金 + 一次性伤残就业补助金合计月数
// 注：标准由各省自定；本工具按「参考区间」中位数估算（医疗 + 就业补助金合计）：
//   5-6 级 18 个月、7-8 级 12 个月、9 级 8 个月、10 级 6 个月
const MEDICAL_EMPLOYMENT_MONTHS: ReadonlyArray<number> = [18, 18, 12, 12, 8, 6]; // index = level - 5

const SALARY_MIN = 1;
const SALARY_MAX = 1_000_000;
const LEVEL_MIN = 1;
const LEVEL_MAX = 10;
const MAX_DECIMALS = 2;

export interface InjuryInput {
  salary: string;
  level: string;
  resign: string; // "true" / "false"
}

function fail(
  code: InjuryErrorCode,
  message: string,
  field: InjuryField,
): InjuryResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseSalary(raw: string): number | InjuryResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写受伤前月工资", "salary");
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

function parseLevel(raw: string): number | InjuryResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写伤残等级", "level");
  if (!/^\d+$/.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入 1~10 整数", "level");
  }
  const n = Number(trimmed);
  if (!Number.isInteger(n))
    return fail("INVALID_NUMBER", "请输入整数", "level");
  if (n < LEVEL_MIN || n > LEVEL_MAX) {
    return fail("OUT_OF_RANGE", "伤残等级需在 1~10 之间", "level");
  }
  return n;
}

export function calculateInjury(input: InjuryInput): InjuryResult {
  const salary = parseSalary(input.salary);
  if (typeof salary !== "number") return salary;
  const level = parseLevel(input.level);
  if (typeof level !== "number") return level;
  const resign = input.resign === "true";

  const disabilityMonths = DISABILITY_MONTHS[level - 1];
  const disabilityAmount = round2(salary * disabilityMonths);

  let monthlyPension: number | undefined;
  let medicalAmount: number | undefined;
  let employmentAmount: number | undefined;
  let total = disabilityAmount;
  const formulaParts: string[] = [
    `一次性伤残补助金 = ${salary} × ${disabilityMonths} 月 = ¥${disabilityAmount.toFixed(2)}`,
  ];

  if (level <= 4) {
    monthlyPension = round2(salary * PENSION_RATIO[level - 1]);
    formulaParts.push(
      `按月伤残津贴（${(PENSION_RATIO[level - 1] * 100).toFixed(0)}%）= ¥${monthlyPension.toFixed(2)}/月（条例第三十五条，按月发放至退休并转养老金）`,
    );
  }

  if (resign && level >= 5) {
    const months = MEDICAL_EMPLOYMENT_MONTHS[level - 5];
    // 一次性工伤医疗补助金 + 一次性伤残就业补助金：按常见合计月数，对半分摊
    const totalExtra = round2((salary * months) / 2);
    medicalAmount = round2(totalExtra / 2);
    employmentAmount = round2(totalExtra - medicalAmount);
    total = round2(disabilityAmount + medicalAmount + employmentAmount);
    formulaParts.push(
      `一次性工伤医疗补助金 + 一次性伤残就业补助金：合计 ${months} 月 × ${salary} / 2 = ¥${totalExtra.toFixed(2)}，对半拆分仅供参考（各省自定）`,
    );
  } else if (resign && level <= 4) {
    formulaParts.push(
      "1-4 级保留劳动关系，按月发放伤残津贴，不计一次性医疗/就业补助金",
    );
  }

  formulaParts.push(
    `合计 ≈ ¥${total.toFixed(2)}（不含实报实销医疗费、康复费、辅助器具费）`,
  );

  return {
    ok: true,
    level,
    salary,
    disabilityMonths,
    disabilityAmount,
    monthlyPension,
    medicalAmount,
    employmentAmount,
    total,
    resign,
    formulaText: formulaParts.join("；"),
    note: "一次性工伤医疗补助金 / 一次性伤残就业补助金具体月数由各省自定；本工具按常见区间中位数估算，以统筹地区社保机构公告为准。",
  };
}
