// 关键字密度分析引擎
//
// 中文分词策略说明（轻量级近似，**非 jieba 等字典分词器精度**）：
//   1. 为避免引入 jieba/nodejieba 等大字典依赖（动辄数百 KB），本实现采用「滑动窗口 + 频次聚合」
//      的近似方案：在文本中按所有 [minLen, maxLen] 长度滑窗提取相邻中文字符的连续子串。
//   2. 同一文本中，"搜索引擎" 这 4 个字会被同时计入 "搜索"、"索引"、"搜索引擎" 三条短语，
//      出现 N 次会生成 O(N * maxLen) 条记录。算法目标是「粗筛高频关键词」而非精确分词。
//   3. 英文按空格分词后小写归一化；数字串独立成词；标点/空白作为分词边界。
//   4. 停用词过滤在短语层面进行；被过滤短语不计入 total，但 unique 仍按过滤前集合计算，
//      以反映原始词频分布的丰富度。
//   5. 实际 SEO 用法：关注 TOP N 中的长词（maxLen=4-6）即可获得与 jieba 接近的命中效果；
//      单字/双字密度仅作辅助参考。

export interface DensityOptions {
  /** 返回 TOP N 项，默认 10 */
  topN?: number;
  /** 最短词长（中文按字符计），默认 2 */
  minLen?: number;
  /** 最长词长（中文按字符计），默认 6 */
  maxLen?: number;
  /** 自定义停用词列表（中文默认 ~30 个常用词） */
  stopwords?: string[];
}

export interface DensityItem {
  word: string;
  count: number;
  /** 百分比，保留 2 位小数（0-100） */
  density: number;
}

export interface DensityResult {
  total: number;
  unique: number;
  totalChars: number;
  items: DensityItem[];
}

/** 默认中文停用词：虚词 + 高频功能词，无业务含义 */
export const DEFAULT_STOPWORDS_CN: readonly string[] = [
  "的",
  "了",
  "在",
  "是",
  "我",
  "有",
  "和",
  "就",
  "不",
  "人",
  "都",
  "一",
  "一个",
  "上",
  "也",
  "很",
  "到",
  "说",
  "要",
  "去",
  "你",
  "会",
  "着",
  "没有",
  "看",
  "好",
  "自己",
  "这",
  "那",
  "吗",
];

/** 中文字符范围（CJK 基本区） */
const HAN_RE = /[\u4e00-\u9fff]/;

/**
 * 主入口：分析文本关键字密度。
 *
 * 行为契约：
 *   - 输入非字符串 → 返回全 0 空结果（防御性）
 *   - 文本为空 / 仅空白 → 返回全 0 空结果
 *   - 中文按滑动窗口提取 minLen~maxLen 字短语；英文按空格切分并小写归一化；数字串独立成词
 *   - density = count / total * 100，保留 2 位小数
 *   - items 按 count 降序排序，count 相同按 word 字典序升序
 *   - unique 按停用词过滤前的不同词数计算，反映原始词频分布
 */
export function analyzeDensity(
  text: string,
  options?: DensityOptions,
): DensityResult {
  if (typeof text !== "string") {
    return { total: 0, unique: 0, totalChars: 0, items: [] };
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return { total: 0, unique: 0, totalChars: 0, items: [] };
  }

  const topN = options?.topN ?? 10;
  const minLen = options?.minLen ?? 2;
  const maxLen = options?.maxLen ?? 6;
  // 停用词集合：用户传入优先（视为覆盖），否则用默认；统一小写化便于英文匹配
  const stopRaw = options?.stopwords ?? [...DEFAULT_STOPWORDS_CN];
  const stopSet = new Set(stopRaw.map((s) => String(s).toLowerCase()));

  // 防御性参数约束
  const safeMin = Math.max(1, Math.floor(minLen));
  const safeMax = Math.max(safeMin, Math.floor(maxLen));
  const safeTop = Math.max(1, Math.floor(topN));

  const totalChars = [...text].length;
  const freq = new Map<string, number>();

  // 逐字扫描：根据当前字符类型分派不同分支
  // 中文：滑动窗口产出所有长度 [safeMin, safeMax] 子串（中文近似分词核心）
  // 英文/数字：作为完整 token 产出，长度须落在 [safeMin, safeMax] 区间内
  let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (HAN_RE.test(ch)) {
      // 中文字符：从当前 i 起尝试所有 [safeMin, safeMax] 长度窗口
      // 仅当窗口内全为中文时产出；任一长度失败则更长也失败，提前终止
      for (let len = safeMin; len <= safeMax; len++) {
        if (i + len > n) break;
        let allHan = true;
        let slice = "";
        for (let k = 0; k < len; k++) {
          const c = text[i + k];
          slice += c;
          if (!HAN_RE.test(c)) {
            allHan = false;
            break;
          }
        }
        if (!allHan) break;
        const key = slice.toLowerCase();
        if (!stopSet.has(key)) {
          freq.set(key, (freq.get(key) ?? 0) + 1);
        }
      }
      i++;
      continue;
    }

    // 英文/数字 token：按连续 ASCII 字母或数字聚合，长度在 [safeMin, safeMax] 内才计入
    if (/[a-zA-Z0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9]/.test(text[j])) j++;
      const token = text.slice(i, j).toLowerCase();
      if (token.length >= safeMin && token.length <= safeMax) {
        if (!stopSet.has(token)) {
          freq.set(token, (freq.get(token) ?? 0) + 1);
        }
      }
      i = j;
      continue;
    }

    // 其它字符（标点/空白/CJK 标点/emoji）：跳过
    i++;
  }

  // 计算总词次（过滤后）
  let total = 0;
  for (const c of freq.values()) total += c;
  const unique = freq.size;

  // 排序：count 降序 → word 字典序升序
  const entries = [...freq.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });

  const items: DensityItem[] = entries
    .slice(0, safeTop)
    .map(([word, count]) => ({
      word,
      count,
      density: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
    }));

  return { total, unique, totalChars, items };
}
