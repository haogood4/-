// 汉字转拼音引擎（纯函数，无 DOM / 无 fetch）
// 架构约定：字典数据（public/data/pinyin-dict.json，约 2 万条目）不进 JS bundle，
// 由页面脚本按需 fetch 并以参数注入；本引擎只负责逐字查表与分段。

/** 拼音字典：单个汉字 → 带声调读音数组（首读音为主读音，其余为多音） */
export type PinyinDict = Record<string, string[]>;

/** 逐字分段结果：汉字段带拼音，非汉字段原样保留 */
export interface PinyinSegment {
  /** 是否命中字典的汉字 */
  han: boolean;
  /** 拼音；showAllPolyphones 时多读音以 "/" 连接；非汉字为空串 */
  pinyin: string;
  /** 原始字符（按 Unicode 码点切分） */
  src: string;
}

export interface PinyinConvertInput {
  text: string;
  dict: PinyinDict;
  showAllPolyphones: boolean;
}

export type PinyinConvertResult =
  | {
      ok: true;
      value: { segments: PinyinSegment[]; hasNonHan: boolean };
    }
  | {
      ok: false;
      error: { code: "EMPTY" | "INVALID_INPUT"; message: string };
    };

const HAS_OWN = Object.prototype.hasOwnProperty;

export function convertPinyin(input: PinyinConvertInput): PinyinConvertResult {
  const { text, dict, showAllPolyphones } = input;
  if (typeof text !== "string") {
    return {
      ok: false,
      error: { code: "INVALID_INPUT", message: "输入必须是字符串" },
    };
  }
  if (text.trim() === "") {
    return {
      ok: false,
      error: { code: "EMPTY", message: "请输入要转换的文本" },
    };
  }

  const segments: PinyinSegment[] = [];
  let hasNonHan = false;
  // for...of 按码点迭代，代理对（如 emoji）不会拆坏
  for (const ch of text) {
    const readings = HAS_OWN.call(dict, ch) ? dict[ch] : undefined;
    if (readings && readings.length > 0) {
      segments.push({
        han: true,
        pinyin: showAllPolyphones ? readings.join("/") : readings[0],
        src: ch,
      });
    } else {
      hasNonHan = true;
      segments.push({ han: false, pinyin: "", src: ch });
    }
  }
  return { ok: true, value: { segments, hasNonHan } };
}
