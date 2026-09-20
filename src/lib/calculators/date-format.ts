// 日期格式转换器 —— 纯函数，无 DOM 依赖
// 解析全部手写正则（不使用 Date 字符串解析，规避宿主时区坑）：
// - 年在前：2026-09-20 / 2026/9/20 / 2026.09.20 / 2026年9月20日，可带 14:30:00 时间尾巴
// - 年在后（月日序/日月序）：09/20/2026（MM-DD-YYYY）、20/09/2026（DD-MM-YYYY），
//   两段均 ≤12 时按美式 MM-DD-YYYY 处理
// - 紧凑 8 位：20260920
// - 纯数字 Unix 时间戳：10 位=秒、13 位=毫秒
// - ISO 8601 带 Z 或 ±HH:MM / ±HHMM 偏移：按 utcOffset（分钟）换算显示
// 内部统一为 { y,m,d,hh,mm,ss,ms }（UTC 算术 + utcOffset 加减），绝不 throw。

export type DateFormatErrorCode = "UNPARSEABLE" | "INVALID_DATE";

export type DateFormatResult =
  | {
      ok: true;
      /** pattern 模板渲染结果 */
      formatted: string;
      /** 中文名星期（周日/周一/…） */
      weekday: string;
      /** 当年第 N 天（1-366，闰年正确） */
      dayOfYear: number;
      /** 当年总天数（365/366） */
      daysInYear: number;
      isLeapYear: boolean;
      /** Unix 时间戳（秒，向下取整） */
      timestampSec: number;
      /** Unix 时间戳（毫秒） */
      timestampMs: number;
      /** ISO 8601（含 utcOffset 后缀，0 为 Z） */
      iso: string;
    }
  | { ok: false; error: { code: DateFormatErrorCode; message: string } };

interface DateTimeParts {
  y: number;
  m: number;
  d: number;
  hh: number;
  mm: number;
  ss: number;
  ms: number;
}

/** 解析产物：naive = 各分量按 utcOffset 挂钟理解；epoch = 绝对毫秒时刻 */
type ParsedInput =
  { kind: "naive"; parts: DateTimeParts } | { kind: "epoch"; epochMs: number };

const MS_PER_MIN = 60_000;
const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const DIGITS_RE = /^\d+$/;
// ISO 8601 带显式时区（Z / ±HH:MM / ±HHMM）
const ISO_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?(Z|[+-]\d{2}:?\d{2})$/;
// 中文年月日
const CN_RE =
  /^(\d{4})年(\d{1,2})月(\d{1,2})日(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/;
// 年在前：YYYY-MM-DD / YYYY/M/D / YYYY.MM.DD（分隔符需一致）
const YMD_RE =
  /^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/;
// 年在后：MM/DD/YYYY 或 DD/MM/YYYY（分隔符需一致）
const Y_LAST_RE =
  /^(\d{1,2})([-/.])(\d{1,2})\2(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/;

function fail(code: DateFormatErrorCode, message: string): DateFormatResult {
  return { ok: false, error: { code, message } };
}

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
  if (m === 2 && isLeapYear(y)) return 29;
  return MONTH_DAYS[m - 1];
}

function dayOfYear(p: DateTimeParts): number {
  let n = p.d;
  for (let i = 1; i < p.m; i++) n += daysInMonth(p.y, i);
  return n;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");
const pad3 = (n: number): string => String(n).padStart(3, "0");
const pad4 = (n: number): string => String(n).padStart(4, "0");

/** 校验分量合法性，返回错误消息或 null */
function validateParts(p: DateTimeParts): string | null {
  if (p.y < 1 || p.y > 9999) return "年份需在 1–9999 之间";
  if (p.m < 1 || p.m > 12) return "月份需在 1–12 之间";
  if (p.d < 1 || p.d > daysInMonth(p.y, p.m))
    return `${p.y}年${p.m}月不存在 ${p.d} 日`;
  if (p.hh < 0 || p.hh > 23) return "小时需在 0–23 之间";
  if (p.mm < 0 || p.mm > 59) return "分钟需在 0–59 之间";
  if (p.ss < 0 || p.ss > 59) return "秒数需在 0–59 之间";
  return null;
}

/** 从正则捕获组的可选时间尾巴（hh, mm, ss?, ms?）读取时间分量 */
function readTimeTail(
  m: RegExpExecArray,
  i: number,
): Omit<DateTimeParts, "y" | "m" | "d"> {
  if (m[i] === undefined) return { hh: 0, mm: 0, ss: 0, ms: 0 };
  const frac = m[i + 3];
  return {
    hh: Number(m[i]),
    mm: Number(m[i + 1]),
    ss: m[i + 2] !== undefined ? Number(m[i + 2]) : 0,
    ms: frac !== undefined ? Number(frac.padEnd(3, "0")) : 0,
  };
}

/** ISO 偏移串（Z / +08:00 / -0500）→ 分钟数 */
function parseZoneOffset(zone: string): number {
  if (zone === "Z") return 0;
  const sign = zone.startsWith("-") ? -1 : 1;
  const digits = zone.slice(1).replace(":", "");
  return sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4)));
}

