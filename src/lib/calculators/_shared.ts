// 内部共享校验工具 —— 仅供 src/lib/calculators/* 复用，不对外导出
// 复用 percentage.ts 的 NUMBER_RE / MAX_ABS / MAX_DECIMALS 风格

export const MAX_ABS = 1e12;
export const MAX_DECIMALS = 6;
export const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;

export type SharedErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "TOO_MANY_DECIMALS" | "OUT_OF_RANGE";

export type ValidateResult =
  | { ok: true; value: number }
  | { ok: false; error: { code: SharedErrorCode; message: string } };

export function validateNumber(
  raw: string,
  options: { nonNegative?: boolean } = {},
): ValidateResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: false, error: { code: "EMPTY", message: "请输入数值" } };
  }
  if (!NUMBER_RE.test(trimmed)) {
    return {
      ok: false,
      error: { code: "INVALID_NUMBER", message: "请输入有效的数字" },
    };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return {
      ok: false,
      error: { code: "INVALID_NUMBER", message: "请输入有效的数字" },
    };
  }
  if (options.nonNegative && value < 0) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值不能为负数" },
    };
  }
  const dotIndex = trimmed.indexOf(".");
  const decimals = dotIndex === -1 ? 0 : trimmed.length - dotIndex - 1;
  if (decimals > MAX_DECIMALS) {
    return {
      ok: false,
      error: {
        code: "TOO_MANY_DECIMALS",
        message: `小数位数不能超过 ${MAX_DECIMALS} 位`,
      },
    };
  }
  if (Math.abs(value) > MAX_ABS) {
    return {
      ok: false,
      error: {
        code: "OUT_OF_RANGE",
        message: "数值超出范围（绝对值不能超过 1e12）",
      },
    };
  }
  return { ok: true, value };
}

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
