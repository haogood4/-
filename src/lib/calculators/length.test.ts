import { describe, expect, it } from "vitest";
import { convertLength } from "./length";

describe("convertLength / 典型换算", () => {
  it("1 mi → m = 1609.344", () => {
    const r = convertLength("1", "mi", "m");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(1609.344);
  });

  it("1 ft → cm = 30.48", () => {
    const r = convertLength("1", "ft", "cm");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(30.48);
  });

  it("1 km → mm = 1000000", () => {
    const r = convertLength("1", "km", "mm");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(1_000_000);
  });

  it("100 cm → m = 1", () => {
    const r = convertLength("100", "cm", "m");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(1);
  });
});

describe("convertLength / 同单位", () => {
  it("5 m → m = 5（过程不应除零或乱写）", () => {
    const r = convertLength("5", "m", "m");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.converted).toBe(5);
      expect(r.processText).toBe("5 米 = 5 米");
    }
  });
});

describe("convertLength / 错误处理", () => {
  it("0 拒绝", () => {
    expect(convertLength("0", "m", "ft").ok).toBe(false);
  });

  it("负数拒绝", () => {
    expect(convertLength("-1", "m", "ft").ok).toBe(false);
  });

  it("非数字拒绝", () => {
    expect(convertLength("abc", "m", "ft").ok).toBe(false);
  });

  it("不支持的单位拒绝", () => {
    expect(convertLength("1", "xyz", "m").ok).toBe(false);
  });

  it("空值拒绝", () => {
    expect(convertLength("", "m", "ft").ok).toBe(false);
  });
});
