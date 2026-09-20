// 日期差计算器 —— 纯函数，无 DOM 依赖
// daysBetween = end − start 的天数差，不含首尾「双计」：
// 2025-01-01 → 2025-01-02 = 1 天；同日 = 0 天
// 额外字段：
// - countDown: 从今天到 target 的倒计时天数（负数表示过去）

export type DateDiffErrorCode = "INVALID_DATE" | "END_BEFORE_START";

export type DateDiffResult =
  | { ok: true; days: number; weeks: number; months: number; years: number; countDownToTarget: number }
  | { ok: false; error: { code: DateDiffErrorCode; message: string } };

const MS_PER_DAY = 86_400_000;

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

// 月数差（粗略）：用每年 12 月近似
function diffMonths(startMs: number, endMs: number): number {
  const s = new Date(startMs);
  const e = new Date(endMs);
  return (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth());
}

export function daysBetween(start: string, end: string, todayIso?: string): DateDiffResult {
  const startMs = parseUtcDate(start);
  if (startMs === null) {
    return {
      ok: false,
      error: { code: "INVALID_DATE", message: "请输入有效日期（YYYY-MM-DD）" },
    };
  }
  const endMs = parseUtcDate(end);
  if (endMs === null) {
    return {
      ok: false,
      error: { code: "INVALID_DATE", message: "请输入有效日期（YYYY-MM-DD）" },
    };
  }
  if (endMs < startMs) {
    return {
      ok: false,
      error: { code: "END_BEFORE_START", message: "结束日期早于开始日期" },
    };
  }
  const days = Math.round((endMs - startMs) / MS_PER_DAY);
  // 倒计时：从今天到「end」日期的天数差（todayIso 缺省时用客户端今天 UTC 日期）
  const today = todayIso ?? new Date().toISOString().slice(0, 10);
  const todayMs = parseUtcDate(today);
  const countDownToTarget = todayMs === null ? 0 : Math.round((endMs - todayMs) / MS_PER_DAY);
  const totalMonths = diffMonths(startMs, endMs);
  return {
    ok: true,
    days,
    weeks: Math.floor(days / 7),
    months: totalMonths,
    years: Math.floor(totalMonths / 12),
    countDownToTarget,
  };
}