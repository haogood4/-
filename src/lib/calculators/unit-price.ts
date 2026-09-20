// 单价比较计算器 —— 纯函数，无 DOM 依赖
// 比较两组（价格/数量）的单位价格，标识更划算方

import { validateNumber, formatResult, type ValidateResult } from "./_shared";

export type UnitPriceErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_QTY"
  | "NON_POSITIVE_PRICE";

export type UnitPriceResult =
  | {
      ok: true;
      unitA: number;
      unitB: number;
      better: "a" | "b" | "equal";
      unitAText: string;
      unitBText: string;
      processText: string;
    }
  | { ok: false; error: { code: UnitPriceErrorCode; message: string } };

export function compareUnitPrice(
  priceA: string,
  qtyA: string,
  priceB: string,
  qtyB: string,
): UnitPriceResult {
  const pa: ValidateResult = validateNumber(priceA, { nonNegative: true });
  if (!pa.ok) return mapShared(pa);
  const qa: ValidateResult = validateNumber(qtyA, { nonNegative: true });
  if (!qa.ok) return mapShared(qa);
  const pb: ValidateResult = validateNumber(priceB, { nonNegative: true });
  if (!pb.ok) return mapShared(pb);
  const qb: ValidateResult = validateNumber(qtyB, { nonNegative: true });
  if (!qb.ok) return mapShared(qb);

  if (pa.value <= 0) {
    return {
      ok: false,
      error: { code: "NON_POSITIVE_PRICE", message: "价格必须大于 0" },
    };
  }
  if (pb.value <= 0) {
    return {
      ok: false,
      error: { code: "NON_POSITIVE_PRICE", message: "价格必须大于 0" },
    };
  }
  if (qa.value <= 0) {
    return {
      ok: false,
      error: { code: "NON_POSITIVE_QTY", message: "数量必须大于 0" },
    };
  }
  if (qb.value <= 0) {
    return {
      ok: false,
      error: { code: "NON_POSITIVE_QTY", message: "数量必须大于 0" },
    };
  }

  const unitA = pa.value / qa.value;
  const unitB = pb.value / qb.value;

  let better: "a" | "b" | "equal";
  if (unitA < unitB) better = "a";
  else if (unitA > unitB) better = "b";
  else better = "equal";

  const unitAText = formatResult(unitA);
  const unitBText = formatResult(unitB);

  const paText = priceA.trim();
  const qaText = qtyA.trim();
  const pbText = priceB.trim();
  const qbText = qtyB.trim();

  const processText = `${paText} ÷ ${qaText} = ${unitAText}；${pbText} ÷ ${qbText} = ${unitBText}`;

  return { ok: true, unitA, unitB, better, unitAText, unitBText, processText };
}

function mapShared(r: Extract<ValidateResult, { ok: false }>): UnitPriceResult {
  return { ok: false, error: { code: r.error.code, message: r.error.message } };
}
