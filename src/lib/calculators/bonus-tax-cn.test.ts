import { describe, expect, it } from "vitest";
import { calculateBonus } from "./bonus-tax-cn";

describe("bonus-tax-cn", () => {
  it("36000 年终奖", () => {
    const r = calculateBonus({ bonus: "36000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 36000/12=3000 → 3% 档，税 = 36000*3% = 1080
      expect(r.value.tax).toBeCloseTo(1080, 0);
    }
  });
  it("50000 年终奖", () => {
    const r = calculateBonus({ bonus: "50000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 50000/12=4166.67 → 10% 档，税 = 50000*10% - 210 = 4790
      expect(r.value.tax).toBeCloseTo(4790, 0);
    }
  });
});
