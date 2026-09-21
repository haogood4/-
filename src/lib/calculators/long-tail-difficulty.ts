// src/lib/calculators/long-tail-difficulty.ts — 长尾词排名难度估算（纯函数）
//
// 设计原则（避免 YMYL 风险）：
// 1. 难度分仅基于用户可观察的「词本身结构特征」，不假装接入第三方搜索量或外链数据；
// 2. 输出评分区间 [0, 100] 与五档定性（极易/较易/中等/较难/极难）+ 置信度提示；
// 3. 同步输出"词长、修饰层数、疑问词命中、商业意图命中"等可解释维度，便于用户判断；
// 4. 暴露 score() 纯函数 + scoreWithBreakdown() 调试版，便于单测与未来对接真实数据替换。

export interface DifficultyInput {
  /** 候选长尾词（必填，单条文本） */
  word: string;
  /** 核心词（可选，提供则用于：修饰层数=基于核心词的差量） */
  core?: string;
}

export type DifficultyBand =
  | "极难" // 80–100
  | "较难" // 60–79
  | "中等" // 40–59
  | "较易" // 20–39
  | "极易"; // 0–19

export interface DifficultyBreakdown {
  /** 综合难度分 0–100（越大越难） */
  score: number;
  /** 定性分档 */
  band: DifficultyBand;
  /** 字符数（中文按 1 字符，英文按 1 词加权） */
  charCount: number;
  /** 相对核心词的修饰层数（核心词省略不计；未提供核心词则 = 总字符数下限 1） */
  modifierDepth: number;
  /** 是否命中疑问词（怎么/如何/哪个/多少/为什么/什么/什么/哪儿/是否/能不能/区别/优缺点 等） */
  hasQuestion: boolean;
  /** 是否命中商业意图词（推荐/排行/对比/价格/多少钱/怎么选/哪个好/哪里买/最/便宜/划算 等） */
  hasCommercial: boolean;
  /** 是否命中高竞争品类暗示词（官方/下载/正版/官网/教程/平台 等） */
  hasHighCompetition: boolean;
  /** 各维度分项（解释器便于校验） */
  parts: {
    /** 词长惩罚（0–25） */
    length: number;
    /** 修饰层数惩罚（0–25） */
    depth: number;
    /** 疑问词奖励（0 越易） */
    question: number;
    /** 商业意图惩罚（0–20） */
    commercial: number;
    /** 高竞争品类惩罚（0–20） */
    highCompetition: number;
  };
  /** 置信度提示：低（无核心词或词过短）/ 中 / 高 */
  confidence: "低" | "中" | "高";
  /** 给用户的一句"为什么这么判" */
  hint: string;
}

const QUESTION_WORDS = [
  "怎么",
  "如何",
  "哪个",
  "哪一",
  "哪种",
  "多少",
  "几个",
  "为什么",
  "为何",
  "啥",
  "是什么",
  "啥是",
  "哪里",
  "哪儿",
  "哪个好",
  "是否",
  "能不能",
  "可以吗",
  "区别",
  "差异",
  "不同",
  "优缺点",
  "靠谱吗",
];

const COMMERCIAL_WORDS = [
  "推荐",
  "排行榜",
  "排名",
  "对比",
  "评测",
  "测评",
  "价格",
  "多少钱",
  "怎么选",
  "哪个好",
  "哪里买",
  "购买",
  "下载",
  "便宜",
  "划算",
  "优惠",
  "折扣",
  "代理",
  "加盟",
  "最",
  "top",
  "十大",
];

const HIGH_COMPETITION_WORDS = [
  "官方",
  "正版",
  "官网",
  "下载",
  "教程",
  "平台",
  "系统",
  "课程",
  "培训",
  "证书",
  "入口",
  "申请",
  "办理",
  "流程",
];

function containsAny(haystack: string, needles: string[]): boolean {
  for (const n of needles) {
    if (haystack.includes(n)) return true;
  }
  return false;
}

function countOccurrences(haystack: string, needle: string): number {
  if (needle === "") return 0;
  let count = 0;
  let pos = 0;
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    count += 1;
    pos += needle.length;
  }
  return count;
}

