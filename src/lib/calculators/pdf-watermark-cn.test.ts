import { describe, expect, it } from "vitest";
import { watermarkPdf } from "./pdf-watermark-cn";

describe("watermarkPdf / 占位行为", () => {
  it("合法参数 → NOT_IMPLEMENTED", () => {
    const r = watermarkPdf({ text: "机密", opacity: 0.3 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NOT_IMPLEMENTED");
      expect(r.error.message).toContain("体积");
    }
  });

  it("空文字仍返回占位错误（不抛错）", () => {
    const r = watermarkPdf({ text: "", opacity: 0.5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("边界 opacity（0/1）安全返回占位", () => {
    expect(watermarkPdf({ text: "x", opacity: 0 }).ok).toBe(false);
    expect(watermarkPdf({ text: "x", opacity: 1 }).ok).toBe(false);
  });

  it("无成功断言词", () => {
    const r = watermarkPdf({ text: "x", opacity: 0.5 });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message).not.toContain("成功");
  });

  it("错误消息非空且中文", () => {
    const r = watermarkPdf({ text: "x", opacity: 0.5 });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("幂等", () => {
    const a = watermarkPdf({ text: "x", opacity: 0.5 });
    const b = watermarkPdf({ text: "x", opacity: 0.5 });
    expect(a.ok).toBe(b.ok);
    if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
  });
});
