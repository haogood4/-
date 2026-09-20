// 生育津贴计算器 —— 依据《女职工劳动保护特别规定》（国务院令第 619 号）：
// 女职工生育享受 98 天产假；难产增加 15 天；多胞胎生育的，每多生育 1 个婴儿增加 15 天。
// 计发口径（苏州口径、全国通行）：生育津贴 = 单位上年度职工月平均缴费工资 ÷ 30 × 计发天数。
// 各省另有奖励假/延长产假（如江苏顺产合计 158 天、广东 178 天），
// 可用「自定义计发天数」覆盖默认天数（60 ~ 400 天整数）。
// 注意：生育津贴与产假工资不重复享受，就高计发、差额补足。

import { NUMBER_RE } from "./_shared";

export type MaternityBirthType = "normal" | "difficult";

export type MaternityAllowanceErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NOT_INTEGER"
  | "INVALID_BIRTH_TYPE";

export type MaternityAllowanceField =
  "wage" | "birth" | "babies" | "daysOverride";

export type MaternityAllowanceResult =
  | {
      ok: true;
      days: number; // 计发天数（自定义覆盖或默认口径）
      dailyBase: number; // 日均计发基数 = 月均缴费工资 ÷ 30（2 位小数）
      allowance: number; // 生育津贴总额（2 位小数）
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: MaternityAllowanceErrorCode;
        message: string;
        field: MaternityAllowanceField;
      };
    };

const BASE_DAYS = 98;
const DIFFICULT_BONUS = 15;
const MULTIPLE_BONUS = 15;
const WAGE_MIN = 1;
const WAGE_MAX = 1_000_000;
const BABIES_MIN = 1;
const BABIES_MAX = 6;
const OVERRIDE_MIN = 60;
const OVERRIDE_MAX = 400;
const MAX_DECIMALS = 2;

export interface MaternityAllowanceInput {
  avgWage: string; // 单位上年度职工月平均缴费工资
  birthType: string; // normal | difficult
  babies: string; // 婴儿数 1 ~ 6
  daysOverride: string; // 自定义计发天数（留空用默认口径）
}

function fail(
  code: MaternityAllowanceErrorCode,
  message: string,
  field: MaternityAllowanceField,
): MaternityAllowanceResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isBirthType(s: string): s is MaternityBirthType {
  return s === "normal" || s === "difficult";
}

function parseAvgWage(raw: string): number | MaternityAllowanceResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写月平均缴费工资", "wage");
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "wage");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "wage");
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "wage");
  }
  if (n < WAGE_MIN || n > WAGE_MAX) {
    return fail(
      "OUT_OF_RANGE",
      "月平均缴费工资需在 1 ~ 1000000 元之间",
      "wage",
    );
  }
  return n;
}

function parseBabies(raw: string): number | MaternityAllowanceResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写婴儿数", "babies");
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "babies");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "babies");
  if (!Number.isInteger(n)) {
    return fail("NOT_INTEGER", "婴儿数需为整数", "babies");
  }
  if (n < BABIES_MIN || n > BABIES_MAX) {
    return fail("OUT_OF_RANGE", "婴儿数需在 1 ~ 6 之间", "babies");
  }
  return n;
}

function parseDaysOverride(
  raw: string,
): number | null | MaternityAllowanceResult {
  const trimmed = raw.trim();
  if (trimmed === "") return null; // 留空使用默认天数
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "daysOverride");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "daysOverride");
  }
  if (!Number.isInteger(n)) {
    return fail("NOT_INTEGER", "计发天数需为整数", "daysOverride");
  }
  if (n < OVERRIDE_MIN || n > OVERRIDE_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `自定义计发天数需在 ${OVERRIDE_MIN} ~ ${OVERRIDE_MAX} 之间`,
      "daysOverride",
    );
  }
  return n;
}

export function calculateMaternityAllowance(
  input: MaternityAllowanceInput,
): MaternityAllowanceResult {
  const wage = parseAvgWage(input.avgWage);
  if (typeof wage !== "number") return wage;
  if (!isBirthType(input.birthType)) {
    return fail("INVALID_BIRTH_TYPE", "请选择顺产或难产", "birth");
  }
  const babies = parseBabies(input.babies);
  if (typeof babies !== "number") return babies;
  const override = parseDaysOverride(input.daysOverride);
  if (typeof override !== "number" && override !== null) return override;

  const difficult = input.birthType === "difficult";
  const defaultDays =
    BASE_DAYS +
    (difficult ? DIFFICULT_BONUS : 0) +
    (babies - 1) * MULTIPLE_BONUS;
  const days = override ?? defaultDays;

  const dailyBase = wage / 30;
  const allowance = round2(dailyBase * days);

  const daysText =
    `计发天数 = ${BASE_DAYS}（基础）` +
    (difficult ? ` + ${DIFFICULT_BONUS}（难产）` : "") +
    (babies > 1 ? ` + ${MULTIPLE_BONUS} × ${babies - 1}（多胞胎）` : "") +
    ` = ${defaultDays} 天` +
    (override !== null ? `（已按自定义 ${override} 天覆盖）` : "");
  const formulaText = [
    daysText,
    `日均计发基数 = ${wage} ÷ 30 ≈ ${dailyBase.toFixed(2)} 元`,
    `生育津贴 ≈ ${dailyBase.toFixed(2)} × ${days} = ¥${allowance.toFixed(2)}`,
  ].join("；");

  return {
    ok: true,
    days,
    dailyBase: round2(dailyBase),
    allowance,
    formulaText,
  };
}
