import { describe, expect, it } from "vitest";
import { mergePdfs } from "./pdf-merge-cn";

describe("mergePdfs / 占位行为", () => {
  it("合法参数 → 返回 NOT_IMPLEMENTED", () => {
    const r = mergePdfs({ count: 2, outputName: "merged" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NOT_IMPLEMENTED");
      expect(r.error.message).toContain("体积");
    }
  });

  it("不返回误导性成功结果", () => {
    const r = mergePdfs({ count: 5, outputName: "out" });
    expect(r.ok).not.toBe(true);
  });

  it("错误消息禁止声称「PDF 合并成功」", () => {
    const r = mergePdfs({ count: 2, outputName: "x" });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message).not.toContain("成功");
  });

  it("忽略非法输入仍安全返回占位错误（不抛错）", () => {
    const r = mergePdfs({ count: -1, outputName: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("始终包含中文错误消息（非空）", () => {
    const r = mergePdfs({ count: 0, outputName: "a" });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("多次调用结果稳定且幂等", () => {
    const a = mergePdfs({ count: 3, outputName: "x" });
    const b = mergePdfs({ count: 3, outputName: "x" });
    expect(a.ok).toBe(b.ok);
    if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
  });
});
