import { describe, expect, it } from "vitest";
import { calculateOvulation } from "./ovulation-cn";
describe("ovulation-cn", () => {
  it("末次月经 2025-01-15 周期 28 天", () => {
    const r = calculateOvulation({ lastPeriod: "2025-01-15", cycle: "28" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.ovulationDate).toBe("2025-01-29");
  });
});
