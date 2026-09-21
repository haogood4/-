import { describe, expect, it } from "vitest";
import {
  chunksToText,
  countCodePoints,
  formatClock,
  mergeSegments,
} from "./ai-stt-cn";

describe("chunksToText", () => {
  it("纯中文片段直接拼接", () => {
    expect(chunksToText(["你好", "世界"])).toBe("你好世界");
  });

  it("中文标点边界同样不补空格", () => {
    expect(chunksToText(["你好，", "世界！"])).toBe("你好，世界！");
  });

  it("纯英文片段补一个空格", () => {
    expect(chunksToText(["hello", "world"])).toBe("hello world");
  });

  it("中英混排边界补空格", () => {
    expect(chunksToText(["你好", "world"])).toBe("你好 world");
    expect(chunksToText(["hello", "世界"])).toBe("hello 世界");
  });

  it("过滤空白片段并 trim", () => {
    expect(chunksToText(["", "  ", "hi"])).toBe("hi");
    expect(chunksToText([" 你好 ", "世界 "])).toBe("你好世界");
  });

  it("空数组与全空片段返回空串", () => {
    expect(chunksToText([])).toBe("");
    expect(chunksToText(["", "   "])).toBe("");
  });
});

describe("mergeSegments", () => {
  it("合并文本并计算时间跨度", () => {
    const r = mergeSegments([
      { text: "今天", t: 2 },
      { text: "天气", t: 5 },
      { text: "不错", t: 30 },
    ]);
    expect(r.text).toBe("今天天气不错");
    expect(r.span).toBe(28);
  });

  it("单片段与空输入兜底", () => {
    expect(mergeSegments([{ text: "你好", t: 7 }])).toEqual({
      text: "你好",
      span: 0,
    });
    expect(mergeSegments([])).toEqual({ text: "", span: 0 });
  });
});

describe("formatClock", () => {
  it("格式化为 mm:ss 并补零", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(600)).toBe("10:00");
  });

  it("超过一小时显示总分钟数，负数按 0 处理", () => {
    expect(formatClock(3600)).toBe("60:00");
    expect(formatClock(-5)).toBe("00:00");
  });
});

describe("countCodePoints", () => {
  it("emoji 等代理对按 1 个字符计", () => {
    expect(countCodePoints("")).toBe(0);
    expect(countCodePoints("hello")).toBe(5);
    expect(countCodePoints("你好")).toBe(2);
    expect(countCodePoints("👍a")).toBe(2);
  });
});
