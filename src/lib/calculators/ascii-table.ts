// 字符编码查询引擎（src/lib/calculators/ascii-table.ts）
// 双向查询：字符 → 码点/十六进制/UTF-8 字节；码点（十进制/0x/U+ 前缀）→ 字符与全部表示。
// 另导出 ASCII_TABLE（0-127 静态对照数据），供 .astro frontmatter 构建期渲染，零运行时 JS。
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

// ---------- ASCII 对照表静态数据（0-127，构建期进 HTML） ----------

export interface ControlEntry {
  code: number;
  name: string;
  desc: string;
}

export interface PrintableEntry {
  code: number;
  char: string;
  name: string;
}

export interface AsciiTable {
  control: ControlEntry[];
  printable: PrintableEntry[];
}

const CONTROL_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["NUL", "空字符（Null），字符串结束符"],
  ["SOH", "标题开始（Start of Heading）"],
  ["STX", "正文开始（Start of Text）"],
  ["EOT", "正文结束（End of Transmission）"],
  ["ENQ", "查询（Enquiry）"],
  ["ACK", "确认应答（Acknowledge）"],
  ["BEL", "响铃（Bell）"],
  ["BS", "退格（Backspace）"],
  ["HT", "水平制表符（Tab，\\t）"],
  ["LF", "换行符（Line Feed，\\n）"],
  ["VT", "垂直制表符（Vertical Tab）"],
  ["FF", "换页符（Form Feed）"],
  ["CR", "回车符（Carriage Return，\\r）"],
  ["SO", "移出（Shift Out）"],
  ["SI", "移入（Shift In）"],
  ["DLE", "数据链转义（Data Link Escape）"],
  ["DC1", "设备控制 1（常作 XON 续传）"],
  ["DC2", "设备控制 2（Device Control 2）"],
  ["DC3", "设备控制 3（常作 XOFF 暂停）"],
  ["DC4", "设备控制 4（Device Control 4）"],
  ["NAK", "否定应答（Negative Acknowledge）"],
  ["SYN", "空转同步（Synchronous Idle）"],
  ["ETB", "传输块结束（End of Transmission Block）"],
  ["CAN", "取消（Cancel）"],
  ["EM", "介质结束（End of Medium）"],
  ["SUB", "替换（Substitute）"],
  ["ESC", "转义（Escape，\\e）"],
  ["FS", "文件分隔符（File Separator）"],
  ["GS", "组分隔符（Group Separator）"],
  ["RS", "记录分隔符（Record Separator）"],
  ["US", "单元分隔符（Unit Separator）"],
  ["DEL", "删除（Delete）"],
];

const PUNCTUATION_NAMES: Readonly<Record<number, string>> = {
  33: "感叹号",
  34: "双引号",
  35: "井号",
  36: "美元符号",
  37: "百分号",
  38: "与号",
  39: "单引号",
  40: "左圆括号",
  41: "右圆括号",
  42: "星号",
  43: "加号",
  44: "逗号",
  45: "连字符",
  46: "句点",
  47: "斜杠",
  58: "冒号",
  59: "分号",
  60: "小于号",
  61: "等号",
  62: "大于号",
  63: "问号",
  64: "at 符号",
  91: "左方括号",
  92: "反斜杠",
  93: "右方括号",
  94: "脱字符",
  95: "下划线",
  96: "反引号",
  123: "左花括号",
  124: "竖线",
  125: "右花括号",
  126: "波浪号",
};

function printableName(code: number, ch: string): string {
  if (code === 32) return "空格";
  if (code >= 48 && code <= 57) return `数字 ${ch}`;
  if (code >= 65 && code <= 90) return `大写字母 ${ch}`;
  if (code >= 97 && code <= 122) return `小写字母 ${ch}`;
  return PUNCTUATION_NAMES[code] ?? "符号";
}

/**
 * ASCII 对照表（0-127）：control 为 32 个控制字符（0-31 与 127），
 * printable 为 95 个可打印字符（32-126）。模块加载时一次性构建，
 * 供 Astro frontmatter 构建期渲染静态表格。
 */
export const ASCII_TABLE: AsciiTable = {
  control: Array.from({ length: 32 }, (_, i) => {
    const code = i === 31 ? 127 : i;
    const [name, desc] = CONTROL_NAMES[i];
    return { code, name, desc };
  }),
  printable: Array.from({ length: 95 }, (_, i) => {
    const code = 32 + i;
    const ch = String.fromCharCode(code);
    return { code, char: ch, name: printableName(code, ch) };
  }),
};
