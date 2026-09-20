import { describe, expect, it } from "vitest";
import { calculateFutures } from "./futures-margin-cn";
describe("futures-margin-cn", () => {
  it("4000 × 1 手 × 10 × 12%", () => {
    const r = calculateFutures({
      price: "4000",
      lots: "1",
      multiplier: "10",
      marginRate: "12",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.margin).toBe(4800);
      expect(r.value.value).toBe(40000);
    }
  });
});
