// 敏感词检测引擎（src/lib/calculators/sensitive-word-cn.ts）
// 纯前端检测：本地遍历 4 类常见违规词占位 + 高频规避写法识别。
// 不收集上传文本，符合「敏感词检测工具」纯前端定位。
//
// 词库说明：
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

export const SENSITIVE_WORDS: Record<SensitiveCategory, SensitiveWord[]> = {
  // 政治：仅用占位示例，避免收录真实政治敏感词；用户文本命中占位视为示意
  politics: [
    { label: "示例A", pattern: "示例A", suggest: "政治相关内容请谨慎发布" },
    { label: "示例B", pattern: "示例B", suggest: "政治相关内容请谨慎发布" },
    { label: "示例C", pattern: "示例C", suggest: "政治相关内容请谨慎发布" },
    { label: "示例D", pattern: "示例D", suggest: "政治相关内容请谨慎发布" },
    { label: "示例E", pattern: "示例E", suggest: "政治相关内容请谨慎发布" },
  ],
  violence: [
    { label: "暴力", pattern: "暴力", suggest: "请避免宣扬或描述暴力行为" },
    { label: "凶杀", pattern: "凶杀", suggest: "请避免宣扬或描述暴力行为" },
    {
      label: "恐怖袭击",
      pattern: "恐怖袭击",
      suggest: "请避免宣扬或描述暴力行为",
    },
    { label: "血腥", pattern: "血腥", suggest: "请避免宣扬或描述暴力行为" },
    { label: "屠杀", pattern: "屠杀", suggest: "请避免宣扬或描述暴力行为" },
    { label: "绑架", pattern: "绑架", suggest: "请避免宣扬或描述暴力行为" },
    { label: "枪支", pattern: "枪支", suggest: "请避免宣扬或描述暴力行为" },
    { label: "弹药", pattern: "弹药", suggest: "请避免宣扬或描述暴力行为" },
    { label: "爆炸物", pattern: "爆炸物", suggest: "请避免宣扬或描述暴力行为" },
    {
      label: "管制刀具",
      pattern: "管制刀具",
      suggest: "请避免宣扬或描述暴力行为",
    },
    { label: "刺杀", pattern: "刺杀", suggest: "请避免宣扬或描述暴力行为" },
    { label: "爆炸", pattern: "爆炸", suggest: "请避免宣扬或描述暴力行为" },
    { label: "投毒", pattern: "投毒", suggest: "请避免宣扬或描述暴力行为" },
    { label: "焚烧", pattern: "焚烧", suggest: "请避免宣扬或描述暴力行为" },
    { label: "砍杀", pattern: "砍杀", suggest: "请避免宣扬或描述暴力行为" },
    { label: "自杀", pattern: "自杀", suggest: "请避免宣扬或描述暴力行为" },
    { label: "自残", pattern: "自残", suggest: "请避免宣扬或描述暴力行为" },
    { label: "黑社会", pattern: "黑社会", suggest: "请避免宣扬或描述暴力行为" },
    {
      label: "恐怖主义",
      pattern: "恐怖主义",
      suggest: "请避免宣扬或描述暴力行为",
    },
    { label: "毒品", pattern: "毒品", suggest: "请避免宣扬或描述违禁品" },
    { label: "摇头丸", pattern: "摇头丸", suggest: "请避免宣扬或描述违禁品" },
    { label: "冰毒", pattern: "冰毒", suggest: "请避免宣扬或描述违禁品" },
    { label: "海洛因", pattern: "海洛因", suggest: "请避免宣扬或描述违禁品" },
    { label: "大麻", pattern: "大麻", suggest: "请避免宣扬或描述违禁品" },
    { label: "K粉", pattern: "K粉", suggest: "请避免宣扬或描述违禁品" },
    { label: "枪杀", pattern: "枪杀", suggest: "请避免宣扬或描述暴力行为" },
    { label: "斩首", pattern: "斩首", suggest: "请避免宣扬或描述暴力行为" },
    { label: "军火", pattern: "军火", suggest: "请避免宣扬或描述暴力行为" },
    { label: "制毒", pattern: "制毒", suggest: "请避免宣扬或描述违禁品" },
    { label: "吸毒", pattern: "吸毒", suggest: "请避免宣扬或描述违禁品" },
  ],
  porn: [
    { label: "色情", pattern: "色情", suggest: "请避免色情低俗内容" },
    { label: "裸聊", pattern: "裸聊", suggest: "请避免色情低俗内容" },
    { label: "一夜情", pattern: "一夜情", suggest: "请避免色情低俗内容" },
    { label: "约炮", pattern: "约炮", suggest: "请避免色情低俗内容" },
    { label: "招嫖", pattern: "招嫖", suggest: "请避免色情低俗内容" },
    { label: "卖淫", pattern: "卖淫", suggest: "请避免色情低俗内容" },
    { label: "嫖娼", pattern: "嫖娼", suggest: "请避免色情低俗内容" },
    { label: "包养", pattern: "包养", suggest: "请避免色情低俗内容" },
    { label: "情色", pattern: "情色", suggest: "请避免色情低俗内容" },
    { label: "黄网", pattern: "黄网", suggest: "请避免色情低俗内容" },
    { label: "黄片", pattern: "黄片", suggest: "请避免色情低俗内容" },
    { label: "黄图", pattern: "黄图", suggest: "请避免色情低俗内容" },
    { label: "做爱", pattern: "做爱", suggest: "请避免色情低俗内容" },
    { label: "性交易", pattern: "性交易", suggest: "请避免色情低俗内容" },
    { label: "SM", pattern: "SM", suggest: "请避免色情低俗内容" },
    { label: "援交", pattern: "援交", suggest: "请避免色情低俗内容" },
    { label: "车震", pattern: "车震", suggest: "请避免色情低俗内容" },
    { label: "口交", pattern: "口交", suggest: "请避免色情低俗内容" },
    { label: "一夜欢", pattern: "一夜欢", suggest: "请避免色情低俗内容" },
    { label: "三级片", pattern: "三级片", suggest: "请避免色情低俗内容" },
  ],
  ad: [
    { label: "广告", pattern: "广告", suggest: "广告引流类内容需谨慎发布" },
    { label: "赌博", pattern: "赌博", suggest: "请避免赌博相关内容" },
    { label: "博彩", pattern: "博彩", suggest: "请避免赌博相关内容" },
    { label: "彩票", pattern: "彩票", suggest: "请避免赌博相关内容" },
    { label: "棋牌", pattern: "棋牌", suggest: "请避免赌博相关内容" },
    { label: "代孕", pattern: "代孕", suggest: "请避免违法违规代孕广告" },
    { label: "刷单", pattern: "刷单", suggest: "请避免刷单等违法兼职" },
    { label: "兼职", pattern: "兼职", suggest: "请谨慎发布兼职引流信息" },
    { label: "高薪", pattern: "高薪", suggest: "请警惕「高薪兼职」类骗局" },
    {
      label: "兼职日结",
      pattern: "兼职日结",
      suggest: "请警惕「兼职日结」类骗局",
    },
    { label: "私聊", pattern: "私聊", suggest: "请警惕引导私下的引流话术" },
    { label: "加微", pattern: "加微", suggest: "请警惕引导加微信的引流话术" },
    { label: "微信", pattern: "微信", suggest: "请警惕脱离平台的引流话术" },
    { label: "QQ", pattern: "QQ", suggest: "请警惕脱离平台的引流话术" },
    { label: "代练", pattern: "代练", suggest: "请避免游戏代练相关违规宣传" },
    { label: "外挂", pattern: "外挂", suggest: "请避免游戏外挂相关违规宣传" },
    { label: "私服", pattern: "私服", suggest: "请避免游戏私服相关违规宣传" },
    { label: "刷钻", pattern: "刷钻", suggest: "请避免刷钻等违规宣传" },
    { label: "刷粉丝", pattern: "刷粉丝", suggest: "请避免刷粉丝等违规宣传" },
    { label: "刷量", pattern: "刷量", suggest: "请避免刷量等违规宣传" },
    { label: "办证", pattern: "办证", suggest: "请避免办证类违规广告" },
    { label: "代考", pattern: "代考", suggest: "请避免代考类违规广告" },
    { label: "移民", pattern: "移民", suggest: "请谨慎移民类广告宣传" },
    { label: "绿卡", pattern: "绿卡", suggest: "请谨慎移民类广告宣传" },
    { label: "小额贷款", pattern: "小额贷款", suggest: "请谨慎贷款类广告宣传" },
    {
      label: "信用卡套现",
      pattern: "信用卡套现",
      suggest: "请避免信用卡套现等违规广告",
    },
    {
      label: "代开发票",
      pattern: "代开发票",
      suggest: "请避免代开发票等违规广告",
    },
  ],
};

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

