import { describe, expect, it } from "vitest";
import { calculateFloorArea } from "./floor-area-cn";

describe("floor-area-cn", () => {
  it("客厅 30 卧室 15 厨房 8", () => {
    const r = calculateFloorArea({ rooms: "30, 15, 8" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(53);
      expect(r.value.count).toBe(3);
    }
  });
});
