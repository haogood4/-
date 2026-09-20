// 时间戳换算计算器 —— 纯函数，无 DOM 依赖
// to-date：把秒/毫秒时间戳转 UTC+8（Asia/Shanghai）字符串
// to-timestamp：把 'YYYY-MM-DD HH:mm'（视作 UTC+8）转秒/毫秒

export type TsUnit = "s" | "ms";
export type TsDirection = "to-date" | "to-timestamp";

export type TimestampErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE" | "INVALID_DATE";

export type TimestampResult =
  | {
      ok: true;
      formatted: string;
      processText: string;
      epochMs: number;
    }
  | { ok: false; error: { code: TimestampErrorCode; message: string } };

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_MS = 32_503_680_000_000; // ≈ 公元 3000 年附近
const MAX_S = 32_503_680_00;
const DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;

function fail(code: TimestampErrorCode, message: string): TimestampResult {
  return { ok: false, error: { code, message } };
}

// 将毫秒时间戳格式化为固定 UTC+8 字符串，避免依赖宿主 locale
function formatShanghai(ms: number): string {
  // 计算 UTC+8 当日的 year/month/day/hour/minute/second/milli
  const shifted = new Date(ms + 8 * 3600 * 1000);
  const y = shifted.getUTCFullYear();
  const mo = shifted.getUTCMonth() + 1;
  const d = shifted.getUTCDate();
  const h = shifted.getUTCHours();
  const mi = shifted.getUTCMinutes();
  const s = shifted.getUTCSeconds();
  const mil = shifted.getUTCMilliseconds();
  const pad = (n: number) => String(n).padStart(2, "0");
  const pad3 = (n: number) => String(n).padStart(3, "0");
  const base = `${y}-${pad(mo)}-${pad(d)} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  return mil === 0 ? base : `${base}.${pad3(mil)}`;
}

export function convertTimestamp(
  raw: string,
  unit: string,
  direction: string,
): TimestampResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请输入内容");
  }
  if (unit !== "s" && unit !== "ms") {
    return fail("INVALID_DATE", "不支持的单位");
  }
  if (direction !== "to-date" && direction !== "to-timestamp") {
    return fail("INVALID_DATE", "不支持的转换方向");
  }

  if (direction === "to-date") {
    if (!NUMBER_RE.test(trimmed)) {
      return fail("INVALID_NUMBER", "请输入有效的数字");
    }
    const n = Number(trimmed);
    if (!Number.isFinite(n)) {
      return fail("INVALID_NUMBER", "请输入有效的数字");
    }
    let ms: number;
    let upperMs: number;
    if (unit === "s") {
      ms = n * 1000;
      upperMs = MAX_S * 1000;
    } else {
      ms = n;
      upperMs = MAX_MS;
    }
    if (ms < 0) {
      return fail("OUT_OF_RANGE", "时间戳不能为负数");
    }
    if (ms > upperMs) {
      return fail("OUT_OF_RANGE", "时间戳超出范围（不超过公元 3000 年）");
    }
    const formatted = formatShanghai(ms);
    const unitLabel = unit === "s" ? "秒" : "毫秒";
    const processText = `${trimmed} ${unitLabel} → ${formatted}（UTC+8）`;
    return { ok: true, formatted, processText, epochMs: ms };
  }

  // direction === "to-timestamp"
  const match = DATETIME_RE.exec(trimmed);
  if (!match) {
    return fail("INVALID_DATE", "请输入 YYYY-MM-DD HH:mm 格式");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  // 校验真实存在的日期（不允许 2025-02-30）
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const check = new Date(utcMs);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute
  ) {
    return fail("INVALID_DATE", "日期或时间不合法");
  }

  // UTC+8 解析：UTC 时间减去 8 小时
  const ms = utcMs - 8 * 3600 * 1000;
  if (ms < 0) {
    return fail("OUT_OF_RANGE", "时间戳不能为负数");
  }
  if (ms > MAX_MS) {
    return fail("OUT_OF_RANGE", "时间戳超出范围（不超过公元 3000 年）");
  }

  const value = unit === "s" ? Math.floor(ms / 1000) : ms;
  const unitLabel = unit === "s" ? "秒" : "毫秒";
  const processText = `${trimmed}（UTC+8） → ${value} ${unitLabel}`;
  return { ok: true, formatted: String(value), processText, epochMs: ms };
}
