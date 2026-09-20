import { describe, expect, it } from "vitest";
import { calculateCrossBorder } from "./cross-border-profit-cn";
describe("cross-border-profit-cn", () => {
  it("30 USD 售价 5 货本 3 运费 15% 平台", () => {
    const r = calculateCrossBorder({
      sellingPrice: "30",
      productCost: "5",
      shippingCost: "3",
      platformFee: "15",
      exchangeRate: "7.2",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 平台费 = 4.5，总成本 = 12.5 USD → 90 CNY；收入 216 CNY；利润 126 CNY；利润率 ≈ 58%
      expect(r.value.profitCny).toBeCloseTo(126, 0);
    }
  });
});
