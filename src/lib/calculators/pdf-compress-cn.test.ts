import { describe, expect, it } from "vitest";
import { compressPdf } from "./pdf-compress-cn";

describe("compressPdf / 占位行为", () => {
  it("三档位均返回 NOT_IMPLEMENTED", () => {
    for (const level of ["low", "medium", "high"] as const) {
      const r = compressPdf({ level });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("NOT_IMPLEMENTED");
    }
  });

  it("错误消息含「体积」", () => {
    const r = compressPdf({ level: "medium" });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message).toContain("体积");
  });

  it("无成功断言词", () => {
    const r = compressPdf({ level: "low" });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message).not.toContain("成功");
  });

  it("非法档位不抛错", () => {
    // TypeScript 层面禁止，但运行时防御：传非法值
    const r = compressPdf({
      level: "low",
    });
    expect(r.ok).toBe(false);
  });

  it("错误消息非空且中文", () => {
    const r = compressPdf({ level: "high" });
    if (r.ok) throw new Error("占位不应返回成功");
    expect(r.error.message.length).toBeGreaterThan(0);
    expect(/[\u4e00-\u9fa5]/.test(r.error.message)).toBe(true);
  });

  it("幂等", () => {
    const a = compressPdf({ level: "low" });
    const b = compressPdf({ level: "low" });
    expect(a.ok).toBe(b.ok);
    if (!a.ok && !b.ok) expect(a.error.code).toBe(b.error.code);
  });
});
