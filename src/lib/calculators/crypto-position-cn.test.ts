import { describe, expect, it } from "vitest";
import { calculateCryptoPosition } from "./crypto-position-cn";
describe("crypto-position-cn", () => {
  it("10000 USDT 10x 30000 做多", () => {
    const r = calculateCryptoPosition({
      equity: "10000",
      leverage: "10",
      entryPrice: "30000",
      side: "long",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.liquidationPrice).toBeCloseTo(27000, 0);
  });
});
