import { validateNumber, formatResult } from "./_shared";
export type FbaInput = {
  sellingPrice: string;
  productCost: string;
  size: "standard" | "large";
};
export type FbaResult = { fbaFee: number; profit: number; margin: number };
export type FbaCalcResult =
  | { ok: true; value: FbaResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateFba(input: FbaInput): FbaCalcResult {
  const sp = validateNumber(input.sellingPrice);
  if (!sp.ok) return sp;
  const pc = validateNumber(input.productCost);
  if (!pc.ok) return pc;
  if (sp.value <= 0 || pc.value < 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法" },
    };
  // 简化 FBA 费率：标准 $3.06，大件 $5.77
  const fbaFee = input.size === "standard" ? 3.06 : 5.77;
  const profit = sp.value - pc.value - fbaFee;
  const margin = profit / sp.value;
  return { ok: true, value: { fbaFee, profit, margin } };
}
export function formatFba(value: FbaResult) {
  return {
    fbaFee: "$" + formatResult(value.fbaFee),
    profit: "$" + formatResult(value.profit),
    margin: formatResult(value.margin * 100) + "%",
  };
}