/** 检测输入参数 */
export interface SensitiveInput {
  text: string;
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
 * 检测主函数：遍历词库 + 规避规则，返回所有命中。
 * 为降低替换复杂度，先收集全部命中区间再做合并与遮罩。
 */
export function detectSensitive(input: SensitiveInput): SensitiveCalcResult {
  const text = input.text ?? "";
  if (text.length > MAX_TEXT_LEN) {
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
    input.categories && input.categories.length > 0
      ? input.categories
      : (Object.keys(CATEGORY_META) as SensitiveCategory[]);

  const hits: SensitiveHit[] = [];
  const categoryStats: Record<SensitiveCategory, number> = {
    politics: 0,
    violence: 0,
    porn: 0,
    ad: 0,
  };

  for (const cat of cats) {
    const words = SENSITIVE_WORDS[cat] ?? [];
    for (const w of words) {
      const positions = findPositions(text, w.pattern);
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
      while ((m = rule.re.exec(text)) !== null) {
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

  const masked = maskText(text, hits);
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
export function getLibraryStats(): Record<SensitiveCategory, number> {
  return {
    politics: SENSITIVE_WORDS.politics.length,
    violence: SENSITIVE_WORDS.violence.length,
    porn: SENSITIVE_WORDS.porn.length,
    ad: SENSITIVE_WORDS.ad.length,
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
