import { validateNumber, formatResult } from "./_shared";
export type CryptoInput = {
  equity: string;
  leverage: string;
  entryPrice: string;
  side: "long" | "short";
};
export type CryptoResult = {
  positionValue: number;
  margin: number;
  liquidationPrice: number;
};
export type CryptoCalcResult =
  | { ok: true; value: CryptoResult }
  | { ok: false; error: { code: string; message: string } };
export function calculateCryptoPosition(input: CryptoInput): CryptoCalcResult {
  const e = validateNumber(input.equity);
  if (!e.ok) return e;
  const l = validateNumber(input.leverage);
  if (!l.ok) return l;
  const p = validateNumber(input.entryPrice);
  if (!p.ok) return p;
  if (e.value <= 0 || l.value <= 0 || l.value > 125 || p.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "数值须合法（杠杆 ≤ 125）" },
    };
  const positionValue = e.value * l.value;
  const margin = e.value;
  // 简化爆仓价：做多 = 入场 × (1 - 1/杠杆)；做空 = 入场 × (1 + 1/杠杆)
  const liq =
    input.side === "long"
      ? p.value * (1 - 1 / l.value)
      : p.value * (1 + 1 / l.value);
  return { ok: true, value: { positionValue, margin, liquidationPrice: liq } };
}
export function formatCryptoPosition(value: CryptoResult) {
  return {
    positionValue: formatResult(value.positionValue) + " USDT",
    margin: formatResult(value.margin) + " USDT",
    liquidationPrice: formatResult(value.liquidationPrice) + " USDT",
  };
}