/** 估算词长（中文字符按 1，英文/数字按 1，连续空白压缩） */
function lengthScore(word: string): { chars: number; score: number } {
  const compact = word.replace(/\s+/g, " ").trim();
  // 中文按字符数；英文/数字按词数加权（粗估：每 4 个字母 = 1 字符）
  const cnCount = (compact.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const enCount = (compact.match(/[A-Za-z0-9]+/g) ?? []).join("").length;
  const chars = cnCount + Math.ceil(enCount / 4);
  // 词长越短越泛，越长越具体越易；<=3 字符给满 25，每多 1 字符 -3，下限 0
  let score: number;
  if (chars <= 3) score = 25;
  else if (chars >= 10) score = 0;
  else score = 25 - (chars - 3) * 3;
  return { chars, score: Math.max(0, Math.min(25, Math.round(score))) };
}

/** 估算修饰层数（去掉核心词后剩下的修饰词近似计数） */
function depthScore(word: string, core?: string): { depth: number; score: number } {
  if (!core || core.trim() === "") {
    // 无核心词时，按字符数粗估修饰深度：<=3 字符视为极短难以分层
    const len = word.replace(/\s+/g, "").length;
    if (len <= 3) return { depth: 0, score: 20 };
    if (len >= 12) return { depth: 3, score: 0 };
    return { depth: 1, score: 10 };
  }
  const coreClean = core.trim();
  const wordClean = word.replace(coreClean, "").replace(/\s+/g, "");
  const depth = Math.min(3, Math.floor(wordClean.length / 2)); // 简化近似：每 2 字一层，最多 3 层
  let score: number;
  if (depth <= 0) score = 25;
  else if (depth === 1) score = 15;
  else if (depth === 2) score = 5;
  else score = 0;
  return { depth, score };
}

function bandOf(score: number): DifficultyBand {
  if (score >= 80) return "极难";
  if (score >= 60) return "较难";
  if (score >= 40) return "中等";
  if (score >= 20) return "较易";
  return "极易";
}

function buildHint(
  score: number,
  band: DifficultyBand,
  parts: DifficultyBreakdown["parts"],
  breakdown: Omit<DifficultyBreakdown, "hint">,
): string {
  const reasons: string[] = [];
  if (breakdown.charCount <= 3)
    reasons.push(`词仅 ${breakdown.charCount} 字，过于宽泛`);
  if (breakdown.modifierDepth <= 0)
    reasons.push("未提供核心词，修饰层数无法精确评估");
  if (breakdown.hasCommercial) reasons.push("命中商业意图词，竞品投放多");
  if (breakdown.hasHighCompetition) reasons.push("含高竞争品类暗示词");
  if (breakdown.hasQuestion) reasons.push("疑问词通常搜索意图明确、结果页少");
  if (parts.length >= 18) reasons.push("词短，长尾优势弱");
  if (reasons.length === 0) {
    if (band === "极易") return "词够长、修饰够深，建议优先建专题页抢占";
    if (band === "较易") return "结构良好，可作为新站首选切入词";
    if (band === "中等") return "竞争适中，需配合站内权重与外链支撑";
    if (band === "较难") return "已被成熟站点占据，建议搭配更深的长尾变体";
    return "竞争激烈，短期不建议独立页攻坚";
  }
  return `${reasons.join("；")}。综合分 ${score}/100（${band}）`;
}

/**
 * 估算长尾词排名难度（核心 API）。
 * @throws 输入为空时抛错
 */
export function scoreLongTailDifficulty(
  input: DifficultyInput | string,
): DifficultyBreakdown {
  const normalized: DifficultyInput =
    typeof input === "string" ? { word: input } : input;
  const word = normalized.word.trim();
  if (word === "") {
    throw new Error("长尾词不能为空");
  }

  const len = lengthScore(word);
  const depth = depthScore(word, normalized.core);
  const hasQuestion = containsAny(word, QUESTION_WORDS);
  const hasCommercial = containsAny(word, COMMERCIAL_WORDS);
  const hasHighCompetition = containsAny(word, HIGH_COMPETITION_WORDS);

  // 疑问词奖励：长尾难度下降（命中给 -10）
  const questionPart = hasQuestion ? -10 : 0;

  const commercialPart = hasCommercial ? 20 : 0;
  const highCompPart = hasHighCompetition ? 20 : 0;

  const total =
    len.score + depth.score + commercialPart + highCompPart + questionPart;
  const score = Math.max(0, Math.min(100, total));
  const band = bandOf(score);

  // 置信度：核心词为空 或 词过短 → 低；中等长度 + 命中关键词 → 高
  let confidence: DifficultyBreakdown["confidence"];
  if (!normalized.core || normalized.core.trim() === "" || len.chars <= 2) {
    confidence = "低";
  } else if (hasQuestion || hasCommercial || hasHighCompetition) {
    confidence = "高";
  } else {
    confidence = "中";
  }

  const breakdown: Omit<DifficultyBreakdown, "hint"> = {
    score,
    band,
    charCount: len.chars,
    modifierDepth: depth.depth,
    hasQuestion,
    hasCommercial,
    hasHighCompetition,
    parts: {
      length: len.score,
      depth: depth.score,
      question: questionPart,
      commercial: commercialPart,
      highCompetition: highCompPart,
    },
    confidence,
  };
  return { ...breakdown, hint: buildHint(score, band, breakdown.parts, breakdown) };
}

/** 批量评估：输入字符串数组，返回按输入顺序的评分数组 */
export function scoreLongTailBatch(
  words: string[],
  core?: string,
): DifficultyBreakdown[] {
  const out: DifficultyBreakdown[] = [];
  for (const w of words) {
    try {
      out.push(scoreLongTailDifficulty({ word: w, core }));
    } catch {
      // 跳过空值而非抛出，避免单条污染整批
      continue;
    }
  }
  return out;
}

/** 复用：累计相同词中核心词出现次数（调试辅助，未来可用于"重复核心词惩罚"扩展） */
export function _debugCountCoreOccurrences(word: string, core: string): number {
  return countOccurrences(word, core);
}
