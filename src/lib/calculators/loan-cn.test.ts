import { describe, expect, it } from "vitest";
import { calculateLoan } from "./loan-cn";

describe("loan-cn", () => {
  it("10万 3年 6%", () => {
    const r = calculateLoan({ principal: "100000", years: "3", rate: "6" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.monthly).toBeCloseTo(3042, 0);
  });
  it("0 利率", () => {
    const r = calculateLoan({ principal: "12000", years: "1", rate: "0" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.monthly).toBeCloseTo(1000, 0);
      expect(r.value.totalInterest).toBeCloseTo(0, 6);
    }
  });
  it("负利率拒绝", () => {
    const r = calculateLoan({ principal: "100000", years: "3", rate: "-1" });
    expect(r.ok).toBe(false);
  });
});
