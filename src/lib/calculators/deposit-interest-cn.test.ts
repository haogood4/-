import { describe, expect, it } from "vitest";
import { calculateDeposit } from "./deposit-interest-cn";

describe("deposit-interest-cn", () => {
  it("10万 3年 3% 单利", () => {
    const r = calculateDeposit({
      principal: "100000",
      rate: "3",
      years: "3",
      type: "simple",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.interest).toBeCloseTo(9000, 6);
      expect(r.value.total).toBeCloseTo(109000, 6);
    }
  });
  it("10万 3年 3% 复利", () => {
    const r = calculateDeposit({
      principal: "100000",
      rate: "3",
      years: "3",
      type: "compound",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.total).toBeCloseTo(109272.7, 0);
  });
});
