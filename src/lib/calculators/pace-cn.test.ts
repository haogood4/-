import { describe, expect, it } from "vitest";
import { calculatePace } from "./pace-cn";
describe("pace-cn", () => {
  it("5 公里 30 分钟", () => {
    const r = calculatePace({
      distance: "5",
      hours: "0",
      minutes: "30",
      seconds: "0",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.pacePerKm).toBe("6'00\"");
  });
});
