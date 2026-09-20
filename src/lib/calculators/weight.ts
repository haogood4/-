// 重量单位换算计算器 —— 纯函数，无 DOM 依赖
// 8 单位（mg/g/kg/t/lb/oz/斤/两）以 kg 为基准换算，覆盖公制 / 英制 / 市制

export type WeightUnit =
  "mg" | "g" | "kg" | "t" | "lb" | "oz" | "jin" | "liang";

export type WeightErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_VALUE"
  | "UNSUPPORTED_UNIT";

export type WeightResult =
  | {
      ok: true;
      converted: number;
      convertedText: string;
      processText: string;
    }
  | { ok: false; error: { code: WeightErrorCode; message: string } };

// 基准为 1 kg
const FACTORS: Record<WeightUnit, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  t: 1000,
  lb: 0.45359237,
  oz: 0.028349523125,
  jin: 0.5,
  liang: 0.05,
};

const UNIT_LABELS: Record<WeightUnit, string> = {
  mg: "毫克",
  g: "克",
  kg: "千克",
  t: "吨",
  lb: "磅",
  oz: "盎司",
  jin: "斤",
  liang: "两",
};

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_VALUE = 1e15;
const MAX_DECIMALS = 6;

function fail(code: WeightErrorCode, message: string): WeightResult {
  return { ok: false, error: { code, message } };
}

function formatWeight(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const factor = 10 ** MAX_DECIMALS;
  const roundedValue = Math.round(value * factor) / factor;
  let text = roundedValue.toFixed(MAX_DECIMALS);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0") text = "0";
  const rounded = Number(text) !== value;
  return (rounded ? "约 " : "") + text;
}

function isUnit(s: string): s is WeightUnit {
  return Object.prototype.hasOwnProperty.call(FACTORS, s);
}

export function convertWeight(input: {
  value: string;
  from: string;
  to: string;
}): WeightResult {
  const { value, from, to } = input;
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
  if (n > MAX_VALUE) {
    return fail("OUT_OF_RANGE", "数值超出范围（不能超过 1e15）");
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

  const fromLabel = UNIT_LABELS[from];
  const toLabel = UNIT_LABELS[to];

  // 同单位直接返回，避免不必要的浮点乘除
  if (from === to) {
    const convertedText = formatWeight(n);
    return {
      ok: true,
      converted: n,
      convertedText,
      processText: `${trimmed} ${fromLabel} = ${convertedText} ${toLabel}`,
    };
  }

  const converted = (n * FACTORS[from]) / FACTORS[to];
  const convertedText = formatWeight(converted);

  const fromFactor = formatWeight(FACTORS[from]);
  const toFactor = formatWeight(FACTORS[to]);
  const processText = `${trimmed} × ${fromFactor} ÷ ${toFactor} = ${convertedText}（${fromLabel} → ${toLabel}）`;

  return { ok: true, converted, convertedText, processText };
}
