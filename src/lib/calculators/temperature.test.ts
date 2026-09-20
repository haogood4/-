import { describe, expect, it } from "vitest";
import { convertTemperature } from "./temperature";

describe("convertTemperature / 典型换算", () => {
  it("0°C → 32°F = 273.15K", () => {
    const rF = convertTemperature("0", "C", "F");
    expect(rF.ok).toBe(true);
    if (rF.ok) {
      expect(rF.converted).toBe(32);
      expect(rF.kelvin).toBe(273.15);
    }
    const rK = convertTemperature("0", "C", "K");
    expect(rK.ok).toBe(true);
    if (rK.ok) expect(rK.converted).toBe(273.15);
  });

  it("100°C → 212°F / 373.15K", () => {
    const rF = convertTemperature("100", "C", "F");
    expect(rF.ok).toBe(true);
    if (rF.ok) expect(rF.converted).toBe(212);
    const rK = convertTemperature("100", "C", "K");
    expect(rK.ok).toBe(true);
    if (rK.ok) expect(rK.converted).toBeCloseTo(373.15, 6);
  });

  it("32°F → 0°C", () => {
    const r = convertTemperature("32", "F", "C");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0);
  });

  it("273.15K → 0°C", () => {
    const r = convertTemperature("273.15", "K", "C");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0);
  });
});

describe("convertTemperature / 边界", () => {
  it("-273.15°C → 0 K 接受", () => {
    const r = convertTemperature("-273.15", "C", "K");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBe(0);
  });

  it("-274°C → 拒绝（低于绝对零度）", () => {
    expect(convertTemperature("-274", "C", "K")).toEqual({
      ok: false,
      error: {
        code: "BELOW_ABSOLUTE_ZERO",
        message: "温度低于绝对零度（0 K），请检查输入",
      },
    });
  });

  it("-459.67°F → 0 K 接受（华氏绝对零度）", () => {
    const r = convertTemperature("-459.67", "F", "K");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.converted).toBeCloseTo(0, 2);
  });

  it("-460°F → 拒绝", () => {
    expect(convertTemperature("-460", "F", "K").ok).toBe(false);
  });
});

describe("convertTemperature / 错误处理", () => {
  it("非数字拒绝", () => {
    expect(convertTemperature("abc", "C", "F").ok).toBe(false);
  });

  it("不支持单位拒绝", () => {
    expect(convertTemperature("0", "X", "C").ok).toBe(false);
    expect(convertTemperature("0", "C", "Y").ok).toBe(false);
  });

  it("空字符串拒绝", () => {
    expect(convertTemperature("", "C", "F").ok).toBe(false);
  });
});
