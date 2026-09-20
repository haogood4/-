import { describe, expect, it } from "vitest";
import { matchRegex, MAX_MATCHES } from "./regex-tester-cn";

describe("regex-tester-cn", () => {
  it("全局匹配数字：返回全部匹配及 index/长度", () => {
    const r = matchRegex("\\d+", "g", "a1b22c333");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(3);
      expect(r.value.hasG).toBe(true);
      expect(r.value.truncated).toBe(false);
      expect(r.value.matches.map((m) => m.match)).toEqual(["1", "22", "333"]);
      expect(r.value.matches.map((m) => m.index)).toEqual([1, 3, 6]);
      expect(r.value.matches.map((m) => m.length)).toEqual([1, 2, 3]);
    }
  });

  it("空 pattern 返回 INVALID_PATTERN", () => {
    const r = matchRegex("", "g", "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_PATTERN");
      expect(r.error.message).toBe("正则表达式不能为空");
    }
  });

  it("非法标志字符返回 INVALID_FLAGS", () => {
    const r = matchRegex("a", "q", "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FLAGS");
  });

  it("重复标志返回 INVALID_FLAGS", () => {
    const r = matchRegex("a", "gg", "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FLAGS");
  });

  it("空字符串 flags 合法（无标志，仅首个匹配）", () => {
    const r = matchRegex("\\d+", "", "a1b2");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(1);
      expect(r.value.hasG).toBe(false);
      expect(r.value.matches[0].match).toBe("1");
    }
  });

  it("非法正则语法返回 INVALID_PATTERN 且 message 含原始错误", () => {
    const r = matchRegex("[a-", "g", "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_PATTERN");
      // message 应携带原始语法错误信息（V8：Invalid regular expression: ...）
      expect(r.error.message).toContain("Invalid regular expression");
    }
  });

  it("u 标志下非法 Unicode 转义返回 INVALID_PATTERN", () => {
    const r = matchRegex("\\u{110000}", "u", "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_PATTERN");
  });

  it("text 非字符串返回 INVALID_INPUT", () => {
    const r = matchRegex("a", "g", null as unknown as string);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("捕获组：groups 按序返回", () => {
    const r = matchRegex("(\\w+)@(\\w+)", "g", "tom@qq,amy@we");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(2);
      expect(r.value.matches[0].groups).toEqual(["tom", "qq"]);
      expect(r.value.matches[1].groups).toEqual(["amy", "we"]);
    }
  });

  it("未参与的可选捕获组以空字符串表示", () => {
    const r = matchRegex("(a)?b", "", "b");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.matches[0].match).toBe("b");
      expect(r.value.matches[0].groups).toEqual([""]);
    }
  });

  it("零宽匹配不死循环：a* 配 bbb 返回 4 个空匹配", () => {
    const r = matchRegex("a*", "g", "bbb");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(4);
      expect(r.value.matches.every((m) => m.length === 0)).toBe(true);
      expect(r.value.matches.map((m) => m.index)).toEqual([0, 1, 2, 3]);
    }
  });

  it("无 g 标志只返回首个匹配", () => {
    const r = matchRegex("\\d", "g", "123");
    const r2 = matchRegex("\\d", "", "123");
    expect(r.ok && r2.ok).toBe(true);
    if (r.ok && r2.ok) {
      expect(r.value.total).toBe(3);
      expect(r2.value.total).toBe(1);
      expect(r2.value.hasG).toBe(false);
    }
  });

  it("i 标志忽略大小写", () => {
    const r = matchRegex("abc", "gi", "ABC abc Abc");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.total).toBe(3);
  });

  it("m 标志多行 ^ 锚点逐行匹配", () => {
    const r = matchRegex("^\\w", "gm", "aa\nbb\ncc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(3);
      expect(r.value.matches.map((m) => m.index)).toEqual([0, 3, 6]);
    }
  });

  it("超过 500 条匹配被截断并置 truncated", () => {
    const r = matchRegex("a", "g", "a".repeat(MAX_MATCHES + 100));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(MAX_MATCHES);
      expect(r.value.matches.length).toBe(MAX_MATCHES);
      expect(r.value.truncated).toBe(true);
    }
  });

  it("恰好 500 条匹配不截断", () => {
    const r = matchRegex("a", "g", "a".repeat(MAX_MATCHES));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(MAX_MATCHES);
      expect(r.value.truncated).toBe(false);
    }
  });

  it("无匹配返回空数组而非错误", () => {
    const r = matchRegex("\\d+", "g", "abc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.matches).toEqual([]);
      expect(r.value.total).toBe(0);
    }
  });

  it("空测试文本：可匹配空串的模式返回零宽匹配", () => {
    const r = matchRegex("a*", "g", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.total).toBe(1);
      expect(r.value.matches[0].length).toBe(0);
    }
  });
});
