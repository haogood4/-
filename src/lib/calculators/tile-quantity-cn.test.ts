import { describe, expect, it } from "vitest";
import { calculateTile } from "./tile-quantity-cn";

describe("tile-quantity-cn", () => {
  it("20m² 800×800 损耗 5%", () => {
    const r = calculateTile({
      area: "20",
      tileLength: "800",
      tileWidth: "800",
      waste: "5",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 20 / 0.64 ≈ 31.25 → ×1.05 ≈ 33
      expect(r.value.count).toBeGreaterThanOrEqual(32);
      expect(r.value.count).toBeLessThanOrEqual(34);
    }
  });
});
