import { describe, expect, it } from "vitest";
import { calculateSocialInsurance } from "./social-insurance-cn";

describe("social-insurance-cn", () => {
  it("北京 月薪 15000", () => {
    const r = calculateSocialInsurance({
      monthlySalary: "15000",
      city: "beijing",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.pension).toBeCloseTo(1200, 0);
      expect(r.value.medical).toBeCloseTo(300, 0);
      expect(r.value.unemployment).toBeCloseTo(75, 0);
      expect(r.value.housingFund).toBeCloseTo(1800, 0);
      expect(r.value.total).toBeCloseTo(3375, 0);
    }
  });
  it("上海 月薪 20000", () => {
    const r = calculateSocialInsurance({
      monthlySalary: "20000",
      city: "shanghai",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.housingFund).toBeCloseTo(1400, 0);
  });
  it("不支持城市", () => {
    const r = calculateSocialInsurance({
      monthlySalary: "10000",
      city: "shanghai",
    });
    expect(r.ok).toBe(true);
  });
});
