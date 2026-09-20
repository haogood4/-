import { describe, expect, it } from "vitest";
import { calculateCalorie } from "./calorie-burn-cn";
describe("calorie-burn-cn", () => {
  it("70kg 30min MET 9.8", () => {
    const r = calculateCalorie({ weight: "70", minutes: "30", met: "9.8" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.kcal).toBeGreaterThan(200);
  });
});
