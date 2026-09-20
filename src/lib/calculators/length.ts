// 长度单位换算计算器 —— 纯函数，无 DOM 依赖
// 8 单位（m/cm/mm/km/in/ft/yd/mi）以 m 为基准换算

export type LengthUnit = "m" | "cm" | "mm" | "km" | "in" | "ft" | "yd" | "mi";

export type LengthErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_VALUE"
  | "UNSUPPORTED_UNIT";

export type LengthResult =
  | {
      ok: true;
      converted: number;
      convertedText: string;
      processText: string;
    }
  | { ok: false; error: { code: LengthErrorCode; message: string } };

// 基准为 1 m
const FACTORS: Record<LengthUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const UNIT_LABELS: Record<LengthUnit, string> = {
  m: "米",
  cm: "厘米",
  mm: "毫米",
  km: "千米",
  in: "英寸",
  ft: "英尺",
  yd: "码",
  mi: "英里",
};

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_ABS = 1e12;
const MAX_DECIMALS = 6;

function fail(code: LengthErrorCode, message: string): LengthResult {
  return { ok: false, error: { code, message } };
}

function formatLen(value: number): string {
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

function isUnit(s: string): s is LengthUnit {
  return Object.prototype.hasOwnProperty.call(FACTORS, s);
}

export function convertLength(
  value: string,
  from: string,
  to: string,
): LengthResult {
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
  if (n <= 0) {
    return fail("NON_POSITIVE_VALUE", "数值必须大于 0");
  }
  if (!isUnit(from)) {
    return fail("UNSUPPORTED_UNIT", "不支持的单位");
  }
  if (!isUnit(to)) {
    return fail("UNSUPPORTED_UNIT", "不支持的单位");
  }

  const converted = (n * FACTORS[from]) / FACTORS[to];
  const convertedText = formatLen(converted);

  const fromLabel = UNIT_LABELS[from];
  const toLabel = UNIT_LABELS[to];
  const fromFactor = formatLen(FACTORS[from]);
  const toFactor = formatLen(FACTORS[to]);

  let processText: string;
  if (from === to) {
    processText = `${trimmed} ${fromLabel} = ${convertedText} ${toLabel}`;
  } else {
    processText = `${trimmed} × ${fromFactor} ÷ ${toFactor} = ${convertedText}（${fromLabel} → ${toLabel}）`;
  }

  return { ok: true, converted, convertedText, processText };
}
