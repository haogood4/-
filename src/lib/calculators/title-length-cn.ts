// src/lib/calculators/title-length-cn.ts — 标题字数/长度检测引擎（SEO 与社交媒体标题优化）
//
// 各平台阈值依据（公开 SEO 指南 / 平台展示惯例）：
// - 百度：搜索结果中文标题约可完整展示 30 字，超出部分截断（百度 SEO 指南：标题 ≤30 字）；
//   31-36 字视为轻度超出（WARN），>36 字明显截断（OVER）。
// - 谷歌：title 标签桌面端约显示 50-60 字符（Google Search Central 建议标题控制在 60 字符内）；
//   61-75 字轻度截断（WARN），>75 字明显截断（OVER）；<10 字符信息量不足亦给 WARN。
// - 微博：信息流标题 18-22 字展示效果最佳，±4 字内（14-26）为 WARN，区间外为 OVER。
// - 知乎：问题/文章标题建议 30-50 字以完整表达主题，±10 字内（20-60）为 WARN，区间外为 OVER。
//
// 计数口径：
// - chars：Unicode 码点数（emoji 与中文各算 1 个字符）。
// - bytes：UTF-8 字节数（TextEncoder）。
// - units：显示宽度估算，CJK/全角字符（含汉字、假名、韩文、全角标点、常见 emoji）算 2、其余算 1。

export type TitleStatus = "OK" | "WARN" | "OVER";

export interface TitleSuggestion {
  platform: string;
  rule: string;
  status: TitleStatus;
  advice: string;
}

export interface TitleAnalysis {
  chars: number;
  bytes: number;
  units: number;
  suggestions: TitleSuggestion[];
}

export type TitleAnalyzeResult =
  | { ok: true; value: TitleAnalysis }
  | { ok: false; error: { code: string; message: string } };

/** 东亚宽字符 / 全角字符判定（Unicode 区间，近似 EastAsianWidth W/F + 常见宽 emoji） */
function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // 韩文字母 Jamo
    (cp >= 0x2e80 && cp <= 0x303e) || // 部首补充、康熙部首、CJK 标点（含全角空格 U+3000）
    (cp >= 0x3041 && cp <= 0x33ff) || // 平假名、片假名、注音、韩文兼容字母、CJK 兼容
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK 扩展 A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK 统一表意文字基本区
    (cp >= 0xa000 && cp <= 0xa4cf) || // 彝文
    (cp >= 0xac00 && cp <= 0xd7a3) || // 韩文音节
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK 兼容表意文字
    (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK 兼容形式
    (cp >= 0xff00 && cp <= 0xff60) || // 全角形式（！＂…～ 等）
    (cp >= 0xffe0 && cp <= 0xffe6) || // 全角符号（￠￡￥ 等）
    (cp >= 0x1f300 && cp <= 0x1faff) || // 常见宽 emoji（🚀🎯😀 等）
    (cp >= 0x20000 && cp <= 0x3fffd) // CJK 扩展 B 及以后
  );
}

function sug(
  platform: string,
  rule: string,
  status: TitleStatus,
  advice: string,
): TitleSuggestion {
  return { platform, rule, status, advice };
}

function baiduSuggestion(n: number): TitleSuggestion {
  const rule = "中文标题建议 ≤30 字";
  if (n <= 30) {
    return sug("百度", rule, "OK", "长度理想，搜索结果页标题可完整展示。");
  }
  if (n <= 36) {
    return sug(
      "百度",
      rule,
      "WARN",
      `超出建议 ${n - 30} 字，移动端可能被截断，建议精简到 30 字以内。`,
    );
  }
  return sug(
    "百度",
    rule,
    "OVER",
    `超出建议 ${n - 30} 字，搜索引擎会截断显示，建议将核心关键词前置并压缩到 30 字以内。`,
  );
}

function googleSuggestion(n: number): TitleSuggestion {
  const rule = "建议 50-60 字符";
  if (n < 10) {
    return sug(
      "谷歌",
      rule,
      "WARN",
      "标题过短，难以覆盖核心关键词并吸引点击，建议扩展到 50-60 字符。",
    );
  }
  if (n <= 60) {
    return sug("谷歌", rule, "OK", "长度理想，桌面端搜索结果可完整展示。");
  }
  if (n <= 75) {
    return sug(
      "谷歌",
      rule,
      "WARN",
      `偏长 ${n - 60} 字符，尾部可能被截断，建议压缩到 60 字符以内。`,
    );
  }
  return sug(
    "谷歌",
    rule,
    "OVER",
    `过长 ${n - 60} 字符，将被截断并以省略号显示，建议保留核心信息并压缩到 60 字符以内。`,
  );
}

function weiboSuggestion(n: number): TitleSuggestion {
  const rule = "建议 18-22 字";
  if (n >= 18 && n <= 22) {
    return sug("微博", rule, "OK", "处于微博信息流最佳展示区间。");
  }
  if (n >= 14 && n <= 26) {
    return sug(
      "微博",
      rule,
      "WARN",
      "轻度偏离建议区间，列表页可能截断或显得单薄，建议调整到 18-22 字。",
    );
  }
  return sug(
    "微博",
    rule,
    "OVER",
    "与 18-22 字建议区间差距过大，信息展示不完整，建议重写标题。",
  );
}

function zhihuSuggestion(n: number): TitleSuggestion {
  const rule = "建议 30-50 字";
  if (n >= 30 && n <= 50) {
    return sug("知乎", rule, "OK", "长度适中，可完整表达主题并容纳关键词。");
  }
  if (n >= 20 && n <= 60) {
    return sug(
      "知乎",
      rule,
      "WARN",
      "轻度偏离建议区间，建议调整到 30-50 字以获得更好点击率。",
    );
  }
  return sug(
    "知乎",
    rule,
    "OVER",
    "与 30-50 字建议区间差距过大，建议补充主题信息或大幅精简标题。",
  );
}

/** 检测标题长度并给出各平台建议；绝不抛异常 */
export function analyzeTitle(title: string): TitleAnalyzeResult {
  if (typeof title !== "string" || title.trim() === "") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "请输入要检测的标题" },
    };
  }
  const chars = [...title].length;
  const bytes = new TextEncoder().encode(title).length;
  let units = 0;
  for (const ch of title) {
    units += isWide(ch.codePointAt(0) ?? 0) ? 2 : 1;
  }
  const suggestions = [
    baiduSuggestion(chars),
    googleSuggestion(chars),
    weiboSuggestion(chars),
    zhihuSuggestion(chars),
  ];
  return { ok: true, value: { chars, bytes, units, suggestions } };
}
