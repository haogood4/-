import { describe, expect, it } from "vitest";
import { calculateTurtle } from "./turtle-position-cn";
describe("turtle-position-cn", () => {
  it("100万权益 ATR 2.5 风险 1% 入场 100", () => {
    const r = calculateTurtle({
      accountEquity: "1000000",
      atr: "2.5",
      riskPercent: "1",
      entryPrice: "100",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.totalUnits).toBeGreaterThan(0);
      expect(r.value.stopLoss).toBeCloseTo(95, 0);
    }
  });
});
