import { describe, expect, it } from "vitest";
import {
  buildFontSpec,
  buildWatermarkedFilename,
  computeSinglePosition,
  computeTilePositions,
  toRadians,
  validateAnchor,
  validateColor,
  validateFontSize,
  validateImageFile,
  validateLayout,
  validateOpacity,
  validateRotation,
  validateText,
} from "./image-watermark-cn";

describe("validateImageFile", () => {
  it("空文件 → EMPTY_INPUT", () => {
    const r = validateImageFile(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
  });

  it("非法格式 → INVALID_FORMAT；扩展名兜底通过", () => {
    const bad = validateImageFile({
      name: "a.gif",
      type: "image/gif",
      size: 10,
    });
    expect(bad.ok).toBe(false);
    const ok = validateImageFile({ name: "b.webp", type: "", size: 10 });
    expect(ok).toMatchObject({ ok: true, value: { mime: "image/webp" } });
  });

  it("超过 10MB → FILE_TOO_LARGE", () => {
    const r = validateImageFile({
      name: "big.jpg",
      type: "image/jpeg",
      size: 10 * 1024 * 1024 + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("FILE_TOO_LARGE");
  });
});

describe("参数校验", () => {
  it("validateText：空白 → EMPTY_INPUT，超 40 字 → OUT_OF_RANGE", () => {
    expect(validateText("   ").ok).toBe(false);
    const long = validateText("水印".repeat(21));
    expect(long.ok).toBe(false);
    if (!long.ok) expect(long.error.code).toBe("OUT_OF_RANGE");
    expect(validateText(" 内部资料 ")).toMatchObject({
      ok: true,
      value: "内部资料",
    });
  });

  it("validateFontSize：12 与 200 合法，11/201/1.5 越界", () => {
    expect(validateFontSize(12).ok).toBe(true);
    expect(validateFontSize(200).ok).toBe(true);
    for (const n of [11, 201, 1.5, NaN]) {
      const r = validateFontSize(n);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
    }
  });

  it("validateOpacity：0.05~1 合法，0 与 1.1 越界", () => {
    expect(validateOpacity(0.05)).toMatchObject({ ok: true, value: 0.05 });
    expect(validateOpacity(1).ok).toBe(true);
    expect(validateOpacity(0).ok).toBe(false);
    expect(validateOpacity(1.1).ok).toBe(false);
  });

  it("validateRotation：-90/0/90 合法，-91/91/1.5 越界", () => {
    for (const n of [-90, 0, 90]) expect(validateRotation(n).ok).toBe(true);
    for (const n of [-91, 91, 1.5]) expect(validateRotation(n).ok).toBe(false);
  });

  it("validateLayout / validateAnchor / validateColor 白名单", () => {
    expect(validateLayout("tile").ok).toBe(true);
    expect(validateLayout("diagonal").ok).toBe(false);
    expect(validateAnchor("bottom-right").ok).toBe(true);
    expect(validateAnchor("middle").ok).toBe(false);
    expect(validateColor("#ffffff").ok).toBe(true);
    expect(validateColor("#ff0000").ok).toBe(false);
  });
});

describe("buildFontSpec / toRadians", () => {
  it("字体规格为『{size}px sans-serif』", () => {
    expect(buildFontSpec(24)).toBe("24px sans-serif");
  });

  it("90 度 = π/2 弧度", () => {
    expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 12);
    expect(toRadians(0)).toBe(0);
    expect(toRadians(-45)).toBeCloseTo(-Math.PI / 4, 12);
  });
});

describe("computeTilePositions", () => {
  it("放得下时按步进铺满：200×100 画布、80×20 文字、间距 40 → 2×2=4 个落点", () => {
    const pos = computeTilePositions(200, 100, 80, 20, 40);
    expect(pos).toHaveLength(4);
    expect(pos).toContainEqual({ x: 0, y: 0 });
    expect(pos).toContainEqual({ x: 120, y: 60 });
  });

  it("文字宽于画布时退化为单个居中", () => {
    const pos = computeTilePositions(100, 100, 120, 20, 40);
    expect(pos).toHaveLength(1);
    expect(pos[0]).toEqual({ x: 0, y: 40 });
  });

  it("间距越大落点越少", () => {
    const tight = computeTilePositions(400, 100, 60, 20, 10);
    const loose = computeTilePositions(400, 100, 60, 20, 100);
    expect(tight.length).toBeGreaterThan(loose.length);
  });

  it("非法参数返回空数组（不抛错）", () => {
    expect(computeTilePositions(0, 100, 50, 20, 10)).toEqual([]);
    expect(computeTilePositions(100, 100, 0, 20, 10)).toEqual([]);
  });
});

describe("computeSinglePosition", () => {
  it("center 居中", () => {
    const p = computeSinglePosition(200, 100, 80, 20, "center", 10);
    expect(p).toEqual({ x: 60, y: 40 });
  });

  it("bottom-right 按边距贴角", () => {
    const p = computeSinglePosition(200, 100, 80, 20, "bottom-right", 10);
    expect(p).toEqual({ x: 110, y: 70 });
  });

  it("文字宽于画布时 x 夹为 0，y 仍按边距", () => {
    const p = computeSinglePosition(50, 50, 120, 20, "top-right", 10);
    expect(p).toEqual({ x: 0, y: 10 });
  });

  it("文字高宽均超画布时坐标夹为 0", () => {
    const p = computeSinglePosition(50, 50, 120, 80, "bottom-right", 10);
    expect(p).toEqual({ x: 0, y: 0 });
  });

  it("边距过大时夹紧到画布内", () => {
    const p = computeSinglePosition(200, 100, 80, 20, "top-left", 500);
    expect(p.x).toBeLessThanOrEqual(120); // canvasW - textW
    expect(p.y).toBeLessThanOrEqual(80);
  });
});

describe("buildWatermarkedFilename", () => {
  it("生成 -watermarked.png，空名兜底 image", () => {
    expect(buildWatermarkedFilename("photo.jpg")).toBe("photo-watermarked.png");
    expect(buildWatermarkedFilename("")).toBe("image-watermarked.png");
  });
});
