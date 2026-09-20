// 敏感词检测引擎（src/lib/calculators/sensitive-word-cn.ts）
// 纯前端检测：本地遍历 4 类常见违规词占位 + 高频规避写法识别。
// 不收集上传文本，符合「敏感词检测工具」纯前端定位。
//
// 词库说明：
// - 词库数据已外置到 public/data/sensitive-word.json（页面脚本首次检测时
//   fetch 懒加载），本文件只保留纯逻辑，检测时通过参数传入 WordDict。
// - 不收录真实政治敏感词，仅以「示例A」「示例B」等占位表示分类与命中规则。
// - 真实常见违规词（赌博/色情/广告引流等）以类别代表词形式收录，便于演示。
// - 检测目标：教学演示 + 自媒体/UGC 内容自检，不替代平台合规审核。

export type SensitiveCategory =
  | "politics" // 政治
  | "violence" // 暴力
  | "porn" // 色情
  | "ad"; // 广告引流

export const CATEGORY_META: Record<
  SensitiveCategory,
  { key: SensitiveCategory; label: string; tone: "high" | "warn" }
> = {
  politics: { key: "politics", label: "政治敏感", tone: "high" },
  violence: { key: "violence", label: "暴力相关", tone: "high" },
  porn: { key: "porn", label: "色情低俗", tone: "high" },
  ad: { key: "ad", label: "广告引流", tone: "warn" },
};

export interface SensitiveWord {
  /** 命中后展示给用户的中文标签 */
  label: string;
  /** 实际匹配的关键词或正则（关键词为字符串，正则以 /pattern/flags 表示） */
  pattern: string;
  /** 命中后给出的替换建议提示 */
  suggest: string;
}

/** 外置词库数据结构（public/data/sensitive-word.json 即此形状的 JSON） */
export type WordDict = Record<SensitiveCategory, SensitiveWord[]>;

/** 高频规避写法：去符号、空格、繁简、相似字等。命中后给出提示。 */
export const EVASION_RULES: Array<{
  label: string;
  re: RegExp;
  suggest: string;
}> = [
  {
    label: "可疑链接",
    re: /\b(?:https?:\/\/|www\.)[^\s]{4,}/gi,
    suggest: "建议移除可疑链接",
  },
  {
    label: "联系方式",
    re: /(?:1[3-9]\d{9})|(?:\d{3,4}-\d{7,8})/g,
    suggest: "建议移除手机号/座机号",
  },
  {
    label: "二维码占位",
    re: /二维码|扫码|扫一扫/g,
    suggest: "建议移除引导扫码的引流话术",
  },
];

/** 命中详情 */
export interface SensitiveHit {
  category: SensitiveCategory;
  label: string;
  word: string; // 实际命中的关键词（来自词条 pattern）
  positions: Array<[number, number]>; // [start, end)
  suggest: string;
}

/** 检测选项 */
export interface SensitiveOptions {
  categories?: SensitiveCategory[]; // 默认 4 类全开
}

/** 检测结果 */
export interface SensitiveResult {
  totalHits: number;
  hits: SensitiveHit[];
  categoryStats: Record<SensitiveCategory, number>;
  /** 替换占位符后的脱敏文本（用 * 替换命中片段） */
  masked: string;
  /** 检测耗时（ms） */
  elapsedMs: number;
}

export type SensitiveCalcResult =
  | { ok: true; value: SensitiveResult }
  | { ok: false; error: { code: string; message: string } };

const MAX_TEXT_LEN = 20000;

/**
 * 单关键词命中所有位置（重叠检测，从前往后扫描，不依赖正则 lastIndex）
 */
function findPositions(text: string, keyword: string): Array<[number, number]> {
  if (!keyword) return [];
  const positions: Array<[number, number]> = [];
  let from = 0;
  const t = text;
  while (from <= t.length - keyword.length) {
    const idx = t.indexOf(keyword, from);
    if (idx === -1) break;
    positions.push([idx, idx + keyword.length]);
    from = idx + 1; // 允许重叠命中（如 "不不"）
  }
  return positions;
}

