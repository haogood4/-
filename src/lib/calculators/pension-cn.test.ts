import { describe, expect, it } from "vitest";
import { calculatePension } from "./pension-cn";

describe("pension-cn", () => {
  it("30岁 → 60岁 月薪 10000 社平 8000", () => {
    const r = calculatePension({
      currentAge: "30",
      retireAge: "60",
      monthlySalary: "10000",
      cityAvgSalary: "8000",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.monthlyPension).toBeGreaterThan(0);
      expect(r.value.accountTotal).toBeGreaterThan(0);
    }
  });
  it("退休年龄 ≤ 当前 拒绝", () => {
    const r = calculatePension({
      currentAge: "60",
      retireAge: "50",
      monthlySalary: "10000",
      cityAvgSalary: "8000",
    });
    expect(r.ok).toBe(false);
  });
});
