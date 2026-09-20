import { describe, expect, it } from "vitest";
import { convertSpeed } from "./speed";

const cv = (value: string, from: string, to: string) =>
  convertSpeed({ value, from, to });

describe("convertSpeed / 典型换算", () => {
  it("1 km/h → m/s ≈ 0.277778", () => {
    const r = cv("1", "kmh", "ms");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.277778");
  });

  it("36 km/h → m/s = 10（整倍关系）", () => {
    const r = cv("36", "kmh", "ms");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("10");
  });

  it("1 mph → km/h = 1.609344（精确）", () => {
    const r = cv("1", "mph", "kmh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1.609344");
  });

  it("1 节 → km/h = 1.852（精确）", () => {
    const r = cv("1", "kn", "kmh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1.852");
  });

  it("1 ft/s → mph ≈ 0.681818", () => {
    const r = cv("1", "fts", "mph");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("约 0.681818");
  });

  it("1 Ma → km/h = 1234.8（标准大气近似）", () => {
    const r = cv("1", "mach", "kmh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.convertedText).toBe("1234.8");
  });

  it("同单位 120 kmh → kmh = 120", () => {
    const r = cv("120", "kmh", "kmh");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(120);
  });
});

describe("convertSpeed / 错误处理", () => {
  it("空值 / 非法 / 负数 / 未知单位均拒绝", () => {
    expect(cv("", "kmh", "ms").ok).toBe(false);
    expect(cv("12a", "kmh", "ms").ok).toBe(false);
    expect(cv("-5", "kmh", "ms").ok).toBe(false);
    expect(cv("1", "kmh", "furlong").ok).toBe(false);
  });
});