/**
 * 检测主函数：遍历传入词库 + 规避规则，返回所有命中。
 * 为降低替换复杂度，先收集全部命中区间再做合并与遮罩。
 * 词库由调用方（页面脚本 fetch 懒加载）传入；绝不 throw。
 */
export function detectSensitive(
  text: string,
  dict: WordDict,
  options: SensitiveOptions = {},
): SensitiveCalcResult {
  const safeText = text ?? "";
  if (safeText.length > MAX_TEXT_LEN) {
    return {
      ok: false,
      error: {
        code: "TEXT_TOO_LONG",
        message: `文本长度不能超过 ${MAX_TEXT_LEN} 字符`,
      },
    };
  }

  const start = Date.now();
  const cats: SensitiveCategory[] =
    options.categories && options.categories.length > 0
      ? options.categories
      : (Object.keys(CATEGORY_META) as SensitiveCategory[]);

  const hits: SensitiveHit[] = [];
  const categoryStats: Record<SensitiveCategory, number> = {
    politics: 0,
    violence: 0,
    porn: 0,
    ad: 0,
  };

  for (const cat of cats) {
    const words = dict?.[cat] ?? [];
    for (const w of words) {
      const positions = findPositions(safeText, w.pattern);
      if (positions.length === 0) continue;
      hits.push({
        category: cat,
        label: w.label,
        word: w.pattern,
        positions,
        suggest: w.suggest,
      });
      categoryStats[cat] += positions.length;
    }
    // 规避规则
    for (const rule of EVASION_RULES) {
      let m: RegExpExecArray | null;
      const positions: Array<[number, number]> = [];
      rule.re.lastIndex = 0;
      while ((m = rule.re.exec(safeText)) !== null) {
        const startIdx = m.index;
        const endIdx = startIdx + m[0].length;
        if (m[0].length === 0) {
          rule.re.lastIndex++;
          continue;
        }
        positions.push([startIdx, endIdx]);
      }
      if (positions.length === 0) continue;
      hits.push({
        category: "ad",
        label: rule.label,
        word: rule.label,
        positions,
        suggest: rule.suggest,
      });
      categoryStats.ad += positions.length;
    }
  }

  const masked = maskText(safeText, hits);
  const elapsedMs = Date.now() - start;

  return {
    ok: true,
    value: {
      totalHits: hits.reduce((sum, h) => sum + h.positions.length, 0),
      hits,
      categoryStats,
      masked,
      elapsedMs,
    },
  };
}

/**
 * 把所有命中区间合并并用「*」替换。
 * 区间按起点升序，重叠时取并集。
 */
export function maskText(text: string, hits: SensitiveHit[]): string {
  if (!text || hits.length === 0) return text;
  const ranges: Array<[number, number]> = [];
  for (const h of hits) {
    for (const p of h.positions) ranges.push(p);
  }
  if (ranges.length === 0) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) {
      if (r[1] > last[1]) last[1] = r[1];
    } else {
      merged.push([r[0], r[1]]);
    }
  }
  let out = "";
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) out += text.slice(cursor, s);
    const len = Math.max(1, e - s);
    out += "*".repeat(Math.min(len, 8));
    cursor = e;
  }
  if (cursor < text.length) out += text.slice(cursor);
  return out;
}

/** 词库总览，便于页面渲染统计 */
export function getLibraryStats(
  dict: WordDict,
): Record<SensitiveCategory, number> {
  return {
    politics: dict?.politics?.length ?? 0,
    violence: dict?.violence?.length ?? 0,
    porn: dict?.porn?.length ?? 0,
    ad: dict?.ad?.length ?? 0,
  };
}

/** 友好的检测摘要文案 */
export function summarizeHits(value: SensitiveResult): string {
  if (value.totalHits === 0) return "未检测到敏感词";
  const parts: string[] = [];
  const order: SensitiveCategory[] = ["politics", "violence", "porn", "ad"];
  for (const c of order) {
    const n = value.categoryStats[c];
    if (n > 0) parts.push(`${CATEGORY_META[c].label} ${n} 处`);
  }
  return `共命中 ${value.totalHits} 处 · ${parts.join(" · ")}`;
}
