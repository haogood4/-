// 温度换算计算器 —— 纯函数，无 DOM 依赖
// 摄氏 / 华氏 / 开尔文 三单位互转；中间值 K 不得低于绝对零度（0 K）

export type TempUnit = "C" | "F" | "K";

export type TempErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "UNSUPPORTED_UNIT"
  | "BELOW_ABSOLUTE_ZERO";

export type TempResult =
  | {
      ok: true;
      kelvin: number;
      converted: number;
      convertedText: string;
      processText: string;
    }
  | { ok: false; error: { code: TempErrorCode; message: string } };

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_ABS = 1e12;
const MAX_DECIMALS = 6;

function fail(code: TempErrorCode, message: string): TempResult {
  return { ok: false, error: { code, message } };
}

function isUnit(s: string): s is TempUnit {
  return s === "C" || s === "F" || s === "K";
}

// 任意单位 → 开尔文（K）
function toKelvin(value: number, unit: TempUnit): number {
  if (unit === "C") return value + 273.15;
  if (unit === "F") return ((value - 32) * 5) / 9 + 273.15;
  return value;
}

// 开尔文 → 任意单位
function fromKelvin(k: number, unit: TempUnit): number {
  if (unit === "C") return k - 273.15;
  if (unit === "F") return ((k - 273.15) * 9) / 5 + 32;
  return k;
}

function formatTemp(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const factor = 10 ** MAX_DECIMALS;
  const sign = value < 0 ? -1 : 1;
  const roundedValue = (Math.round(Math.abs(value) * factor) / factor) * sign;
  let text = roundedValue.toFixed(MAX_DECIMALS);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0") text = "0";
  const rounded = Number(text) !== value;
  return (rounded ? "约 " : "") + text;
}

export function convertTemperature(
  value: string,
  from: string,
  to: string,
): TempResult {
  const trimmed = value.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请输入数值");
  }
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效的数字");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效的数字");
  }
  const dotIndex = trimmed.indexOf(".");
  const decimals = dotIndex === -1 ? 0 : trimmed.length - dotIndex - 1;
  if (decimals > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", `小数位数不能超过 ${MAX_DECIMALS} 位`);
  }
  if (Math.abs(n) > MAX_ABS) {
    return fail("OUT_OF_RANGE", "数值超出范围（绝对值不能超过 1e12）");
  }
  if (!isUnit(from)) {
    return fail("UNSUPPORTED_UNIT", "不支持的单位");
  }
  if (!isUnit(to)) {
    return fail("UNSUPPORTED_UNIT", "不支持的单位");
  }

  const k = toKelvin(n, from);
  if (k < 0) {
    return {
      ok: false,
      error: {
        code: "BELOW_ABSOLUTE_ZERO",
        message: "温度低于绝对零度（0 K），请检查输入",
      },
    };
  }
  const converted = fromKelvin(k, to);
  const convertedText = formatTemp(converted);

  const processText = `${trimmed}${from} = ${convertedText}${to}`;

  return { ok: true, kelvin: k, converted, convertedText, processText };
}
