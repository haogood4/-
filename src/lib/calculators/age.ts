// 年龄计算器 —— 纯函数，无 DOM 依赖
// 周岁按公历年月日逐级比较，禁止用「总天数 ÷ 平均年长」近似

export type AgeErrorCode = "INVALID_DATE" | "TARGET_BEFORE_BIRTH";

export type AgeResult =
  | { ok: true; years: number }
  | { ok: false; error: { code: AgeErrorCode; message: string } };

// 严格 YYYY-MM-DD，拒绝 "2025-1-1"、"2025/01/01" 等格式
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// 解析为 UTC 时间戳；2025-02-30 这类不存在的日期返回 null
function parseUtcDate(raw: string): number | null {
  const match = DATE_RE.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const date = new Date(ms);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return ms;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function calculateAge(birth: string, target: string): AgeResult {
  const birthMs = parseUtcDate(birth);
  if (birthMs === null) {
    return {
      ok: false,
      error: { code: "INVALID_DATE", message: "请输入有效日期（YYYY-MM-DD）" },
    };
  }
  const targetMs = parseUtcDate(target);
  if (targetMs === null) {
    return {
      ok: false,
      error: { code: "INVALID_DATE", message: "请输入有效日期（YYYY-MM-DD）" },
    };
  }
  if (targetMs < birthMs) {
    return {
      ok: false,
      error: { code: "TARGET_BEFORE_BIRTH", message: "目标日期早于出生日期" },
    };
  }

  const b = new Date(birthMs);
  const t = new Date(targetMs);
  const birthYear = b.getUTCFullYear();
  const birthMonth = b.getUTCMonth() + 1;
  const birthDay = b.getUTCDate();
  const targetYear = t.getUTCFullYear();
  const targetMonth = t.getUTCMonth() + 1;
  const targetDay = t.getUTCDate();

  // 2 月 29 日出生者：目标年为平年时按 3 月 1 日视为生日已到
  let cmpMonth = birthMonth;
  let cmpDay = birthDay;
  if (birthMonth === 2 && birthDay === 29 && !isLeapYear(targetYear)) {
    cmpMonth = 3;
    cmpDay = 1;
  }

  let years = targetYear - birthYear;
  if (
    targetMonth < cmpMonth ||
    (targetMonth === cmpMonth && targetDay < cmpDay)
  ) {
    years -= 1;
  }
  return { ok: true, years };
}
