// 信用卡免息期计算器 —— 纯函数，无 DOM 依赖
// 口径：主流银行（建行/中行等）到期还款日 = 账单日后第 N 天（N 由用户填写，常见 20~26 天）；
// 消费日 ≤ 账单日 → 计入本期账单（账单日当天消费计入当期）；消费日 > 账单日 → 计入下期账单。
// 免息期 = 消费日到到期还款日的自然日差（与建行官网口径一致：4/17 消费、5/7 还款 = 20 天）。
// 日期运算自实现 addDays（基于 daysInMonth），正确处理跨月/跨年/闰年；
// 不使用 Date.now()/无参 new Date()，全部日期量由入参提供。

export type GraceErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE" | "INVALID_DATE";

export type GraceField = "year" | "month" | "day" | "statement" | "grace";

export type CreditGraceResult =
  | {
      ok: true;
      cycleLabel: "本期账单" | "下期账单";
      billDateText: string; // 消费所在账单周期的账单日，如 "2026-10-10"
      dueYear: number;
      dueMonth: number;
      dueDay: number;
      dueDateText: string; // "2026-10-30"
      graceDays: number; // 免息期自然日天数（消费日至还款日的自然日差）
      tipText: string;
    }
  | {
      ok: false;
      error: { code: GraceErrorCode; message: string; field: GraceField };
    };

interface GraceInput {
  consumeYear: string;
  consumeMonth: string;
  consumeDay: string;
  statementDay: string;
  graceN: string;
}

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const STATEMENT_MAX = 28; // 避开月末天数差异
const GRACE_MIN = 10;
const GRACE_MAX = 30;

function fail(
  code: GraceErrorCode,
  message: string,
  field: GraceField,
): CreditGraceResult {
  return { ok: false, error: { code, message, field } };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 天数加法：基于 daysInMonth 逐月进位，处理跨月/跨年/闰年 */
function addDays(
  year: number,
  month: number,
  day: number,
  add: number,
): { year: number; month: number; day: number } {
  let y = year;
  let m = month;
  let d = day + add;
  while (d > daysInMonth(y, m)) {
    d -= daysInMonth(y, m);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return { year: y, month: m, day: d };
}

function nextMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

/** 两个日期间的自然日差（to − from），显式入参构造 UTC 时间戳，确定性计算 */
function diffDays(
  fromY: number,
  fromM: number,
  fromD: number,
  toY: number,
  toM: number,
  toD: number,
): number {
  const a = Date.UTC(fromY, fromM - 1, fromD);
  const b = Date.UTC(toY, toM - 1, toD);
  return Math.round((b - a) / 86400000);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** 解析整数文本字段；空 → EMPTY，非纯数字 → INVALID_NUMBER */
function parseIntField(
  raw: string,
  field: GraceField,
  label: string,
): number | CreditGraceResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", `请填写${label}`, field);
  if (!/^\d+$/.test(trimmed)) {
    return fail("INVALID_NUMBER", `${label}请填写有效整数`, field);
  }
  return Number(trimmed);
}

export function calculateCreditGrace(input: GraceInput): CreditGraceResult {
  const yearR = parseIntField(input.consumeYear, "year", "消费年份");
  if (typeof yearR !== "number") return yearR;
  const y = yearR;
  const monthR = parseIntField(input.consumeMonth, "month", "消费月份");
  if (typeof monthR !== "number") return monthR;
  const m = monthR;
  const dayR = parseIntField(input.consumeDay, "day", "消费日");
  if (typeof dayR !== "number") return dayR;
  const d = dayR;
  const stR = parseIntField(input.statementDay, "statement", "账单日");
  if (typeof stR !== "number") return stR;
  const s = stR;
  const grR = parseIntField(input.graceN, "grace", "还款宽限天数 N");
  if (typeof grR !== "number") return grR;
  const n = grR;

  if (y < YEAR_MIN || y > YEAR_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `年份超出合理范围（${YEAR_MIN}~${YEAR_MAX}）`,
      "year",
    );
  }
  if (m < 1 || m > 12) {
    return fail("INVALID_DATE", "月份应在 1~12 之间", "month");
  }
  if (d < 1 || d > daysInMonth(y, m)) {
    return fail(
      "INVALID_DATE",
      "请输入合法的日期（注意闰年与月份天数）",
      "day",
    );
  }
  if (s < 1 || s > STATEMENT_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `账单日应在 1~${STATEMENT_MAX} 之间`,
      "statement",
    );
  }
  if (n < GRACE_MIN || n > GRACE_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `还款宽限天数 N 应为 ${GRACE_MIN}~${GRACE_MAX} 的整数`,
      "grace",
    );
  }

  // 消费日 ≤ 账单日 → 本期账单；消费日 > 账单日 → 下期账单
  const inCurrentCycle = d <= s;
  const bill = inCurrentCycle ? { year: y, month: m } : nextMonth(y, m);
  // 到期还款日 = 账单日后第 N 天
  const due = addDays(bill.year, bill.month, s, n);
  // 免息期：消费日至还款日的自然日差（银行通行口径）
  const graceDays = diffDays(y, m, d, due.year, due.month, due.day);
  const dueDateText = `${due.year}-${pad2(due.month)}-${pad2(due.day)}`;
  const billDateText = `${bill.year}-${pad2(bill.month)}-${pad2(s)}`;

  return {
    ok: true,
    cycleLabel: inCurrentCycle ? "本期账单" : "下期账单",
    billDateText,
    dueYear: due.year,
    dueMonth: due.month,
    dueDay: due.day,
    dueDateText,
    graceDays,
    tipText:
      `消费日 ≤ 账单日计入本期账单、次日消费计入下期账单；免息期按自然日差计（消费日至到期还款日）。` +
      `免息期最长约 ${n + 29} 天（N=${n}，账单日次日消费时），最短约 ${n} 天（账单日当天消费）。`,
  };
}

export const CREDIT_GRACE_DEFAULTS = {
  statementDay: "10",
  graceN: "20",
};
