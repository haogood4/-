import { describe, expect, it } from "vitest";
import { calculateScientific } from "./scientific-cn";
describe("scientific-cn", () => {
  it("sin(0)", () => {
    const r = calculateScientific({ expression: "sin(0)" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBeCloseTo(0, 6);
  });
  it("sqrt(16)", () => {
    const r = calculateScientific({ expression: "sqrt(16)" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toBe(4);
  });
});
