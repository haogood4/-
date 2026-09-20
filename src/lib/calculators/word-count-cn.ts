export type WordInput = { text: string };
export type WordResult = {
  chars: number;
  words: number;
  lines: number;
  paragraphs: number;
};
export type WordCalcResult =
  | { ok: true; value: WordResult }
  | { ok: false; error: { code: string; message: string } };
export function countWords(input: WordInput): WordCalcResult {
  const t = input.text;
  if (!t)
    return { ok: true, value: { chars: 0, words: 0, lines: 0, paragraphs: 0 } };
  const chars = [...t].length; // Unicode 字符数（中文友好）
  const wordsEn = (t.match(/[a-zA-Z]+/g) || []).length;
  const words = wordsEn + (chars - [...t.replace(/[a-zA-Z\s]/g, "")].length);
  const lines = t.split("\n").length;
  const paragraphs = t.split(/\n\s*\n/).filter((s) => s.trim()).length;
  return { ok: true, value: { chars, words, lines, paragraphs } };
}
export function formatWordCount(value: WordResult) {
  return {
    chars: String(value.chars) + " 字符",
    words: String(value.words) + " 词",
    lines: String(value.lines) + " 行",
    paragraphs: String(value.paragraphs) + " 段",
  };
}
