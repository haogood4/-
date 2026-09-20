import { describe, expect, it } from "vitest";
import { countWords } from "./word-count-cn";
describe("word-count-cn", () => {
  it("Hello world 你好", () => {
    const r = countWords({ text: "Hello world 你好" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBeGreaterThan(0);
      expect(r.value.words).toBeGreaterThan(0);
    }
  });
});