function partsFromEpoch(epochMs: number, utcOffset: number): DateTimeParts {
  const d = new Date(epochMs + utcOffset * MS_PER_MIN);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    hh: d.getUTCHours(),
    mm: d.getUTCMinutes(),
    ss: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
  };
}

function parseInput(raw: string): ParsedInput | null {
  // 1) 纯数字：8 位紧凑日期 / 10 位秒 / 13 位毫秒
  if (DIGITS_RE.test(raw)) {
    if (raw.length === 8) {
      return {
        kind: "naive",
        parts: {
          y: Number(raw.slice(0, 4)),
          m: Number(raw.slice(4, 6)),
          d: Number(raw.slice(6, 8)),
          hh: 0,
          mm: 0,
          ss: 0,
          ms: 0,
        },
      };
    }
    if (raw.length === 10)
      return { kind: "epoch", epochMs: Number(raw) * 1000 };
    if (raw.length === 13) return { kind: "epoch", epochMs: Number(raw) };
    return null;
  }

  // 2) ISO 8601 带 Z / ±HH:MM：先算绝对 epoch，再按 utcOffset 渲染
  const iso = ISO_RE.exec(raw);
  if (iso) {
    const zoneMs = parseZoneOffset(iso[8]) * MS_PER_MIN;
    const tail = readTimeTail(iso, 4);
    const naiveUtc = Date.UTC(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      tail.hh,
      tail.mm,
      tail.ss,
      tail.ms,
    );
    return { kind: "epoch", epochMs: naiveUtc - zoneMs };
  }

  // 3) 中文「2026年9月20日」
  const cn = CN_RE.exec(raw);
  if (cn) {
    const tail = readTimeTail(cn, 4);
    return {
      kind: "naive",
      parts: {
        y: Number(cn[1]),
        m: Number(cn[2]),
        d: Number(cn[3]),
        ...tail,
      },
    };
  }

  // 4) 年在前：2026-09-20 / 2026/9/20 / 2026.09.20（可带时间）
  const ymd = YMD_RE.exec(raw);
  if (ymd) {
    const tail = readTimeTail(ymd, 5);
    return {
      kind: "naive",
      parts: {
        y: Number(ymd[1]),
        m: Number(ymd[3]),
        d: Number(ymd[4]),
        ...tail,
      },
    };
  }

  // 5) 年在后：第二段 >12 → 美式 MM-DD-YYYY；首段 >12 → 欧式 DD-MM-YYYY；
  //    两段均 ≤12 时默认美式
  const yl = Y_LAST_RE.exec(raw);
  if (yl) {
    const a = Number(yl[1]);
    const b = Number(yl[3]);
    const dayFirst = b > 12 && a <= 12 ? false : a > 12;
    const tail = readTimeTail(yl, 5);
    return {
      kind: "naive",
      parts: {
        y: Number(yl[4]),
        m: dayFirst ? b : a,
        d: dayFirst ? a : b,
        ...tail,
      },
    };
  }

  return null;
}

