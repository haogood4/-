import { describe, expect, it } from "vitest";
import { transformText } from "./text-transform";

describe("text-transform", () => {
  it("upper：英文转大写，中文不变", () => {
    const r = transformText({ text: "Hello World 你好" }, "upper");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("HELLO WORLD 你好");
  });

  it("lower：英文转小写", () => {
    const r = transformText({ text: "Hello WORLD" }, "lower");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("hello world");
  });

  it("nospace：去除所有空白（含换行）", () => {
    const r = transformText({ text: "  a b\tc\nd  " }, "nospace");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("abcd");
  });

  it("noline：去除所有换行，折叠为单行", () => {
    const r = transformText({ text: "line1\nline2\n\nline3" }, "noline");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("line1 line2 line3");
  });

  it("trim：去除首尾空白（含全角空格\u3000）", () => {
    const r = transformText({ text: "\u3000  hello  \u3000" }, "trim");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("hello");
  });

  it("空字符串：所有模式正常返回", () => {
    for (const m of ["upper", "lower", "nospace", "noline", "trim"] as const) {
      const r = transformText({ text: "" }, m);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.output).toBe("");
        expect(r.value.chars).toBe(0);
      }
    }
  });

  it("非法输入类型（非字符串）拒绝", () => {
    const r = transformText({ text: null as unknown as string }, "upper");
    expect(r.ok).toBe(false);
  });

  it("未知模式拒绝", () => {
    const r = transformText({ text: "x" }, "unknown" as unknown as "upper");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_MODE");
  });

  it("chars 统计使用 Unicode 字符数（中文友好）", () => {
    const r = transformText({ text: "你好世界" }, "upper");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.chars).toBe(4);
  });
});