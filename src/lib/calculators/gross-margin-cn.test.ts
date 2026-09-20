import { describe, expect, it } from "vitest";
import { calculateGrossMargin } from "./gross-margin-cn";
describe("gross-margin-cn", () => {
  it("营收 10万 成本 6万", () => {
    const r = calculateGrossMargin({ revenue: "100000", cost: "60000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.gross).toBe(40000);
      expect(r.value.margin).toBeCloseTo(0.4, 6);
    }
  });
});
