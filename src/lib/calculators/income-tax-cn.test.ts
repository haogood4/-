import { describe, expect, it } from "vitest";
import { calculateIncomeTax } from "./income-tax-cn";

describe("income-tax-cn", () => {
  it("月薪 20000 社保 2000 专项 1000", () => {
    const r = calculateIncomeTax({
      monthlySalary: "20000",
      socialInsurance: "2000",
      specialDeduction: "1000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.taxable).toBe(12000);
      expect(r.value.tax).toBeCloseTo(990, 0); // 12000 * 0.1 - 210 = 990
    }
  });
  it("月薪 5000 免征", () => {
    const r = calculateIncomeTax({
      monthlySalary: "5000",
      socialInsurance: "0",
      specialDeduction: "0",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.tax).toBe(0);
  });
  it("月薪 30000 累进到 20% 档", () => {
    const r = calculateIncomeTax({
      monthlySalary: "30000",
      socialInsurance: "4500",
      specialDeduction: "1000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.taxable).toBe(19500);
      // 19500 * 0.2 - 1410 = 2490
      expect(r.value.tax).toBeCloseTo(2490, 0);
    }
  });
});
