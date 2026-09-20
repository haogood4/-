// 文本相似度对比引擎 —— 纯函数，无 DOM 依赖
// 规则：预处理（ignoreCase 转小写、ignoreWhitespace 移除所有 \s）后，
// 用一维 DP 计算 Levenshtein 编辑距离（按 Unicode 码点计数，兼容 emoji），
// similarity = 1 - 编辑距离 / 较长文本码点数（双方皆空视为完全相同 = 1），保留 4 位小数；
// jaccard 为词级相似度：中文按单字切词、英文按空白切词（非空白连续串为一个词），同样保留 4 位小数；
// verdict 按 similarity 分档：≥0.8 high、≥0.5 medium、<0.5 low。
// 上限：预处理后单侧文本 5000 字符（码点），超限返回 TOO_LONG 提示截断。绝不 throw。

export interface CompareTextInput {
  /** 文本 A */
  a: string;
  /** 文本 B */
  b: string;
  /** 忽略大小写（比较前统一转小写） */
  ignoreCase: boolean;
  /** 忽略空白（比较前移除所有 \s 字符） */
  ignoreWhitespace: boolean;
}

export interface CompareTextValue {
  /** Levenshtein 编辑距离（按码点） */
  levenshtein: number;
  /** 编辑距离归一化相似度，0-1，保留 4 位小数 */
  similarity: number;
  /** 词级 Jaccard 相似度，0-1，保留 4 位小数 */
  jaccard: number;
  /** 预处理后文本 A 码点数 */
  lengthA: number;
  /** 预处理后文本 B 码点数 */
  lengthB: number;
  /** 判定：≥0.8 high / ≥0.5 medium / <0.5 low */
  verdict: "high" | "medium" | "low";
}

export type CompareTextErrorCode = "INVALID_INPUT" | "TOO_LONG";

export type CompareTextResult =
  | { ok: true; value: CompareTextValue }
  | { ok: false; error: { code: CompareTextErrorCode; message: string } };

/** 预处理后单侧文本码点数上限（编辑距离 DP 为 O(m×n)，超限提示截断） */
export const MAX_TEXT_CHARS = 5000;

/** CJK 统一表意文字区（含扩展 A 与兼容表意文字），逐字成词 */
const CJK = "\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF";
/** 切词：单个 CJK 字为一个词；其余非空白连续串（英文单词等）为一个词 */
const TOKEN_RE = new RegExp(`[${CJK}]|[^\\s${CJK}]+`, "g");

function preprocess(s: string, ignoreCase: boolean, ignoreWs: boolean): string {
  let out = s;
  if (ignoreCase) out = out.toLowerCase();
  if (ignoreWs) out = out.replace(/\s+/g, "");
  return out;
}

/** 一维 DP 的 Levenshtein 距离，输入为码点数组 */
function levenshtein(a: string[], b: string[]): number {
  const n = b.length;
  const dp: number[] = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prevDiag = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const above = dp[j];
      dp[j] = Math.min(
        above + 1,
        dp[j - 1] + 1,
        prevDiag + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prevDiag = above;
    }
  }
  return dp[n];
}

function tokenize(s: string): string[] {
  return s.match(TOKEN_RE) ?? [];
}

function jaccardOf(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.length === 0 && tb.length === 0) return 1;
  const setA = new Set(ta);
  const setB = new Set(tb);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 1 : inter / union;
}

/** 四舍五入保留 4 位小数 */
function round4(x: number): number {
  return Math.round(x * 10000) / 10000;
}

function verdictOf(similarity: number): "high" | "medium" | "low" {
  if (similarity >= 0.8) return "high";
  if (similarity >= 0.5) return "medium";
  return "low";
}

export function compareText(input: CompareTextInput): CompareTextResult {
  const { a, b, ignoreCase, ignoreWhitespace } = input;
  if (typeof a !== "string" || typeof b !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "两段输入都必须是文本字符串" },
    };
  }

  const pa = preprocess(a, ignoreCase, ignoreWhitespace);
  const pb = preprocess(b, ignoreCase, ignoreWhitespace);
  const ca = Array.from(pa);
  const cb = Array.from(pb);

  if (ca.length > MAX_TEXT_CHARS || cb.length > MAX_TEXT_CHARS) {
    const who = ca.length > MAX_TEXT_CHARS ? "文本 A" : "文本 B";
    return {
      ok: false,
      error: {
        code: "TOO_LONG",
        message: `${who}超过 ${MAX_TEXT_CHARS} 字符上限，请截断后再对比`,
      },
    };
  }

  const lev = levenshtein(ca, cb);
  const maxLen = Math.max(ca.length, cb.length);
  const similarity = round4(maxLen === 0 ? 1 : 1 - lev / maxLen);
  const jaccard = round4(jaccardOf(pa, pb));

  return {
    ok: true,
    value: {
      levenshtein: lev,
      similarity,
      jaccard,
      lengthA: ca.length,
      lengthB: cb.length,
      verdict: verdictOf(similarity),
    },
  };
}
