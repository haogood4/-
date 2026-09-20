import { describe, expect, it } from "vitest";
import { calculateAutoLoan } from "./auto-loan-cn";

describe("auto-loan-cn", () => {
  it("10万 3年 5%", () => {
    const r = calculateAutoLoan({ principal: "100000", years: "3", rate: "5" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.monthly).toBeCloseTo(2997, 0);
  });
});
