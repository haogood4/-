import { describe, expect, it } from "vitest";
import { splitPdf } from "./pdf-split-cn";

describe("splitPdf / 占位行为", () => {
  it("合法参数 → NOT_IMPLEMENTED 且提示体积", () => {
    const r = splitPdf({ mode: "every-n", param: 5 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("NOT_IMPLEMENTED");
      expect(r.error.message).toContain("体积");
    }
  });

  it("range 模式同样返回占位错误", () => {
    const r = splitPdf({ mode: "ranges", param: [1, 3, 5] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("不返回成功结果（无 PDF 拆分成功字样）", () => {
    const r = splitPdf({ mode: "every-n", param: 1 });
    expect(r.ok).not.toBe(true);
    if (!r.ok) expect(r.error.message).not.toContain("成功");
  });

  it("非法输入（负数、空数组）不抛错", () => {
    expect(() => splitPdf({ mode: "every-n", param: -1 })).not.toThrow();
    const r = splitPdf({ mode: "ranges", param: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
  });

  it("错误消息非空且含中文", () => {
    const r = splitPdf({ mode: "every-n", param: 10 });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("幂等：相同输入多次调用结果一致", () => {
    const a = splitPdf({ mode: "every-n", param: 2 });
    const b = splitPdf({ mode: "every-n", param: 2 });
    expect(a.ok).toBe(b.ok);
    if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
  });
});
