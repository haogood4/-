import { describe, expect, it } from "vitest";
import { calculateFuel } from "./fuel-consumption-cn";

describe("fuel-consumption-cn", () => {
  it("500km 30L → 6 L/100km", () => {
    const r = calculateFuel({ distance: "500", fuel: "30" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.perHundred).toBeCloseTo(6, 6);
  });
});
