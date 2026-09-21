import { describe, expect, it } from "vitest";
import { pdfToImages } from "./pdf-to-image-cn";

describe("pdfToImages / 占位行为", () => {
  it("PNG + 96 DPI → NOT_IMPLEMENTED", () => {
    const r = pdfToImages({ format: "png", dpi: 96 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("JPEG + 144 DPI → NOT_IMPLEMENTED", () => {
    const r = pdfToImages({ format: "jpeg", dpi: 144 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.message).toContain("体积");
      expect(r.error.message).not.toContain("成功");
    }
  });

  it("边界 DPI（72/300）均返回占位错误", () => {
    expect(pdfToImages({ format: "png", dpi: 72 }).ok).toBe(false);
    expect(pdfToImages({ format: "jpeg", dpi: 300 }).ok).toBe(false);
  });

  it("错误消息中文非空", () => {
    const r = pdfToImages({ format: "png", dpi: 96 });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("幂等", () => {
    const a = pdfToImages({ format: "png", dpi: 96 });
    const b = pdfToImages({ format: "png", dpi: 96 });
    if (!a.ok || !b.ok) {
      expect(a.ok).toBe(b.ok);
      if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
    }
  });

  it("非法 DPI 不抛错", () => {
    expect(() => pdfToImages({ format: "png", dpi: -1 })).not.toThrow();
    const r = pdfToImages({ format: "png", dpi: -1 });
    expect(r.ok).toBe(false);
  });
});
