import { describe, expect, it } from "vitest";
import { calculateMortgage } from "./mortgage-cn";

describe("mortgage-cn / 等额本息", () => {
  it("100万 30年 4.2%", () => {
    const r = calculateMortgage({
      principal: "1000000",
      years: "30",
      rate: "4.2",
      type: "equal-installment",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.monthlyFirst).toBeCloseTo(4890.17, 0);
  });
  it("100万 20年 4.5%", () => {
    const r = calculateMortgage({
      principal: "1000000",
      years: "20",
      rate: "4.5",
      type: "equal-installment",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.monthlyFirst).toBeCloseTo(6326, 0);
  });
  it("本金为 0 拒绝", () => {
    const r = calculateMortgage({
      principal: "0",
      years: "10",
      rate: "4.5",
      type: "equal-installment",
    });
    expect(r.ok).toBe(false);
  });
});

describe("mortgage-cn / 等额本金", () => {
  it("100万 30年 4.2% 首月", () => {
    const r = calculateMortgage({
      principal: "1000000",
      years: "30",
      rate: "4.2",
      type: "equal-principal",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.monthlyFirst).toBeCloseTo(6277.78, 0);
      // monthlyDecrease = (P/n) * mr = (1000000/360) * (0.042/12) ≈ 9.72
      expect(r.value.monthlyDecrease).toBeCloseTo(9.72, 1);
    }
  });
});

describe("mortgage-cn / 边界", () => {
  it("年限超过 30 拒绝", () => {
    const r = calculateMortgage({
      principal: "1000000",
      years: "40",
      rate: "4.2",
      type: "equal-installment",
    });
    expect(r.ok).toBe(false);
  });
  it("利率 0 等额本息退化为本金均摊", () => {
    const r = calculateMortgage({
      principal: "120000",
      years: "1",
      rate: "0",
      type: "equal-installment",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.monthlyFirst).toBeCloseTo(10000, 0);
      expect(r.value.totalInterest).toBeCloseTo(0, 6);
    }
  });
});
