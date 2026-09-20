import { formatResult } from "./_shared";
export type ScientificInput = { expression: string };
export type ScientificResult = { value: number; ok: boolean };
export type ScientificCalcResult =
  | { ok: true; value: ScientificResult }
  | { ok: false; error: { code: string; message: string } };
const SAFE =
  /^(\s*(?:\d+(?:\.\d+)?|sin|cos|tan|asin|acos|atan|log|ln|exp|sqrt|abs|pi|e|\(|\)|\+|-|\*|\/|\^|\s)*\s*)$/i;
export function calculateScientific(
  input: ScientificInput,
): ScientificCalcResult {
  const e = input.expression.trim();
  if (!e)
    return { ok: false, error: { code: "EMPTY", message: "请输入表达式" } };
  if (!SAFE.test(e))
    return {
      ok: false,
      error: {
        code: "INVALID_FORMAT",
        message: "仅支持数字与 sin/cos/tan/log/ln/exp/sqrt/abs/pi/e/() 运算符",
      },
    };
  // 简单表达式求值（不支持 ^，可后续扩展）
  try {
    const fn = new Function(
      "pi",
      "e",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "log",
      "ln",
      "exp",
      "sqrt",
      "abs",
      "return (" + e + ");",
    );
    const v = fn(
      Math.PI,
      Math.E,
      Math.sin,
      Math.cos,
      Math.tan,
      Math.asin,
      Math.acos,
      Math.atan,
      Math.log,
      Math.log,
      Math.exp,
      Math.sqrt,
      Math.abs,
    );
    if (typeof v !== "number" || !Number.isFinite(v))
      return {
        ok: false,
        error: { code: "OUT_OF_RANGE", message: "无法求解" },
      };
    return { ok: true, value: { value: v, ok: true } };
  } catch (e) {
    return {
      ok: false,
      error: { code: "INVALID_FORMAT", message: "表达式格式错误" },
    };
  }
}
export function formatScientific(value: ScientificResult) {
  return { value: formatResult(value.value) };
}
