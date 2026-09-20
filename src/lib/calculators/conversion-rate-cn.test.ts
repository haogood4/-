import { describe, expect, it } from "vitest";
import { calculateCvr } from "./conversion-rate-cn";
describe("conversion-rate-cn", () => {
  it("10000 访客 200 转化", () => {
    const r = calculateCvr({ visits: "10000", conversions: "200" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.cvr).toBeCloseTo(0.02, 6);
  });
});
