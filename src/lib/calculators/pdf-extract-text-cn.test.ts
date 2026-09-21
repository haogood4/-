import { describe, expect, it } from "vitest";
import { extractPdfText } from "./pdf-extract-text-cn";

describe("extractPdfText / 占位行为", () => {
  it("perPage=true → NOT_IMPLEMENTED", () => {
    const r = extractPdfText({ perPage: true });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NOT_IMPLEMENTED");
      expect(r.error.message).toContain("体积");
    }
  });

  it("perPage=false → NOT_IMPLEMENTED", () => {
    const r = extractPdfText({ perPage: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("错误消息不含成功字样", () => {
    const r = extractPdfText({ perPage: true });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message).not.toContain("成功");
  });

  it("错误消息非空且中文", () => {
    const r = extractPdfText({ perPage: false });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("幂等", () => {
    const a = extractPdfText({ perPage: true });
    const b = extractPdfText({ perPage: true });
    expect(a.ok).toBe(b.ok);
    if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
  });

  it("不抛错（即便非法参数）", () => {
    expect(() => extractPdfText({ perPage: true })).not.toThrow();
  });
});
