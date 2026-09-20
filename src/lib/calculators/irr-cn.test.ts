import { describe, expect, it } from "vitest";
import { calculateIrr, calculateIrrFromInput, formatIrr } from "./irr-cn";

describe("irr-cn", () => {
  it("标准 IRR 求解", () => {
    const cf = [-10000, 3000, 4000, 5000];
    const r = calculateIrr(cf);
    expect(r).not.toBeNull();
    if (r) expect(r).toBeCloseTo(0.089, 2);
  });
  it("字符串输入", () => {
    const r = calculateIrrFromInput("-10000, 3000, 4000, 5000");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(0.089, 2);
  });
  it("无解", () => {
    const r = calculateIrrFromInput("1000, 1000, 1000");
    expect(r.ok).toBe(false);
  });
  // 契约测试（P1-6 bug 复现）：formatIrr 返回格式化字符串而非对象，
  // 页面绑定必须直接赋值 f，禁止 (f as any).value 取不存在的属性导致结果恒空
  it("formatIrr 契约：返回 string 且无 value 属性", () => {
    const f = formatIrr(0.1);
    expect(typeof f).toBe("string");
    expect(f).toBe("10%");
    expect((f as unknown as Record<string, unknown>).value).toBeUndefined();
  });
});
