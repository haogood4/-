import { describe, expect, it } from "vitest";
import { calculateEqualInstallment } from "./equal-installment-cn";

describe("equal-installment-cn", () => {
  it("100万 30年 4.2% 等额本息", () => {
    const r = calculateEqualInstallment({
      principal: "1000000",
      years: "30",
      rate: "4.2",
      type: "equal-installment",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.monthlyFirst).toBeCloseTo(4890.17, 0);
  });
});
