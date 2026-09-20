// 繁体简体转换引擎（简 ↔ 繁双向，单字级 + 标点）
// 字库来源：OpenCC（github.com/BYVoid/OpenCC，Apache-2.0）TSCharacters / STCharacters，
// 仅保留常用字（CJK 基本区，按简/繁语料词频前 5000 过滤）的一对一映射，共 2538 对
// （简→繁 1248 对 + 繁→简 1290 对）。双向一致的映射对合并为一条记录（1418 条），以
// 两条平行数组存储（同下标即一对「简体字 ↔ 繁体字」），构建时按「先出现者优先」分别
// 构建双向 Map，并用 skip 排除简繁同形字误转。
// 字库数据已外置至 public/data/chinese-convert.json（ConvData 格式），不内联进 JS
// bundle；由页面脚本首次使用时 fetch 加载后调用 buildMaps 构建映射。
// 已知局限（页面 FAQ 同步说明）：
// 1) 简→繁存在一对多（如「发」→「發/髮」、「干」→「幹/乾」、「后」→「後/后」），
//    本引擎按「常用义优先」做单字映射，不做词组级消歧，结果仅供参考；
// 2) 繁→简基本一对一，准确率较高；
// 3) 简繁同形字（如「面」「中」「算」）不转换；英文、数字、其他符号原样透传。
// 标点：简体弯引号 “”‘’ ↔ 繁体直角引号 「」『』 互转（表小，保留在引擎内）。

export type ConvertDirection = "s2t" | "t2s";

export interface ChineseConvertInput {
  text: string;
}

export interface ChineseConvertValue {
  /** 转换结果 */
  output: string;
  /** 结果 Unicode 码点数 */
  chars: number;
  /** 实际发生转换的字符数 */
  converted: number;
}

export type ChineseConvertResult =
  | { ok: true; value: ChineseConvertValue }
  | { ok: false; error: { code: string; message: string } };

/** 外置字库数据（public/data/chinese-convert.json）：pairSimp[i] ↔ pairTrad[i] 为一对「简体字 ↔ 繁体字」，skip 为简繁同形字（不参与简→繁转换） */
export type ConvData = {
  pairSimp: string[];
  pairTrad: string[];
  skip: string[];
};

/** 由 ConvData 构建的双向单字映射 */
export type ConvMaps = {
  s2t: Map<string, string>;
  t2s: Map<string, string>;
};

/** 从外置字库构建双向 Map：first-wins（同键保留首个映射），s2t 侧排除 skip 同形字 */
export function buildMaps(data: ConvData): ConvMaps {
  const s2t = new Map<string, string>();
  const t2s = new Map<string, string>();
  const skip = new Set(data.skip);
  for (let i = 0; i < data.pairSimp.length; i++) {
    const s = data.pairSimp[i];
    const t = data.pairTrad[i];
    if (!s2t.has(s) && !skip.has(s)) s2t.set(s, t);
    if (!t2s.has(t)) t2s.set(t, s);
  }
  return { s2t, t2s };
}

/** 简体弯引号 → 繁体直角引号 */
const PUNCT_S2T: ReadonlyMap<string, string> = new Map([
  ["\u201c", "\u300c"],
  ["\u201d", "\u300d"],
  ["\u2018", "\u300e"],
  ["\u2019", "\u300f"],
]);
/** 繁体直角引号 → 简体弯引号 */
const PUNCT_T2S: ReadonlyMap<string, string> = new Map([
  ["\u300c", "\u201c"],
  ["\u300d", "\u201d"],
  ["\u300e", "\u2018"],
  ["\u300f", "\u2019"],
]);

/** 简↔繁转换：绝不 throw，异常输入以判别联合返回；maps 由调用方 buildMaps 预先构建 */
export function convertChinese(
  input: ChineseConvertInput,
  direction: ConvertDirection,
  maps: ConvMaps,
): ChineseConvertResult {
  if (!input || typeof input !== "object" || typeof input.text !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "输入必须是字符串" },
    };
  }
  if (direction !== "s2t" && direction !== "t2s") {
    return {
      ok: false,
      error: { code: "UNKNOWN_DIRECTION", message: "未知转换方向" },
    };
  }
  if (!maps || !(maps.s2t instanceof Map) || !(maps.t2s instanceof Map)) {
    return {
      ok: false,
      error: { code: "MISSING_DICT", message: "转换数据未加载" },
    };
  }
  const dict = direction === "s2t" ? maps.s2t : maps.t2s;
  const punct = direction === "s2t" ? PUNCT_S2T : PUNCT_T2S;
  let output = "";
  let converted = 0;
  for (const ch of input.text) {
    const mapped = dict.get(ch) ?? punct.get(ch);
    if (mapped === undefined) {
      output += ch;
    } else {
      output += mapped;
      converted += 1;
    }
  }
  return { ok: true, value: { output, chars: [...output].length, converted } };
}
