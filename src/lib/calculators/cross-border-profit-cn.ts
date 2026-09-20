import { validateNumber, formatResult } from "./_shared";
export type CrossBorderInput = {
  sellingPrice: string;
  productCost: string;
  shippingCost: string;
  platformFee: string;
  exchangeRate: string;
};
export type CrossBorderResult = {
  totalCostCny: number;
  revenueCny: number;
  profitCny: number;
  profitRate: number;
};
export type CrossBorderCalcResult =
  | { ok: true; value: CrossBorderResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateCrossBorder(
  input: CrossBorderInput,
): CrossBorderCalcResult {
  const sp = validateNumber(input.sellingPrice);
  if (!sp.ok) return sp;
  const pc = validateNumber(input.productCost);
  if (!pc.ok) return pc;
  const sh = validateNumber(input.shippingCost);
  if (!sh.ok) return sh;
  const pf = validateNumber(input.platformFee);
  if (!pf.ok) return pf;
  const ex = validateNumber(input.exchangeRate);
  if (!ex.ok) return ex;
  if (
    sp.value <= 0 ||
    pc.value < 0 ||
    sh.value < 0 ||
    pf.value < 0 ||
    pf.value > 50 ||
    ex.value <= 0
  )
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法" },
    };
  const platformFeeUsd = (sp.value * pf.value) / 100;
  const totalCostUsd = pc.value + sh.value + platformFeeUsd;
  const totalCostCny = totalCostUsd * ex.value;
  const revenueCny = sp.value * ex.value;
  const profitCny = revenueCny - totalCostCny;
  const profitRate = profitCny / revenueCny;
  return {
    ok: true,
    value: { totalCostCny, revenueCny, profitCny, profitRate },
  };
}
export function formatCrossBorder(value: CrossBorderResult) {
  return {
    totalCostCny: "¥" + formatResult(value.totalCostCny),
    revenueCny: "¥" + formatResult(value.revenueCny),
    profitCny: "¥" + formatResult(value.profitCny),
    profitRate: formatResult(value.profitRate * 100) + "%",
  };
}
