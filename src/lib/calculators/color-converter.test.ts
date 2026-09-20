import { describe, expect, it } from "vitest";
import { hexToRgb, rgbToHex } from "./color-converter";

describe("color-converter", () => {
  it("hexToRgb：标准 6 位 hex", () => {
    const r = hexToRgb({ hex: "#2563eb" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.r).toBe(37);
      expect(r.value.g).toBe(99);
      expect(r.value.b).toBe(235);
      expect(r.value.hex).toBe("#2563eb");
    }
  });

  it("hexToRgb：3 位 hex 自动展开", () => {
    const r = hexToRgb({ hex: "#abc" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.r).toBe(0xaa);
      expect(r.value.g).toBe(0xbb);
      expect(r.value.b).toBe(0xcc);
    }
  });

  it("hexToRgb：无 # 也接受", () => {
    const r = hexToRgb({ hex: "FF00FF" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.hex).toBe("#ff00ff");
  });

  it("hexToRgb：空字符串拒绝", () => {
    const r = hexToRgb({ hex: "" });
    expect(r.ok).toBe(false);
  });

  it("hexToRgb：非法字符拒绝", () => {
    const r = hexToRgb({ hex: "#zzzzzz" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_HEX");
  });

  it("rgbToHex：标准 RGB", () => {
    const r = rgbToHex({ r: 37, g: 99, b: 235 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.hex).toBe("#2563eb");
  });

  it("rgbToHex：边界 0/0/0 → #000000", () => {
    const r = rgbToHex({ r: 0, g: 0, b: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.hex).toBe("#000000");
  });

  it("rgbToHex：边界 255/255/255 → #ffffff", () => {
    const r = rgbToHex({ r: 255, g: 255, b: 255 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.hex).toBe("#ffffff");
  });

  it("rgbToHex：超出 255 拒绝", () => {
    const r = rgbToHex({ r: 256, g: 0, b: 0 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_RGB");
  });

  it("rgbToHex：负数拒绝", () => {
    const r = rgbToHex({ r: -1, g: 0, b: 0 });
    expect(r.ok).toBe(false);
  });

  it("rgbToHex：小数拒绝（必须是整数）", () => {
    const r = rgbToHex({ r: 10.5, g: 0, b: 0 });
    expect(r.ok).toBe(false);
  });

  it("互转往返：hex→rgb→hex 一致", () => {
    const hex1 = "#1a2b3c";
    const r1 = hexToRgb({ hex: hex1 });
    expect(r1.ok).toBe(true);
    if (r1.ok) {
      const r2 = rgbToHex({ r: r1.value.r, g: r1.value.g, b: r1.value.b });
      expect(r2.ok).toBe(true);
      if (r2.ok) expect(r2.value.hex).toBe(hex1);
    }
  });
});