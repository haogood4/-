// UUID 生成器引擎（src/lib/calculators/uuid.ts）
// RFC 4122 v4：16 字节随机数 → 置 version 位（byte6 高 4 位 = 0100）与
// variant 位（byte8 高 2 位 = 10）→ 8-4-4-4-12 十六进制 → 按 format 变换。
// 纯计算：随机源由页面脚本注入（crypto.getRandomValues.bind(crypto)），保持纯函数便于单测。
// 约定：任何非法输入均返回 { ok: false }，绝不 throw。

export type UuidFormat = "dash" | "no-dash" | "upper" | "no-dash-upper";

export type UuidOptions = {
  count: number;
  format: UuidFormat;
  /** 随机源注入：填充 16 字节缓冲区（如 crypto.getRandomValues.bind(crypto)） */
  random: (buf: Uint8Array) => void;
};

export type UuidResult =
  | { ok: true; value: { uuids: string[]; count: number } }
  | { ok: false; error: { code: string; message: string } };

export const MIN_COUNT = 1;
export const MAX_COUNT = 1000;

const FORMATS: readonly UuidFormat[] = [
  "dash",
  "no-dash",
  "upper",
  "no-dash-upper",
];

/** 0-255 → 两位小写十六进制查表 */
const HEX: string[] = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0"),
);

/**
 * 将标准 8-4-4-4-12 小写带连字符 UUID 变换为目标格式。
 * - dash：原样（标准带连字符小写）
 * - no-dash：移除连字符
 * - upper：保留连字符并转大写
 * - no-dash-upper：移除连字符并转大写
 */
export function formatUuid(standard: string, format: UuidFormat): string {
  const noDash = standard.replace(/-/g, "");
  switch (format) {
    case "no-dash":
      return noDash;
    case "upper":
      return standard.toUpperCase();
    case "no-dash-upper":
      return noDash.toUpperCase();
    case "dash":
    default:
      return standard;
  }
}

/** 用注入的随机源生成一个标准格式（小写带连字符）v4 UUID */
function buildStandardUuid(random: (buf: Uint8Array) => void): string {
  const bytes = new Uint8Array(16);
  random(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version = 0100 (v4)
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant = 10 (RFC 4122)
  let hex = "";
  for (let i = 0; i < 16; i++) hex += HEX[bytes[i]];
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * 批量生成 UUID v4。
 * count 必须为 MIN_COUNT~MAX_COUNT 的整数；随机源抛异常时返回 RANDOM_FAILED（不透传异常）。
 */
export function generateUuids(options: UuidOptions): UuidResult {
  const { count, format, random } = options;
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    return {
      ok: false,
      error: {
        code: "INVALID_COUNT",
        message: `数量需为 ${MIN_COUNT}~${MAX_COUNT} 之间的整数`,
      },
    };
  }
  if (!FORMATS.includes(format)) {
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "不支持的 UUID 格式" },
    };
  }
  if (typeof random !== "function") {
    return {
      ok: false,
      error: { code: "INVALID_RANDOM", message: "随机源不可用" },
    };
  }
  const uuids: string[] = [];
  try {
    for (let i = 0; i < count; i++) {
      uuids.push(formatUuid(buildStandardUuid(random), format));
    }
  } catch {
    return {
      ok: false,
      error: { code: "RANDOM_FAILED", message: "随机源调用失败，请重试" },
    };
  }
  return { ok: true, value: { uuids, count: uuids.length } };
}
