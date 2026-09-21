// src/lib/calculators/seo-keywords-cn.ts — 长尾关键词扩展（纯函数）
// 模型：核心词分别与「前置词 / 后缀词 / 疑问句模板」三组做笛卡尔拼接，
// 组内保序、全局去重，用于快速批量产出 SEO 长尾词。

export interface LongTailModifiers {
  /** 前置词：修饰语 + 核心词，如「免费」→「免费下载站」 */
  prefixes?: string[];
  /** 后缀词：核心词 + 修饰语，如「推荐」→「下载站推荐」 */
  suffixes?: string[];
  /** 疑问句模板：{k} 为核心词占位符，如「{k}哪个好」 */
  questions?: string[];
}

/**
 * 生成去重保序的长尾词列表。
 * @param core 核心关键词（去首尾空白，非空）
 * @param modifiers 三组修饰词，均允许多行输入
 * @throws 核心词为空时抛错
 */
export function generateLongTail(
  core: string,
  modifiers: LongTailModifiers = {},
): string[] {
  const key = core.trim();
  if (key === "") {
    throw new Error("核心关键词不能为空");
  }
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (word: string): void => {
    const w = word.trim();
    if (w === "" || seen.has(w)) return;
    seen.add(w);
    out.push(w);
  };
  push(key);
  for (const p of modifiers.prefixes ?? []) {
    push(`${p.trim()}${key}`);
  }
  for (const s of modifiers.suffixes ?? []) {
    push(`${key}${s.trim()}`);
  }
  for (const q of modifiers.questions ?? []) {
    push(q.replaceAll("{k}", key));
  }
  return out;
}

/** 将多行文本解析为词条列表（去空行、去重、保序） */
export function parseLines(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || seen.has(line)) continue;
    seen.add(line);
    out.push(line);
  }
  return out;
}
