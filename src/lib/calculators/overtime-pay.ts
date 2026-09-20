// 加班费计算器 —— 依据《中华人民共和国劳动法》第四十四条：
// 工作日延时加班支付不低于工资 150% 的工资报酬；休息日加班又不能安排补休的支付不低于 200%；
// 法定休假日加班支付不低于 300%。
// 月计薪天数 =（365 - 104）÷ 12 = 21.75 天（劳社部发〔2008〕3 号），
// 日工资 = 月薪 ÷ 21.75，小时工资 = 日工资 ÷ 8。
// 注意：本工具按用户输入的「月工资」统一折算加班费基数；实际基数以劳动合同约定与当地规定为准。

import { NUMBER_RE } from "./_shared";

export type OvertimePayErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NEGATIVE_HOURS"
  | "NO_OVERTIME_HOURS";

export type OvertimePayField = "salary" | "h1" | "h2" | "h3";

export type OvertimePayResult =
  | {
      ok: true;
      hourlyWage: number; // 小时工资 = 月薪 ÷ 21.75 ÷ 8（2 位小数）
      workdayPay: number; // 工作日延时加班费（1.5 倍）
      weekendPay: number; // 休息日加班费（未补休，2 倍）
      holidayPay: number; // 法定节假日加班费（3 倍）
      total: number; // 加班费合计
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: OvertimePayErrorCode;
        message: string;
        field: OvertimePayField;
      };
    };

const SALARY_MIN = 1;
const SALARY_MAX = 1_000_000;
const HOURS_MAX = 300;
const MAX_DECIMALS = 2;
const MONTH_PAY_DAYS = 21.75; // 月计薪天数 =（365 - 104）÷ 12
const DAY_HOURS = 8;

export interface OvertimePayInput {
  monthlySalary: string;
  hoursWorkday: string; // 工作日延时小时（留空按 0）
  hoursWeekend: string; // 休息日小时（未补休，留空按 0）
  hoursHoliday: string; // 法定节假日小时（留空按 0）
}

function fail(
  code: OvertimePayErrorCode,
  message: string,
  field: OvertimePayField,
): OvertimePayResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseSalary(raw: string): number | OvertimePayResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写月工资", "salary");
  if (!NUMBER_RE.test(trimmed)) {
    return fail(
      "INVALID_NUMBER",
      "请输入有效数字（不支持科学计数法）",
      "salary",
    );
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "salary");
  }
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "salary");
  }
  if (n < SALARY_MIN || n > SALARY_MAX) {
    return fail("OUT_OF_RANGE", "月工资需在 1 ~ 1000000 元之间", "salary");
  }
  return n;
}

function parseHours(
  raw: string,
  field: OvertimePayField,
): number | OvertimePayResult {
  const trimmed = raw.trim();
  if (trimmed === "") return 0; // 留空按 0 处理
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", field);
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", field);
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", field);
  }
  if (n < 0) return fail("NEGATIVE_HOURS", "小时数不能为负数", field);
  if (n > HOURS_MAX) {
    return fail("OUT_OF_RANGE", "小时数需在 0 ~ 300 之间", field);
  }
  return n;
}

export function calculateOvertimePay(
  input: OvertimePayInput,
): OvertimePayResult {
  const salary = parseSalary(input.monthlySalary);
  if (typeof salary !== "number") return salary;
  const h1 = parseHours(input.hoursWorkday, "h1");
  if (typeof h1 !== "number") return h1;
  const h2 = parseHours(input.hoursWeekend, "h2");
  if (typeof h2 !== "number") return h2;
  const h3 = parseHours(input.hoursHoliday, "h3");
  if (typeof h3 !== "number") return h3;

  if (h1 === 0 && h2 === 0 && h3 === 0) {
    return fail("NO_OVERTIME_HOURS", "请至少填写一项大于 0 的加班小时数", "h1");
  }

  const hourlyWage = salary / MONTH_PAY_DAYS / DAY_HOURS;
  const workdayRaw = hourlyWage * 1.5 * h1;
  const weekendRaw = hourlyWage * 2.0 * h2;
  const holidayRaw = hourlyWage * 3.0 * h3;
  const workdayPay = round2(workdayRaw);
  const weekendPay = round2(weekendRaw);
  const holidayPay = round2(holidayRaw);
  const total = round2(workdayRaw + weekendRaw + holidayRaw);

  const formulaText = [
    `小时工资 = 月薪 ${salary} ÷ 21.75 ÷ 8 ≈ ${hourlyWage.toFixed(2)} 元`,
    `工作日延时（1.5 倍）= 小时工资 × 1.5 × ${h1} = ¥${workdayPay.toFixed(2)}`,
    `休息日未补休（2 倍）= 小时工资 × 2 × ${h2} = ¥${weekendPay.toFixed(2)}`,
    `法定节假日（3 倍）= 小时工资 × 3 × ${h3} = ¥${holidayPay.toFixed(2)}`,
    `合计 = ¥${total.toFixed(2)}`,
  ].join("；");

  return {
    ok: true,
    hourlyWage: round2(hourlyWage),
    workdayPay,
    weekendPay,
    holidayPay,
    total,
    formulaText,
  };
}
