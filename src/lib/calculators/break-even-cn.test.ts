import { describe, expect, it } from "vitest";
import { calculateBreakEven } from "./break-even-cn";
describe("break-even-cn", () => {
  it("固定 50000 单价 100 变动 60", () => {
    const r = calculateBreakEven({
      fixedCost: "50000",
      pricePerUnit: "100",
      variablePerUnit: "60",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.units).toBe(1250);
      expect(r.value.revenue).toBe(125000);
    }
  });
});
