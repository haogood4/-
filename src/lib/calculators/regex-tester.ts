// 正则表达式测试引擎（本地匹配，不 throw，判别联合返回）

/** 单条匹配结果 */
export interface RegexMatchItem {
  /** 匹配在测试文本中的起始下标（UTF-16 码元） */
  index: number;
  /** 匹配内容长度（UTF-16 码元） */
  length: number;
  /** 匹配到的文本 */
  match: string;
  /** 捕获组（未参与的可选组以空字符串表示） */
  groups: string[];
}

export interface RegexMatchValue {
  matches: RegexMatchItem[];
  total: number;
  /** 是否带 g 标志（无 g 只返回首个匹配） */
  hasG: boolean;
  /** 匹配数超过上限被截断 */
  truncated: boolean;
}

export type RegexMatchResult =
  | { ok: true; value: RegexMatchValue }
  | { ok: false; error: { code: string; message: string } };

/** 匹配数上限，防止极端输入拖垮页面 */
export const MAX_MATCHES = 500;

const ALLOWED_FLAGS = "gimsuvy";

function toMatchItem(m: RegExpExecArray): RegexMatchItem {
  const groups: string[] = [];
  for (let i = 1; i < m.length; i++) {
    groups.push(m[i] === undefined ? "" : m[i]);
  }
  return { index: m.index, length: m[0].length, match: m[0], groups };
}

export function matchRegex(
  pattern: string,
  flags: string,
  text: string,
): RegexMatchResult {
  if (
    typeof pattern !== "string" ||
    typeof flags !== "string" ||
    typeof text !== "string"
  ) {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "输入必须是字符串" },
    };
  }
  if (pattern === "") {
    return {
      ok: false,
      error: { code: "INVALID_PATTERN", message: "正则表达式不能为空" },
    };
  }
  for (const f of flags) {
    if (!ALLOWED_FLAGS.includes(f)) {
      return {
        ok: false,
        error: {
          code: "INVALID_FLAGS",
          message: `非法标志「${f}」：仅支持 g i m s u v y`,
        },
      };
    }
    if (flags.indexOf(f) !== flags.lastIndexOf(f)) {
      return {
        ok: false,
        error: {
          code: "INVALID_FLAGS",
          message: `标志「${f}」重复`,
        },
      };
    }
  }

  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: { code: "INVALID_PATTERN", message: `正则语法错误：${msg}` },
    };
  }

  const hasG = flags.includes("g");
  const matches: RegexMatchItem[] = [];
  let truncated = false;

  if (!hasG) {
    const m = re.exec(text);
    if (m) matches.push(toMatchItem(m));
  } else {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(toMatchItem(m));
      // 零宽匹配防死循环：手动推进 lastIndex
      if (m[0].length === 0) re.lastIndex++;
      if (matches.length >= MAX_MATCHES) {
        if (re.exec(text) !== null) truncated = true;
        break;
      }
    }
  }

  return {
    ok: true,
    value: { matches, total: matches.length, hasG, truncated },
  };
}
