import { describe, expect, it } from "vitest";
import { calculateDueDate } from "./due-date-cn";
describe("due-date-cn", () => {
  it("末次月经 2025-01-15", () => {
    const r = calculateDueDate({ lastPeriod: "2025-01-15" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.dueDate).toBe("2025-10-22");
  });
});
