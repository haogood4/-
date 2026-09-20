// 线性因子单位换算通用引擎 —— 纯函数，无 DOM 依赖
// 面积 / 体积 / 速度 / 时间 / 存储容量 五个换算工具共用校验与格式化逻辑，
// 各工具模块只需提供以基准单位为 1 的因子表（与 weight.ts 的校验语义一致）。

export interface FactorUnit {
  code: string;
  label: string; // 中文名称，如「平方米」
  symbol: string; // 展示符号，如「m²」
  factor: number; // 1 该单位 = factor 基准单位
}

export type FactorErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_VALUE"
  | "UNSUPPORTED_UNIT";

export type FactorResult =
  | {
      ok: true;
      converted: number;
      convertedText: string;
      processText: string;
    }
  | { ok: false; error: { code: FactorErrorCode; message: string } };

export interface FactorConverter {
  convert(input: { value: string; from: string; to: string }): FactorResult;
  unit(code: string): FactorUnit | undefined;
}

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_VALUE = 1e15;
const MAX_DECIMALS = 6;

function fail(code: FactorErrorCode, message: string): FactorResult {
  return { ok: false, error: { code, message } };
}

export function formatFactor(value: number): string {
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

export function createFactorConverter(units: FactorUnit[]): FactorConverter {
  const byCode = new Map<string, FactorUnit>();
  for (const u of units) byCode.set(u.code, u);

  const unit = (code: string): FactorUnit | undefined => byCode.get(code);

  const convert = (input: {
    value: string;
    from: string;
    to: string;
  }): FactorResult => {
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
    const fromUnit = byCode.get(from);
    const toUnit = byCode.get(to);
    if (!fromUnit) {
      return fail("UNSUPPORTED_UNIT", "不支持的单位");
    }
    if (!toUnit) {
      return fail("UNSUPPORTED_UNIT", "不支持的单位");
    }

    // 同单位直接返回，避免不必要的浮点乘除
    if (from === to) {
      const convertedText = formatFactor(n);
      return {
        ok: true,
        converted: n,
        convertedText,
        processText: `${trimmed} ${fromUnit.label} = ${convertedText} ${toUnit.label}`,
      };
    }

    const converted = (n * fromUnit.factor) / toUnit.factor;
    const convertedText = formatFactor(converted);
    const fromFactor = formatFactor(fromUnit.factor);
    const toFactor = formatFactor(toUnit.factor);
    const processText = `${trimmed} × ${fromFactor} ÷ ${toFactor} = ${convertedText}（${fromUnit.label} → ${toUnit.label}）`;

    return { ok: true, converted, convertedText, processText };
  };

  return { convert, unit };
}
