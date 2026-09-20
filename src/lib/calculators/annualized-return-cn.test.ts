import { describe, expect, it } from "vitest";
import {
  calculateAnnualizedReturn,
  formatAnnualizedReturn,
} from "./annualized-return-cn";

describe("annualized-return-cn", () => {
  it("总收益 7% 365天", () => {
    const r = calculateAnnualizedReturn({ totalReturn: "7", days: "365" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(7, 2);
  });
  it("总收益 10% 180天 ≈ 年化 21%", () => {
    const r = calculateAnnualizedReturn({ totalReturn: "10", days: "180" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeGreaterThan(19);
  });
  // 契约测试（P1-6 bug 复现）：formatAnnualizedReturn 返回格式化字符串而非对象，
  // 页面绑定必须直接赋值 f，禁止 (f as any).value 取不存在的属性导致结果恒空
  it("formatAnnualizedReturn 契约：返回 string 且无 value 属性", () => {
    const f = formatAnnualizedReturn(7);
    expect(typeof f).toBe("string");
    expect(f).toBe("7%");
    expect((f as unknown as Record<string, unknown>).value).toBeUndefined();
  });
});
