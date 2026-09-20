import { describe, expect, it } from "vitest";
import { countWords } from "./word-count-cn";

describe("word-count-cn", () => {
  it("空字符串", () => {
    const r = countWords({ text: "" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(0);
      expect(r.value.han).toBe(0);
    }
  });

  it("中英文混合：Hello world 你好", () => {
    const r = countWords({ text: "Hello world 你好" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(14); // H-e-l-l-o(5) + space(1) + w-o-r-l-d(5) + space(1) + 你-好(2)
      expect(r.value.han).toBe(2);
      expect(r.value.words).toBeGreaterThan(0);
    }
  });

  it("中文标点计数", () => {
    const r = countWords({ text: "你好，世界！" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.punct).toBeGreaterThanOrEqual(2); // ，+ ！
    }
  });

  it("多行文本行数", () => {
    const r = countWords({ text: "line1\nline2\nline3" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.lines).toBe(3);
  });

  it("段落数：双换行分割", () => {
    const r = countWords({ text: "para1\n\npara2" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.paragraphs).toBe(2);
  });
});