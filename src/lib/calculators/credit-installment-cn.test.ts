import { describe, expect, it } from "vitest";
import { calculateCredit } from "./credit-installment-cn";

describe("credit-installment-cn", () => {
  it("10000 分 12期 月费率 0.6%", () => {
    const r = calculateCredit({
      principal: "10000",
      monthlyRate: "0.6",
      months: "12",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.monthlyPayment).toBeCloseTo(893.33, 1);
      expect(r.value.totalFee).toBeCloseTo(720, 0);
    }
  });
});
