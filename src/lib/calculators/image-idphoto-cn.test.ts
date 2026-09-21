import { describe, expect, it } from "vitest";
import {
  BG_COLOR_RGB,
  averageRgb,
  buildIdPhotoFilename,
  colorDistance,
  isBackgroundPixel,
  validateBgColor,
  validateImageFile,
  validateTolerance,
  type RGB,
} from "./image-idphoto-cn";

describe("validateImageFile", () => {
  it("空文件 → EMPTY_INPUT", () => {
    const r = validateImageFile(undefined);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
  });

  it("非法格式 → INVALID_FORMAT", () => {
    const r = validateImageFile({ name: "a.bmp", type: "image/bmp", size: 10 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });

  it("扩展名兜底（type 为空的拖拽场景）", () => {
    const r = validateImageFile({ name: "id.jpeg", type: "", size: 10 });
    expect(r).toMatchObject({ ok: true, value: { mime: "image/jpeg" } });
  });

  it("超过 10MB → FILE_TOO_LARGE", () => {
    const r = validateImageFile({
      name: "a.png",
      type: "image/png",
      size: 10 * 1024 * 1024 + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("FILE_TOO_LARGE");
  });
});

describe("validateBgColor", () => {
  it("red/white/blue 合法", () => {
    for (const c of ["red", "white", "blue"]) {
      expect(validateBgColor(c).ok).toBe(true);
    }
  });

  it("非法颜色 → INVALID_INPUT", () => {
    const r = validateBgColor("green");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("validateTolerance", () => {
  it("边界 10 与 120 合法", () => {
    expect(validateTolerance(10)).toMatchObject({ ok: true, value: 10 });
    expect(validateTolerance(120)).toMatchObject({ ok: true, value: 120 });
  });

  it("9 / 121 / 40.5 / NaN → OUT_OF_RANGE", () => {
    for (const n of [9, 121, 40.5, NaN]) {
      const r = validateTolerance(n);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
    }
  });
});

describe("colorDistance", () => {
  it("同色距离为 0", () => {
    expect(colorDistance({ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 })).toBe(0);
  });

  it("黑到白距离 = 255√3 ≈ 441.67", () => {
    const d = colorDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(d).toBeCloseTo(255 * Math.sqrt(3), 2);
  });

  it("距离对称且非负", () => {
    const a: RGB = { r: 10, g: 200, b: 30 };
    const b: RGB = { r: 250, g: 0, b: 90 };
    expect(colorDistance(a, b)).toBeCloseTo(colorDistance(b, a), 12);
    expect(colorDistance(a, b)).toBeGreaterThanOrEqual(0);
  });
});

describe("averageRgb（四角采样平均背景色）", () => {
  it("纯色采样平均等于该色", () => {
    const samples: RGB[] = Array.from({ length: 16 }, () => ({
      r: 240,
      g: 244,
      b: 250,
    }));
    expect(averageRgb(samples)).toMatchObject({
      ok: true,
      value: { r: 240, g: 244, b: 250 },
    });
  });

  it("混合采样按通道取平均并四舍五入", () => {
    const r = averageRgb([
      { r: 250, g: 250, b: 250 },
      { r: 251, g: 253, b: 255 },
    ]);
    expect(r).toMatchObject({ ok: true, value: { r: 251, g: 252, b: 253 } });
  });

  it("空采样 → INVALID_INPUT", () => {
    const r = averageRgb([]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("isBackgroundPixel（简化色键判定）", () => {
  const white = BG_COLOR_RGB.white;

  it("阈值内判定为背景（≤ 含边界）", () => {
    // 距离 = 10 恰好等于阈值 → 仍算背景
    expect(isBackgroundPixel({ r: 245, g: 255, b: 255 }, white, 10)).toBe(true);
    // 距离 = 11（sqrt(3*11²)≈19 >10）… 用精确可算样本：
    expect(isBackgroundPixel({ r: 240, g: 255, b: 255 }, white, 15)).toBe(true);
  });

  it("阈值外判定为前景", () => {
    expect(isBackgroundPixel({ r: 0, g: 0, b: 0 }, white, 10)).toBe(false);
    expect(isBackgroundPixel({ r: 30, g: 30, b: 30 }, white, 40)).toBe(false);
  });

  it("蓝底样本对白背景在低阈值下不算背景", () => {
    const blue: RGB = { r: 67, g: 142, b: 219 };
    expect(isBackgroundPixel(blue, white, 40)).toBe(false);
  });
});

describe("buildIdPhotoFilename", () => {
  it("固定输出 -idphoto.png，空名兜底 image", () => {
    expect(buildIdPhotoFilename("photo.jpg")).toBe("photo-idphoto.png");
    expect(buildIdPhotoFilename("")).toBe("image-idphoto.png");
  });
});
