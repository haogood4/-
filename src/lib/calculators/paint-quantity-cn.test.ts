import { describe, expect, it } from "vitest";
import { calculatePaint } from "./paint-quantity-cn";

describe("paint-quantity-cn", () => {
  it("60m² 2 遍 12m²/L", () => {
    const r = calculatePaint({
      wallArea: "60",
      coats: "2",
      coveragePerLiter: "12",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.liters).toBeCloseTo(10, 0);
      expect(r.value.cans).toBe(2);
    }
  });
});
