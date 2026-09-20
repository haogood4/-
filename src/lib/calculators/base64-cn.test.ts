import { describe, expect, it } from "vitest";
import { convertBase64 } from "./base64-cn";

describe("base64-cn", () => {
  it("编码英文 Hello, World!", () => {
    const r = convertBase64({ input: "Hello, World!", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("解码英文还原", () => {
    const r = convertBase64({
      input: "SGVsbG8sIFdvcmxkIQ==",
      mode: "decode",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("Hello, World!");
  });

  it("编码中文 你好 为 UTF-8 安全结果", () => {
    const r = convertBase64({ input: "你好", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("5L2g5aW9");
  });

  it("解码中文还原", () => {
    const r = convertBase64({ input: "5L2g5aW9", mode: "decode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("你好");
  });

  it("编码 emoji 😀", () => {
    const r = convertBase64({ input: "😀", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("8J+YgA==");
  });

  it("空输入返回 EMPTY", () => {
    const r = convertBase64({ input: "", mode: "encode" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白输入返回 EMPTY", () => {
    const r = convertBase64({ input: "  \n ", mode: "decode" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("非法 Base64 字符返回 INVALID", () => {
    const r = convertBase64({ input: "!!!不是base64!!!", mode: "decode" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID");
      expect(r.error.message).toContain("Base64");
    }
  });

  it("合法 Base64 但非法 UTF-8 字节返回 INVALID", () => {
    // "/w==" 解码为单字节 0xFF，不是合法 UTF-8 起始序列
    const r = convertBase64({ input: "/w==", mode: "decode" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID");
  });

  it("encode→decode 往返一致（中英混合 + emoji + 符号）", () => {
    const src = "计算器 Calculator 😀 #1 2026-09-20\n换行与 空格";
    const enc = convertBase64({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const dec = convertBase64({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });

  it("超长文本（5000 字符）往返一致", () => {
    const src = "中文abc😀".repeat(1000);
    const enc = convertBase64({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const dec = convertBase64({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });

  it("多字节中日韩与重音字符往返一致", () => {
    for (const src of ["日本語テスト", "Ünïcödé", "Привет", "한국어"]) {
      const enc = convertBase64({ input: src, mode: "encode" });
      expect(enc.ok).toBe(true);
      if (enc.ok) {
        const dec = convertBase64({ input: enc.value.output, mode: "decode" });
        expect(dec.ok).toBe(true);
        if (dec.ok) expect(dec.value.output).toBe(src);
      }
    }
  });
});
