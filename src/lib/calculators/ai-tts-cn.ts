// src/lib/calculators/ai-tts-cn.ts — 文字转语音（TTS）配置构建纯函数
// 页面脚本负责实际调用 speechSynthesis 播放（浏览器 API 无法在 Node 单测），
// 本模块只做配置校验与时长预估，保证核心逻辑可被单测覆盖。

export const TTS_TEXT_LIMIT = 3000;
export const RATE_MIN = 0.1;
export const RATE_MAX = 10;
export const PITCH_MIN = 0;
export const PITCH_MAX = 2;
/** 语速 1x 下中文朗读约每秒 4 字（经验值，仅用于预估展示） */
const CHARS_PER_SECOND = 4;

export interface VoiceConfig {
  text: string;
  rate: number;
  pitch: number;
  lang: string;
}

export interface TtsPlan {
  config: VoiceConfig;
  /** 去首尾空白后的码点数（1 个 emoji 计 1） */
  charCount: number;
  /** 预计朗读秒数（向上取整） */
  estSeconds: number;
}

export type TtsResult =
  { ok: true; plan: TtsPlan } | { ok: false; error: string };

// BCP-47 简化校验：语言 2~3 位小写字母，可选若干「-」子标签
const LANG_RE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

function estimateSeconds(charCount: number, rate: number): number {
  return Math.max(1, Math.ceil(charCount / (CHARS_PER_SECOND * rate)));
}

/**
 * 构建并校验语音合成配置。
 * 校验项：文本非空且 ≤3000 码点；语速 0.1~10；音调 0~2；语言代码格式合法。
 */
export function buildVoiceConfig(
  text: string,
  options: { rate?: number; pitch?: number; lang?: string } = {},
): TtsResult {
  const trimmed = text.trim();
  if (trimmed === "") {
    return { ok: false, error: "请输入要朗读的文本" };
  }
  const charCount = [...trimmed].length;
  if (charCount > TTS_TEXT_LIMIT) {
    return {
      ok: false,
      error: `文本过长（约 ${charCount} 字），上限 ${TTS_TEXT_LIMIT} 字，请分段朗读`,
    };
  }
  const rate = options.rate ?? 1;
  if (!Number.isFinite(rate) || rate < RATE_MIN || rate > RATE_MAX) {
    return { ok: false, error: `语速需在 ${RATE_MIN}~${RATE_MAX} 之间` };
  }
  const pitch = options.pitch ?? 1;
  if (!Number.isFinite(pitch) || pitch < PITCH_MIN || pitch > PITCH_MAX) {
    return { ok: false, error: `音调需在 ${PITCH_MIN}~${PITCH_MAX} 之间` };
  }
  const lang = options.lang ?? "zh-CN";
  if (!LANG_RE.test(lang)) {
    return { ok: false, error: "语言代码格式不正确（示例：zh-CN、en-US）" };
  }
  return {
    ok: true,
    plan: {
      config: { text: trimmed, rate, pitch, lang },
      charCount,
      estSeconds: estimateSeconds(charCount, rate),
    },
  };
}
