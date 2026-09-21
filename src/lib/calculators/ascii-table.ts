// 字符编码查询引擎（src/lib/calculators/ascii-table.ts）
// 双向查询：字符 → 码点/十六进制/UTF-8 字节；码点（十进制/0x/U+ 前缀）→ 字符与全部表示。
// ASCII 对照静态数据（0-127）已外置至 /data/ascii-table.json：.astro frontmatter
// 构建期 import 渲染静态表格，页面脚本运行时 lazy fetch，本引擎保持纯查询逻辑。
// 约定：任何非法输入均返回 { ok: false }，绝不 throw（判别联合）。

/** 单个字符的编码信息（代理对合并为一个码点条目） */
export interface CharCodeInfo {
  /** 字符本身（astral 字符为完整代理对） */
  char: string;
  /** 十进制 Unicode 码点 */
  codePoint: number;
  /** 十六进制表示，如 0x4E2D（大写、最少两位） */
  hex: string;
  /** UTF-8 字节序列（大写十六进制、空格分隔），如 E4 B8 AD */
  utf8Bytes: string;
  /** Unicode 码点表示，如 U+4E2D（大写、四位起） */
  unicode: string;
}

export type AsciiEngineError = {
  code:
    | "EMPTY_INPUT"
    | "INVALID_CODE"
    | "OUT_OF_RANGE"
    | "SURROGATE_RANGE"
    | "INPUT_TOO_LONG";
  message: string;
};

export type CharToCodesResult =
  | { ok: true; value: { items: CharCodeInfo[]; count: number } }
  | { ok: false; error: AsciiEngineError };

export type CodeToCharResult =
  { ok: true; value: CharCodeInfo } | { ok: false; error: AsciiEngineError };

/** 字符→编码单次查询的字符数上限（防超长输入拖垮表格渲染） */
export const MAX_QUERY_CHARS = 2000;

export const MAX_CODE_POINT = 0x10ffff;
export const SURROGATE_START = 0xd800;
export const SURROGATE_END = 0xdfff;

const encoder = new TextEncoder();

/** 码点 → UTF-8 字节序列字符串（如 0x4E2D → "E4 B8 AD"） */
function utf8BytesOf(cp: number): string {
  const bytes = encoder.encode(String.fromCodePoint(cp));
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    if (i > 0) out += " ";
    out += bytes[i].toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

/** 由码点构造全部表示 */
function infoFromCodePoint(cp: number): CharCodeInfo {
  return {
    char: String.fromCodePoint(cp),
    codePoint: cp,
    hex: `0x${cp.toString(16).toUpperCase().padStart(2, "0")}`,
    utf8Bytes: utf8BytesOf(cp),
    unicode: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
  };
}

/**
 * 字符 → 编码：按码点遍历（Array.from 语义，代理对合并为一个条目），
 * 返回每个字符的十进制码点、十六进制与 UTF-8 字节序列。
 * 空串合法（返回空列表）；超过 MAX_QUERY_CHARS 返回 INPUT_TOO_LONG。
 */
export function charToCodes(text: string): CharToCodesResult {
  if (typeof text !== "string") {
    return {
      ok: false,
      error: { code: "EMPTY_INPUT", message: "请输入要查询的字符" },
    };
  }
  if (text.length > MAX_QUERY_CHARS) {
    return {
      ok: false,
      error: {
        code: "INPUT_TOO_LONG",
        message: `输入过长，单次最多查询 ${MAX_QUERY_CHARS} 个字符`,
      },
    };
  }
  const items: CharCodeInfo[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;
    items.push(infoFromCodePoint(cp));
  }
  return { ok: true, value: { items, count: items.length } };
}

const HEX_RE = /^[0-9a-fA-F]{1,6}$/;
const DEC_RE = /^\d{1,7}$/;

/**
 * 编码 → 字符：解析十进制（"65"）、十六进制前缀（"0x4E2D"，0X 亦可）
 * 或 Unicode 前缀（"U+4e2d"，u+ 亦可）。
 * 非法格式返回 INVALID_CODE；>0x10FFFF 返回 OUT_OF_RANGE；
 * 代理区 D800-DFFF 无法映射为独立字符，返回 SURROGATE_RANGE。
 */
export function codeToChar(input: string): CodeToCharResult {
  const invalid = (message: string): CodeToCharResult => ({
    ok: false,
    error: { code: "INVALID_CODE", message },
  });
  if (typeof input !== "string") {
    return invalid("请输入码点，如 65、0x4E2D 或 U+1F600");
  }
  const s = input.trim();
  if (s === "") {
    return {
      ok: false,
      error: {
        code: "EMPTY_INPUT",
        message: "请输入码点，如 65、0x4E2D 或 U+1F600",
      },
    };
  }
  let digits: string;
  let radix: 10 | 16;
  if (/^u\+/i.test(s)) {
    digits = s.slice(2);
    radix = 16;
    if (!HEX_RE.test(digits)) {
      return invalid("U+ 后须为 1~6 位十六进制数字，如 U+4E2D");
    }
  } else if (/^0x/i.test(s)) {
    digits = s.slice(2);
    radix = 16;
    if (!HEX_RE.test(digits)) {
      return invalid("0x 后须为 1~6 位十六进制数字，如 0x4E2D");
    }
  } else {
    digits = s;
    radix = 10;
    if (!DEC_RE.test(digits)) {
      return invalid(
        "无法识别的码点格式：支持十进制（65）、0x 十六进制、U+ 表示",
      );
    }
  }
  const cp = parseInt(digits, radix);
  if (cp > MAX_CODE_POINT) {
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: "码点超出 Unicode 范围（最大 0x10FFFF / 1114111）",
      },
    };
  }
  if (cp >= SURROGATE_START && cp <= SURROGATE_END) {
    return {
      ok: false,
      error: {
        code: "SURROGATE_RANGE",
        message: "D800-DFFF 为代理区码点，不能映射为独立字符",
      },
    };
  }
  return { ok: true, value: infoFromCodePoint(cp) };
}