/** 模板渲染：YYYY YY MM M DD D HH mm ss，其余字符按字面量透传 */
function renderPattern(pattern: string, p: DateTimeParts): string {
  let out = "";
  let i = 0;
  while (i < pattern.length) {
    const rest = pattern.slice(i);
    if (rest.startsWith("YYYY")) {
      out += pad4(p.y);
      i += 4;
    } else if (rest.startsWith("YY")) {
      out += pad2(p.y % 100);
      i += 2;
    } else if (rest.startsWith("MM")) {
      out += pad2(p.m);
      i += 2;
    } else if (rest.startsWith("M")) {
      out += String(p.m);
      i += 1;
    } else if (rest.startsWith("DD")) {
      out += pad2(p.d);
      i += 2;
    } else if (rest.startsWith("D")) {
      out += String(p.d);
      i += 1;
    } else if (rest.startsWith("HH")) {
      out += pad2(p.hh);
      i += 2;
    } else if (rest.startsWith("mm")) {
      out += pad2(p.mm);
      i += 2;
    } else if (rest.startsWith("ss")) {
      out += pad2(p.ss);
      i += 2;
    } else {
      out += pattern[i];
      i += 1;
    }
  }
  return out;
}

function offsetLabel(utcOffset: number): string {
  if (utcOffset === 0) return "Z";
  const sign = utcOffset > 0 ? "+" : "-";
  const abs = Math.abs(utcOffset);
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`;
}

export function formatDate(input: {
  raw: string;
  pattern: string;
  utcOffset: number;
}): DateFormatResult {
  const raw = (input.raw ?? "").trim();
  if (raw === "") return fail("UNPARSEABLE", "请输入日期、时间戳或 ISO 字符串");

  const utcOffset = Number.isFinite(input.utcOffset)
    ? Math.trunc(input.utcOffset)
    : 0;

  const parsed = parseInput(raw);
  if (!parsed) {
    return fail(
      "UNPARSEABLE",
      "无法识别的格式：支持 YYYY-MM-DD、YYYY/M/D、2026年9月20日、20260920、Unix 秒/毫秒、ISO 8601",
    );
  }

  let parts: DateTimeParts;
  let epochMs: number;
  if (parsed.kind === "epoch") {
    epochMs = parsed.epochMs;
    parts = partsFromEpoch(epochMs, utcOffset);
    const rangeErr =
      parts.y < 1 || parts.y > 9999 ? "时间戳超出支持范围（1–9999 年）" : null;
    if (rangeErr) return fail("INVALID_DATE", rangeErr);
  } else {
    parts = parsed.parts;
    const err = validateParts(parts);
    if (err) return fail("INVALID_DATE", err);
    epochMs =
      Date.UTC(
        parts.y,
        parts.m - 1,
        parts.d,
        parts.hh,
        parts.mm,
        parts.ss,
        parts.ms,
      ) -
      utcOffset * MS_PER_MIN;
  }

  const pattern =
    (input.pattern ?? "").trim() === "" ? "YYYY-MM-DD" : input.pattern;
  const weekday =
    WEEKDAY_NAMES[
      new Date(Date.UTC(parts.y, parts.m - 1, parts.d)).getUTCDay()
    ];
  const leap = isLeapYear(parts.y);
  const iso = `${pad4(parts.y)}-${pad2(parts.m)}-${pad2(parts.d)}T${pad2(parts.hh)}:${pad2(parts.mm)}:${pad2(parts.ss)}${parts.ms > 0 ? `.${pad3(parts.ms)}` : ""}${offsetLabel(utcOffset)}`;

  return {
    ok: true,
    formatted: renderPattern(pattern, parts),
    weekday,
    dayOfYear: dayOfYear(parts),
    daysInYear: leap ? 366 : 365,
    isLeapYear: leap,
    timestampSec: Math.floor(epochMs / 1000),
    timestampMs: epochMs,
    iso,
  };
}
