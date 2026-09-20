// 密码生成器引擎（src/lib/calculators/password-generator.ts）
// 纯计算：crypto.getRandomValues 保证密码学安全；字符集可配置
// 注：本引擎不直接调用 crypto（页面脚本传 Uint32Array 进来），保持纯函数特性便于单测

export type PasswordOptions = {
  length: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeDigit: boolean;
  includeSymbol: boolean;
};

export type PasswordResult = { ok: true; value: { password: string } }
  | { ok: false; error: { code: string; message: string } };

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 排除 I/O 避免视觉混淆
const LOWER = "abcdefghijkmnpqrstuvwxyz"; // 排除 l
const DIGIT = "23456789"; // 排除 0/1
const SYMBOL = "!@#$%^&*_+-=?";

const MIN_LEN = 6;
const MAX_LEN = 64;

/**
 * 从预生成的随机 Uint32Array 中按字符集抽样生成密码。
 * 由页面脚本负责 crypto.getRandomValues 调用，引擎本身保持纯函数（便于单测）。
 */
export function generatePassword(
  options: PasswordOptions,
  randoms: Uint32Array,
): PasswordResult {
  const { length, includeUpper, includeLower, includeDigit, includeSymbol } = options;
  if (!Number.isInteger(length) || length < MIN_LEN || length > MAX_LEN) {
    return { ok: false, error: { code: "INVALID_LENGTH", message: `长度需在 ${MIN_LEN}~${MAX_LEN} 之间` } };
  }
  const pool =
    (includeUpper ? UPPER : "") +
    (includeLower ? LOWER : "") +
    (includeDigit ? DIGIT : "") +
    (includeSymbol ? SYMBOL : "");
  if (!pool) {
    return { ok: false, error: { code: "NO_CHARSET", message: "至少选择一种字符类型" } };
  }
  if (randoms.length < length) {
    return { ok: false, error: { code: "INSUFFICIENT_RANDOM", message: "随机源长度不足" } };
  }
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += pool[randoms[i] % pool.length];
  }
  return { ok: true, value: { password: pw } };
}

export const PASSWORD_RULES = { MIN_LEN, MAX_LEN, UPPER, LOWER, DIGIT, SYMBOL };