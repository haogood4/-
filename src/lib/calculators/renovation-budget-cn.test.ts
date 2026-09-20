import { describe, expect, it } from "vitest";
import { calculateReno } from "./renovation-budget-cn";

describe("renovation-budget-cn", () => {
  it("90 平 × 2000 元/平", () => {
    const r = calculateReno({ area: "90", perSqm: "2000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(180000);
      expect(r.value.hard).toBe(108000);
      expect(r.value.soft).toBe(72000);
    }
  });
});
