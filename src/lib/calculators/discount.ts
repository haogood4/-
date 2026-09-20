// 折扣计算器 —— 纯函数，无 DOM 依赖
// paid = price × (1 - discountPercent/100)；saved = price - paid

import { validateNumber, formatResult, type ValidateResult } from "./_shared";

export type DiscountErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NON_POSITIVE_PRICE"
  | "DISCOUNT_OUT_OF_RANGE";

export type DiscountResult =
  | {
      ok: true;
      paid: number;
      saved: number;
      paidText: string;
      savedText: string;
      processText: string;
    }
  | { ok: false; error: { code: DiscountErrorCode; message: string } };

export function calculateDiscount(
  price: string,
  discountPercent: string,
): DiscountResult {
  const parsedPrice: ValidateResult = validateNumber(price);
  if (!parsedPrice.ok) {
    return mapShared(parsedPrice);
  }
  const parsedPct: ValidateResult = validateNumber(discountPercent);
  if (!parsedPct.ok) {
    return mapShared(parsedPct);
  }

  const p = parsedPrice.value;
  const pct = parsedPct.value;

  if (p <= 0) {
    return {
      ok: false,
      error: {
        code: "NON_POSITIVE_PRICE",
        message: "原价必须大于 0",
      },
    };
  }
  if (pct < 0 || pct > 100) {
    return {
      ok: false,
      error: {
        code: "DISCOUNT_OUT_OF_RANGE",
        message: "折扣百分比需在 0 到 100 之间",
      },
    };
  }

  const factor = 1 - pct / 100;
  const paid = p * factor;
  const saved = p - paid;

  const paidText = formatResult(paid);
  const savedText = formatResult(saved);
  const pText = price.trim();
  const pctText = discountPercent.trim();

  let processText: string;
  if (pct === 0) {
    processText = `${pText} × (1 − 0 ÷ 100) = ${paidText}`;
  } else if (pct === 100) {
    processText = `${pText} × (1 − 100 ÷ 100) = ${paidText}`;
  } else {
    processText = `${pText} × (1 − ${pctText} ÷ 100) = ${paidText}`;
  }

  return { ok: true, paid, saved, paidText, savedText, processText };
}

function mapShared(r: Extract<ValidateResult, { ok: false }>): DiscountResult {
  return { ok: false, error: { code: r.error.code, message: r.error.message } };
}
