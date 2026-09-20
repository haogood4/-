import { describe, expect, it } from "vitest";
import { calculateRoas } from "./roas-cn";
describe("roas-cn", () => {
  it("广告 1000 销售 5000 毛利率 30%", () => {
    const r = calculateRoas({
      adCost: "1000",
      revenue: "5000",
      profitRate: "30",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.roas).toBeCloseTo(5, 6);
      expect(r.value.roi).toBeCloseTo(1.5, 6);
    }
  });
});
