import { describe, expect, it } from "vitest";
import { convertVolume } from "./volume";

const cv = (value: string, from: string, to: string) =>
  convertVolume({ value, from, to });

describe("convertVolume / 典型换算", () => {
  it("1 立方米 → 升 = 1000", () => {
    const r = cv("1", "m3", "l");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 升 → 毫升 = 1000", () => {
    const r = cv("1", "l", "ml");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1000");
  });

  it("1 立方厘米 → 毫升 = 1（等值关系）", () => {
    const r = cv("1", "cm3", "ml");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1");
  });

  it("1 美制加仑 → 升 = 3.785412（约）", () => {
    const r = cv("1", "usgal", "l");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 3.785412");
  });

  it("1 英制加仑 → 美制加仑 ≈ 1.20095", () => {
    const r = cv("1", "ukgal", "usgal");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 1.20095");
  });

  it("1 ft³ → in³ = 1728（立方英尺英寸整倍关系）", () => {
    const r = cv("1", "ft3", "in3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1728");
  });

  it("同单位 0.5 l → l = 0.5", () => {
    const r = cv("0.5", "l", "l");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0.5);
  });
});

describe("convertVolume / 错误处理", () => {
  it("空值 / 非法 / 0 / 未知单位均拒绝", () => {
    expect(cv("", "l", "ml").ok).toBe(false);
    expect(cv("1.5x", "l", "ml").ok).toBe(false);
    expect(cv("0", "l", "ml").ok).toBe(false);
    expect(cv("1", "pt", "l").ok).toBe(false);
  });

  it("小数超 6 位拒绝", () => {
    const r = cv("1.0000001", "l", "ml");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_MANY_DECIMALS");
  });
});
