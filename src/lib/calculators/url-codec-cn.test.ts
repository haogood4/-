import { describe, expect, it } from "vitest";
import { convertUrl } from "./url-codec-cn";

describe("url-codec-cn", () => {
  it("编码中文为 UTF-8 百分号序列", () => {
    const r = convertUrl({ input: "你好", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("%E4%BD%A0%E5%A5%BD");
  });

  it("解码中文还原", () => {
    const r = convertUrl({
      input: "%E4%BD%A0%E5%A5%BD",
      mode: "decode",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("你好");
  });

  it("编码空格与保留字符", () => {
    const r = convertUrl({ input: "a b&c=d?e#f", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toBe("a%20b%26c%3Dd%3Fe%23f");
    }
  });

  it("含查询串的 URL 往返一致", () => {
    const src = "https://example.com/search?q=计算器&page=1&lang=zh-CN";
    const enc = convertUrl({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      expect(enc.value.output).toContain("%E8%AE%A1%E7%AE%97%E5%99%A8");
      const dec = convertUrl({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });

  it("空输入返回 EMPTY", () => {
    const r = convertUrl({ input: "", mode: "encode" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白输入返回 EMPTY", () => {
    const r = convertUrl({ input: " \t\n", mode: "decode" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("截断的 UTF-8 序列返回 INVALID", () => {
    const r = convertUrl({ input: "%E4%AD", mode: "decode" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID");
      expect(r.error.message).toContain("URL 编码");
    }
  });

  it("孤立 % 与非法十六进制返回 INVALID", () => {
    for (const bad of ["100%", "%zz", "%2"]) {
      const r = convertUrl({ input: bad, mode: "decode" });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID");
    }
  });

  it("未编码的安全字符原样输出", () => {
    const r = convertUrl({ input: "abc-123_~.", mode: "encode" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("abc-123_~.");
  });

  it("emoji 往返一致", () => {
    const src = "😀🎉";
    const enc = convertUrl({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      expect(enc.value.output).toBe("%F0%9F%98%80%F0%9F%8E%89");
      const dec = convertUrl({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });

  it("超长文本（2000 字符）往返一致", () => {
    const src = "参数=值;".repeat(400);
    const enc = convertUrl({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const dec = convertUrl({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });

  it("多行与制表符往返一致", () => {
    const src = "第一行\n\t第二行\r\n";
    const enc = convertUrl({ input: src, mode: "encode" });
    expect(enc.ok).toBe(true);
    if (enc.ok) {
      const dec = convertUrl({ input: enc.value.output, mode: "decode" });
      expect(dec.ok).toBe(true);
      if (dec.ok) expect(dec.value.output).toBe(src);
    }
  });
});
