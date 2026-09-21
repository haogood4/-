// src/lib/calculators/ai-stt-cn.ts — 语音转文字（STT）纯逻辑 helper
// 录音与识别在页面脚本调用 webkitSpeechRecognition（浏览器 API 无法在
// Node 单测）；本模块只做片段合并 / 时长格式化等纯函数，供单测覆盖。

export interface SttSegment {
  text: string;
  /** 相对起始秒 */
  t: number;
}

/** CJK 汉字与全角标点（拼接时无需补空格的字符） */
function isCjkish(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK 统一表意文字
    (code >= 0x3400 && code <= 0x4dbf) || // 扩展 A
    (code >= 0xf900 && code <= 0xfaff) || // 兼容表意文字
    (code >= 0x3000 && code <= 0x303f) || // CJK 标点
    (code >= 0xff00 && code <= 0xffef) // 全角字符
  );
}

function boundaryChar(s: string, at: "head" | "tail"): string {
  if (s === "") return "";
  return at === "head"
    ? String.fromCodePoint(s.codePointAt(0) ?? 0)
    : String.fromCodePoint(s.codePointAt(s.length - 1) ?? 0);
}

/**
 * 合并识别片段：过滤空白并 trim；
 * 两侧均为中文（含全角标点）时直接拼接，否则补一个空格。
 */
export function chunksToText(chunks: string[]): string {
  const parts = chunks.map((c) => c.trim()).filter((c) => c !== "");
  if (parts.length === 0) return "";
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const prevTail = boundaryChar(out, "tail");
    const nextHead = boundaryChar(parts[i], "head");
    const noSpace = isCjkish(prevTail) && isCjkish(nextHead);
    out = noSpace ? out + parts[i] : `${out} ${parts[i]}`;
  }
  return out;
}

/** 合并带时间戳的片段：文本 + 首尾时间跨度（秒） */
export function mergeSegments(segments: SttSegment[]): {
  text: string;
  span: number;
} {
  if (segments.length === 0) return { text: "", span: 0 };
  const text = chunksToText(segments.map((s) => s.text));
  const span = Math.max(0, segments[segments.length - 1].t - segments[0].t);
  return { text, span };
}

/** 秒 → 「mm:ss」（超过 1 小时显示总分钟数，负数按 0 处理） */
export function formatClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/** 码点计数（1 个 emoji / 代理对计 1） */
export function countCodePoints(text: string): number {
  let n = 0;
  for (const _ch of text) n++;
  return n;
}
