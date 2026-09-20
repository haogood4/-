// 百分比计算器 —— 纯函数，无 DOM 依赖
// 输入保留原始字符串，便于逐条校验（空值 / 格式 / 精度 / 范围）

export type PercentageMode = "percent-of" | "what-percent" | "change";

export type PercentageErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "DIVIDE_BY_ZERO"
  | "INVALID_BASE"
  | "UNSUPPORTED_MODE";

export type PercentageResult =
  | { ok: true; value: number }
  | { ok: false; error: { code: PercentageErrorCode; message: string } };

const MAX_ABS = 1e12;
const MAX_DECIMALS = 6;

// 允许前导正负号与小数点：如 "15"、"-3.5"、".5"；拒绝 "1e5"、"NaN"、"Infinity"
const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;

function fail(code: PercentageErrorCode, message: string): PercentageResult {
  return { ok: false, error: { code, message } };
}

export function validateInput(raw: string): PercentageResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请输入数值");
  }
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效的数字");
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return fail("INVALID_NUMBER", "请输入有效的数字");
  }
  const dotIndex = trimmed.indexOf(".");
  const decimals = dotIndex === -1 ? 0 : trimmed.length - dotIndex - 1;
  if (decimals > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", `小数位数不能超过 ${MAX_DECIMALS} 位`);
  }
  if (Math.abs(value) > MAX_ABS) {
    return fail("OUT_OF_RANGE", "数值超出范围（绝对值不能超过 1e12）");
  }
  return { ok: true, value };
}

export function calculatePercentage(
  mode: PercentageMode,
  a: string,
  b: string,
): PercentageResult {
  const parsedA = validateInput(a);
  if (!parsedA.ok) return parsedA;
  const parsedB = validateInput(b);
  if (!parsedB.ok) return parsedB;
  const x = parsedA.value;
  const y = parsedB.value;

  switch (mode) {
    case "percent-of":
      // a 的 b% = a × b / 100
      return { ok: true, value: (x * y) / 100 };
    case "what-percent":
      // a 占 b 的百分比 = a / b × 100
      if (y === 0) {
        return fail("DIVIDE_BY_ZERO", "总数不能为 0");
      }
      return { ok: true, value: (x / y) * 100 };
    case "change":
      // 变化率 = (b − a) / a × 100
      if (x <= 0) {
        return fail("INVALID_BASE", "此模式要求原值大于 0");
      }
      return { ok: true, value: ((y - x) / x) * 100 };
    default:
      return fail("UNSUPPORTED_MODE", "不支持的计算模式");
  }
}

// 展示层格式化：最多 6 位小数、去尾零；发生舍入时前缀「约」（round-half-up）
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  const factor = 10 ** MAX_DECIMALS;
  const sign = value < 0 ? -1 : 1;
  const roundedValue = (Math.round(Math.abs(value) * factor) / factor) * sign;
  let text = roundedValue.toFixed(MAX_DECIMALS);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0") {
    text = "0";
  }
  const rounded = Number(text) !== value;
  return (rounded ? "约 " : "") + text;
}
