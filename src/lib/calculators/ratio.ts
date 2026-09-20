// 比例计算器 —— 纯函数，无 DOM 依赖
// a : b = c : d（或 x : c）；解出未知项

import { validateNumber, formatResult, type ValidateResult } from "./_shared";

export type RatioMode = "find-d" | "find-c";

export type RatioErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "ZERO_RATIO_TERM";

export type RatioResult =
  | {
      ok: true;
      value: number;
      valueText: string;
      processText: string;
    }
  | { ok: false; error: { code: RatioErrorCode; message: string } };

export function solveRatio(
  mode: RatioMode,
  a: string,
  b: string,
  c: string,
): RatioResult {
  const pa: ValidateResult = validateNumber(a);
  if (!pa.ok) return mapShared(pa);
  const pb: ValidateResult = validateNumber(b);
  if (!pb.ok) return mapShared(pb);
  const pc: ValidateResult = validateNumber(c);
  if (!pc.ok) return mapShared(pc);

  if (pa.value === 0 || pb.value === 0) {
    return {
      ok: false,
      error: {
        code: "ZERO_RATIO_TERM",
        message: "比例项 a、b 不能为 0",
      },
    };
  }

  const aText = a.trim();
  const bText = b.trim();
  const cText = c.trim();

  if (mode === "find-d") {
    // a : b = c : x → x = b × c / a
    const x = (pb.value * pc.value) / pa.value;
    const valueText = formatResult(x);
    const processText = `${bText} × ${cText} ÷ ${aText} = ${valueText}`;
    return { ok: true, value: x, valueText, processText };
  }
  // find-c：a : b = x : c → x = a × c / b
  const x = (pa.value * pc.value) / pb.value;
  const valueText = formatResult(x);
  const processText = `${aText} × ${cText} ÷ ${bText} = ${valueText}`;
  return { ok: true, value: x, valueText, processText };
}

function mapShared(r: Extract<ValidateResult, { ok: false }>): RatioResult {
  return { ok: false, error: { code: r.error.code, message: r.error.message } };
}
