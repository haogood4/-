import { describe, expect, it } from "vitest";
import { calculateDca } from "./fund-dca-cn";

describe("fund-dca-cn", () => {
  it("1000/月 8% 20年", () => {
    const r = calculateDca({ monthly: "1000", rate: "8", years: "20" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.totalInvest).toBe(240000);
      expect(r.value.totalValue).toBeCloseTo(592947, -2);
    }
  });
  it("0 收益率", () => {
    const r = calculateDca({ monthly: "1000", rate: "0", years: "1" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.totalValue).toBe(12000);
  });
  it("月投为 0 拒绝", () => {
    const r = calculateDca({ monthly: "0", rate: "8", years: "10" });
    expect(r.ok).toBe(false);
  });
});
