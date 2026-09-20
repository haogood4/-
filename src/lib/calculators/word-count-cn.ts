export type WordInput = { text: string };
export type WordResult = {
  chars: number; // 总字符数（含空格）
  charsNoSpace: number; // 不含空格的字符数
  words: number; // 词数（英文按连续字母串、中文按字）
  han: number; // 汉字数
  punct: number; // 中英文标点数
  lines: number; // 行数
  paragraphs: number; // 段落数
};
export type WordCalcResult =
  | { ok: true; value: WordResult }
  | { ok: false; error: { code: string; message: string } };

// 汉字范围：CJK 基本区
const HAN_RE = /[\u4e00-\u9fa5]/g;
// 中文标点 + ASCII 标点（含常见中文标点 ！。，；：、《》【】等）
// 使用 Unicode 转义避免源码中出现全角空格触发 lint
const PUNCT_RE =
  /[\u3000-〿＀-｠￰-￿,.!?;:。，！？；：、""''（）【】《》]/g;

export function countWords(input: WordInput): WordCalcResult {
  const t = input.text;
  if (!t) {
    return {
      ok: true,
      value: { chars: 0, charsNoSpace: 0, words: 0, han: 0, punct: 0, lines: 0, paragraphs: 0 },
    };
  }
  const chars = [...t].length;
  const charsNoSpace = t.replace(/\s/g, "").length;
  const han = (t.match(HAN_RE) ?? []).length;
  const punct = (t.match(PUNCT_RE) ?? []).length;
  // 英文词：连续字母串
  const wordsEn = (t.match(/[a-zA-Z]+/g) ?? []).length;
  // 中文每字算 1 词；数字串按独立单元（参考既有实现：非英文字符的总字数）
  const nonAscii = chars - [...t.replace(/[a-zA-Z\s]/g, "")].length;
  const words = wordsEn + nonAscii;
  const lines = t.split("\n").length;
  const paragraphs = t.split(/\n\s*\n/).filter((s) => s.trim()).length;
  return { ok: true, value: { chars, charsNoSpace, words, han, punct, lines, paragraphs } };
}

export function formatWordCount(value: WordResult) {
  return {
    chars: String(value.chars) + " 字符（含空格）",
    charsNoSpace: String(value.charsNoSpace) + " 字符（不含空格）",
    words: String(value.words) + " 词",
    han: String(value.han) + " 汉字",
    punct: String(value.punct) + " 标点",
    lines: String(value.lines) + " 行",
    paragraphs: String(value.paragraphs) + " 段",
  };
}