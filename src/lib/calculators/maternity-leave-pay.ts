// 产假工资计算器 —— 依据《女职工劳动保护特别规定》（国务院令第 619 号）：
// 基础产假 98 天；难产增加 15 天；多胞胎生育的，每多生育 1 个婴儿增加 15 天。
// 各省人口与计划生育条例另设奖励假（延长产假）：广东 80 天（合计 178 天），
// 北京/上海/浙江/山东等多数省份 60 天（合计 158 天口径），以参保地最新条例为准。
// 折算口径：产假期间工资照发，产假工资 = 月薪 ÷ 21.75 × 产假总天数。
// 注意：产假工资与生育津贴不重复享受，就高计发、差额由单位补足。

import { NUMBER_RE } from "./_shared";

export type MaternityLeaveBirthType = "normal" | "difficult";

export type MaternityLeavePayErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NOT_INTEGER"
  | "INVALID_BIRTH_TYPE"
  | "INVALID_REWARD_PRESET";

export type MaternityLeavePayField =
  "salary" | "reward" | "rewardDays" | "birth" | "babies";

export interface RewardPreset {
  key: string;
  label: string;
  /** 奖励假天数；custom 时为 null（由用户填写 rewardDaysCustom） */
  days: number | null;
  note: string;
}

// 2026 年已核实的省级奖励假口径。
export const REWARD_PRESETS: RewardPreset[] = [
  {
    key: "guangdong",
    label: "广东（奖励假 80 天，产假共 178 天）",
    days: 80,
    note: "广东省人口与计划生育条例奖励假 80 天",
  },
  {
    key: "shandong",
    label: "山东（奖励假 60 天，产假共 158 天）",
    days: 60,
    note: "山东奖励假 60 天",
  },
  {
    key: "beijing",
    label: "北京（奖励假 60 天，产假共 158 天）",
    days: 60,
    note: "北京延长产假 60 天",
  },
  {
    key: "shanghai",
    label: "上海（奖励假 60 天，产假共 158 天）",
    days: 60,
    note: "上海生育假 60 天",
  },
  {
    key: "zhejiang",
    label: "浙江（奖励假 60 天，产假共 158 天）",
    days: 60,
    note: "浙江延长产假 60 天",
  },
  {
    key: "other",
    label: "其他多数省份（奖励假 60 天，产假共 158 天）",
    days: 60,
    note: "其余多数省份按 158 天口径",
  },
  {
    key: "custom",
    label: "自定义奖励假天数（0 ~ 300 天）",
    days: null,
    note: "按参保地规定自行填写",
  },
];

export type MaternityLeavePayResult =
  | {
      ok: true;
      baseDays: number; // 98 + 难产 15 + 多胞胎 15 ×（婴儿数 - 1）
      rewardDays: number; // 奖励假天数（预设或自定义）
      totalDays: number; // 产假总天数
      dailyWage: number; // 日工资 = 月薪 ÷ 21.75（2 位小数）
      leavePay: number; // 产假工资（2 位小数）
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: MaternityLeavePayErrorCode;
        message: string;
        field: MaternityLeavePayField;
      };
    };

const BASE_DAYS = 98;
const DIFFICULT_BONUS = 15;
const MULTIPLE_BONUS = 15;
const SALARY_MIN = 1;
const SALARY_MAX = 1_000_000;
const BABIES_MIN = 1;
const BABIES_MAX = 6;
const CUSTOM_REWARD_MIN = 0;
const CUSTOM_REWARD_MAX = 300;
const MAX_DECIMALS = 2;
const MONTH_PAY_DAYS = 21.75;

export interface MaternityLeavePayInput {
  monthlySalary: string;
  rewardPreset: string; // REWARD_PRESETS 的 key 或 "custom"
  rewardDaysCustom: string; // 仅 rewardPreset = custom 时使用（0 ~ 300 整数）
  birthType: string; // normal | difficult
  babies: string; // 婴儿数 1 ~ 6
}

function fail(
  code: MaternityLeavePayErrorCode,
  message: string,
  field: MaternityLeavePayField,
): MaternityLeavePayResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isBirthType(s: string): s is MaternityLeaveBirthType {
  return s === "normal" || s === "difficult";
}

function parseSalary(raw: string): number | MaternityLeavePayResult {
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

function parseBabies(raw: string): number | MaternityLeavePayResult {
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

function parseCustomRewardDays(raw: string): number | MaternityLeavePayResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请填写自定义奖励假天数", "rewardDays");
  }
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "rewardDays");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "rewardDays");
  }
  if (!Number.isInteger(n)) {
    return fail("NOT_INTEGER", "奖励假天数需为整数", "rewardDays");
  }
  if (n < CUSTOM_REWARD_MIN || n > CUSTOM_REWARD_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `自定义奖励假天数需在 ${CUSTOM_REWARD_MIN} ~ ${CUSTOM_REWARD_MAX} 之间`,
      "rewardDays",
    );
  }
  return n;
}

export function calculateMaternityLeavePay(
  input: MaternityLeavePayInput,
): MaternityLeavePayResult {
  const salary = parseSalary(input.monthlySalary);
  if (typeof salary !== "number") return salary;
  if (!isBirthType(input.birthType)) {
    return fail("INVALID_BIRTH_TYPE", "请选择顺产或难产", "birth");
  }
  const babies = parseBabies(input.babies);
  if (typeof babies !== "number") return babies;

  const preset = REWARD_PRESETS.find((p) => p.key === input.rewardPreset);
  if (!preset) {
    return fail("INVALID_REWARD_PRESET", "请选择有效的奖励假预设", "reward");
  }

  let rewardDays: number;
  if (preset.days === null) {
    const custom = parseCustomRewardDays(input.rewardDaysCustom);
    if (typeof custom !== "number") return custom;
    rewardDays = custom;
  } else {
    rewardDays = preset.days;
  }

  const difficult = input.birthType === "difficult";
  const baseDays =
    BASE_DAYS +
    (difficult ? DIFFICULT_BONUS : 0) +
    (babies - 1) * MULTIPLE_BONUS;
  const totalDays = baseDays + rewardDays;
  const dailyWage = salary / MONTH_PAY_DAYS;
  const leavePay = round2(dailyWage * totalDays);

  const baseDaysText =
    `基础产假 = ${BASE_DAYS} 天` +
    (difficult ? ` + ${DIFFICULT_BONUS}（难产）` : "") +
    (babies > 1 ? ` + ${MULTIPLE_BONUS} × ${babies - 1}（多胞胎）` : "") +
    ` = ${baseDays} 天`;
  const formulaText = [
    baseDaysText,
    `奖励假（${preset.label}）= ${rewardDays} 天`,
    `产假总天数 = ${baseDays} + ${rewardDays} = ${totalDays} 天`,
    `日工资 = ${salary} ÷ 21.75 ≈ ${dailyWage.toFixed(2)} 元`,
    `产假工资 ≈ ${dailyWage.toFixed(2)} × ${totalDays} = ¥${leavePay.toFixed(2)}`,
  ].join("；");

  return {
    ok: true,
    baseDays,
    rewardDays,
    totalDays,
    dailyWage: round2(dailyWage),
    leavePay,
    formulaText,
  };
}
