import { describe, expect, it } from "vitest";
import {
  ASCII_TABLE,
  charToCodes,
  codeToChar,
  MAX_CODE_POINT,
  MAX_QUERY_CHARS,
} from "./ascii-table";

describe("charToCodes — 字符 → 编码", () => {
  it("ASCII 字符 A：65 / 0x41 / 单字节 41", () => {
    const r = charToCodes("A");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.count).toBe(1);
      expect(r.value.items[0]).toEqual({
        char: "A",
        codePoint: 65,
        hex: "0x41",
        utf8Bytes: "41",
        unicode: "U+0041",
      });
    }
  });

  it("中文字符 中：U+4E2D，UTF-8 三字节 E4 B8 AD", () => {
    const r = charToCodes("中");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.items[0].codePoint).toBe(0x4e2d);
      expect(r.value.items[0].hex).toBe("0x4E2D");
      expect(r.value.items[0].utf8Bytes).toBe("E4 B8 AD");
    }
  });

  it("emoji 😀（代理对）合并为一个码点条目，UTF-8 四字节", () => {
    const r = charToCodes("😀");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.count).toBe(1);
      expect(r.value.items[0].char).toBe("😀");
      expect(r.value.items[0].codePoint).toBe(0x1f600);
      expect(r.value.items[0].hex).toBe("0x1F600");
      expect(r.value.items[0].utf8Bytes).toBe("F0 9F 98 80");
    }
  });

  it("混合串 A中😀：按码点拆为 3 项且顺序一致", () => {
    const r = charToCodes("A中😀");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.count).toBe(3);
      expect(r.value.items.map((x) => x.codePoint)).toEqual([
        0x41, 0x4e2d, 0x1f600,
      ]);
    }
  });

  it("空串合法：返回空列表 count=0", () => {
    const r = charToCodes("");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.items).toEqual([]);
      expect(r.value.count).toBe(0);
    }
  });

  it("两字节字符 é：UTF-8 为 C3 A9", () => {
    const r = charToCodes("é");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.items[0].utf8Bytes).toBe("C3 A9");
  });

  it("超过 MAX_QUERY_CHARS 拒绝 INPUT_TOO_LONG", () => {
    const r = charToCodes("a".repeat(MAX_QUERY_CHARS + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INPUT_TOO_LONG");
  });
});

describe("codeToChar — 编码 → 字符", () => {
  it("十进制 65 → A，含全部表示", () => {
    const r = codeToChar("65");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.char).toBe("A");
      expect(r.value.codePoint).toBe(65);
      expect(r.value.hex).toBe("0x41");
      expect(r.value.unicode).toBe("U+0041");
      expect(r.value.utf8Bytes).toBe("41");
    }
  });

  it("0x 前缀十六进制 0x4E2D → 中", () => {
    const r = codeToChar("0x4E2D");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.char).toBe("中");
  });

  it("U+ 前缀小写十六进制 U+4e2d → 中", () => {
    const r = codeToChar("U+4e2d");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.char).toBe("中");
      expect(r.value.unicode).toBe("U+4E2D");
    }
  });

  it("0X 大写前缀 + 混合大小写十六进制 0X1f600 → 😀", () => {
    const r = codeToChar("0X1f600");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.char).toBe("😀");
  });

  it("U+1F600 → emoji 码点，UTF-8 四字节", () => {
    const r = codeToChar("U+1F600");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.codePoint).toBe(0x1f600);
      expect(r.value.utf8Bytes).toBe("F0 9F 98 80");
    }
  });

  it("边界 0：NUL 码点合法", () => {
    const r = codeToChar("0");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.codePoint).toBe(0);
      expect(r.value.hex).toBe("0x00");
      expect(r.value.char).toBe("\u0000");
    }
  });

  it("边界 127（DEL）与 128（超 ASCII 但合法码点）", () => {
    const r127 = codeToChar("127");
    expect(r127.ok).toBe(true);
    if (r127.ok) expect(r127.value.hex).toBe("0x7F");
    const r128 = codeToChar("128");
    expect(r128.ok).toBe(true);
    if (r128.ok) expect(r128.value.codePoint).toBe(128);
  });

  it("边界 0x10FFFF（最大码点）通过，1114112 拒绝 OUT_OF_RANGE", () => {
    const ok = codeToChar("1114111");
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.codePoint).toBe(MAX_CODE_POINT);
    const bad = codeToChar("1114112");
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.code).toBe("OUT_OF_RANGE");
  });

  it("代理区 D800 / DFFF 单字拒绝 SURROGATE_RANGE", () => {
    for (const input of ["0xD800", "U+DFFF", "55296"]) {
      const r = codeToChar(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("SURROGATE_RANGE");
    }
  });

  it("空输入 / 纯空格拒绝 EMPTY_INPUT", () => {
    for (const input of ["", "   "]) {
      const r = codeToChar(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
    }
  });

  it("非法格式（abc、-5、0xZZ、U+）拒绝 INVALID_CODE", () => {
    for (const input of ["abc", "-5", "0xZZ", "U+", "6.5"]) {
      const r = codeToChar(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_CODE");
    }
  });
});

describe("ASCII_TABLE — 静态对照数据", () => {
  it("control 32 项：0-31 加 127（DEL），名称唯一", () => {
    expect(ASCII_TABLE.control).toHaveLength(32);
    expect(ASCII_TABLE.control[0]).toMatchObject({ code: 0, name: "NUL" });
    expect(ASCII_TABLE.control[31]).toMatchObject({ code: 127, name: "DEL" });
    expect(new Set(ASCII_TABLE.control.map((c) => c.name)).size).toBe(32);
    for (const c of ASCII_TABLE.control) {
      expect(c.desc.length).toBeGreaterThan(0);
    }
  });

  it("printable 95 项：32-126，char 与 code 一致", () => {
    expect(ASCII_TABLE.printable).toHaveLength(95);
    expect(ASCII_TABLE.printable[0]).toMatchObject({ code: 32, char: " " });
    expect(ASCII_TABLE.printable[94]).toMatchObject({ code: 126, char: "~" });
    for (const p of ASCII_TABLE.printable) {
      expect(p.char.codePointAt(0)).toBe(p.code);
      expect(p.name.length).toBeGreaterThan(0);
    }
  });
});
