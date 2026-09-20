import { describe, expect, it } from "vitest";
import { calculateFba } from "./amazon-fba-cn";
describe("amazon-fba-cn", () => {
  it("30 USD 售价 5 货本 标准尺寸", () => {
    const r = calculateFba({
      sellingPrice: "30",
      productCost: "5",
      size: "standard",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.fbaFee).toBe(3.06);
      expect(r.value.profit).toBeCloseTo(21.94, 2);
    }
  });
});
