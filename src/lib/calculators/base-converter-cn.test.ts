import { describe, expect, it } from "vitest";
import { convertBase } from "./base-converter-cn";
describe("base-converter-cn", () => {
  it("10 → 16 = ff", () => {
    const r = convertBase({ value: "255", fromBase: "10", toBase: "16" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.result).toBe("ff");
  });
});
