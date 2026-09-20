import { describe, expect, it } from "vitest";
import { createFactorConverter, formatFactor } from "./factor-convert";

const cv = createFactorConverter([
  { code: "a", label: "甲", symbol: "a", factor: 1 },
  { code: "b", label: "乙", symbol: "b", factor: 10 },
  { code: "c", label: "丙", symbol: "c", factor: 0.5 },
]);
const run = (value: string, from: string, to: string) =>
  cv.convert({ value, from, to });

describe("factor-convert / 典型换算", () => {
  it("1 a → b = 0.1", () => {
    const r = run("1", "a", "b");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("0.1");
  });

  it("1 b → c = 20", () => {
    const r = run("1", "b", "c");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("20");
  });

  it("processText 含因子代入过程", () => {
    const r = run("2", "a", "b");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.processText).toContain("2 × 1 ÷ 10 = 0.2");
  });
});

describe("factor-convert / 同单位", () => {
  it("5 a → a 直接返回", () => {
    const r = run("5", "a", "a");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(5);
      expect(r.processText).toBe("5 甲 = 5 甲");
    }
  });
});

describe("factor-convert / 小数精度", () => {
  it("1/3 因子四舍六入：约 0.333333", () => {
    const c = createFactorConverter([
      { code: "x", label: "X", symbol: "x", factor: 1 },
      { code: "y", label: "Y", symbol: "y", factor: 3 },
    ]);
    const r = c.convert({ value: "1", from: "x", to: "y" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.333333");
  });

  it("formatFactor 去除尾零且不产生 -0", () => {
    expect(formatFactor(1.5)).toBe("1.5");
    expect(formatFactor(-0)).toBe("0");
    expect(formatFactor(2)).toBe("2");
  });
});

describe("factor-convert / 错误处理", () => {
  it("空值拒绝", () => {
    const r = run("  ", "a", "b");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("非法字符拒绝", () => {
    const r = run("1kg", "a", "b");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_NUMBER");
  });

  it("0 与负数拒绝", () => {
    expect(run("0", "a", "b").ok).toBe(false);
    expect(run("-1", "a", "b").ok).toBe(false);
  });

  it("小数超 6 位拒绝", () => {
    const r = run("1.1234567", "a", "b");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_MANY_DECIMALS");
  });

  it("边界值 1e15 允许、超出拒绝", () => {
    expect(run("1000000000000000", "a", "b").ok).toBe(true);
    const r = run("10000000000000000", "a", "b");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("未知来源 / 目标单位拒绝", () => {
    expect(run("1", "xyz", "a").ok).toBe(false);
    expect(run("1", "a", "xyz").ok).toBe(false);
  });
});
