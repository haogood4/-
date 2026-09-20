import { describe, expect, it } from "vitest";
import { convertArea } from "./area";

const cv = (value: string, from: string, to: string) =>
  convertArea({ value, from, to });

describe("convertArea / 典型换算", () => {
  it("1 公顷 → 平方米 = 10000", () => {
    const r = cv("1", "ha", "m2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("10000");
  });

  it("1 平方公里 → 公顷 = 100", () => {
    const r = cv("1", "km2", "ha");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("100");
  });

  it("1 公顷 → 亩 = 15", () => {
    const r = cv("1", "ha", "mu");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("15");
  });

  it("1 亩 → 平方米 ≈ 666.666667", () => {
    const r = cv("1", "mu", "m2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 666.666667");
  });

  it("1 ft² → in² = 144（英制整倍关系）", () => {
    const r = cv("1", "ft2", "in2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("144");
  });

  it("1 m² → ft² ≈ 10.76391", () => {
    const r = cv("1", "m2", "ft2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 10.76391");
  });

  it("同单位 2.5 m² → m² = 2.5", () => {
    const r = cv("2.5", "m2", "m2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(2.5);
  });
});

describe("convertArea / 错误处理", () => {
  it("空值 / 非法 / 负数 / 未知单位均拒绝", () => {
    expect(cv("", "m2", "mu").ok).toBe(false);
    expect(cv("abc", "m2", "mu").ok).toBe(false);
    expect(cv("-1", "m2", "mu").ok).toBe(false);
    expect(cv("1", "m3", "mu").ok).toBe(false);
  });

  it("超 1e15 拒绝", () => {
    const r = cv("10000000000000000", "m2", "cm2");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });
});
