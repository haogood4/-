import { describe, expect, it } from "vitest";
import { calculateOption } from "./option-pricing-cn";
describe("option-pricing-cn", () => {
  it("ATM 看涨", () => {
    const r = calculateOption({
      spot: "100",
      strike: "100",
      rate: "4",
      vol: "20",
      time: "1",
      type: "call",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.price).toBeGreaterThan(5);
  });
});
