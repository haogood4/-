import { describe, expect, it } from "vitest";
import {
  buildResizedFilename,
  computeResizeTarget,
  formatBytes,
  validateDimension,
  validateImageFile,
  validateOutputFormat,
} from "./image-resize-cn";

describe("validateImageFile", () => {
  it("空文件 → EMPTY_INPUT", () => {
    const r = validateImageFile(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
  });

  it("size 为 0 → EMPTY_INPUT", () => {
    const r = validateImageFile({ name: "a.png", type: "image/png", size: 0 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
  });

  it("非法格式 → INVALID_FORMAT", () => {
    const r = validateImageFile({ name: "a.bmp", type: "image/bmp", size: 10 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });

  it("type 为空时按扩展名兜底识别 jpg", () => {
    const r = validateImageFile({ name: "photo.JPG", type: "", size: 10 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.mime).toBe("image/jpeg");
  });

  it("超过 10MB → FILE_TOO_LARGE", () => {
    const r = validateImageFile({
      name: "big.png",
      type: "image/png",
      size: 10 * 1024 * 1024 + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("FILE_TOO_LARGE");
  });
});

describe("validateDimension", () => {
  it("0 / 负数 → OUT_OF_RANGE", () => {
    for (const n of [0, -1]) {
      const r = validateDimension(n, "宽度");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
    }
  });

  it("非整数 / NaN → OUT_OF_RANGE", () => {
    for (const n of [1.5, NaN, Infinity]) {
      const r = validateDimension(n, "高度");
      expect(r.ok).toBe(false);
    }
  });

  it("超过 10000 → OUT_OF_RANGE", () => {
    const r = validateDimension(10001, "宽度");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OUT_OF_RANGE");
  });

  it("边界值 1 与 10000 合法", () => {
    expect(validateDimension(1, "宽度")).toMatchObject({ ok: true, value: 1 });
    expect(validateDimension(10000, "高度")).toMatchObject({
      ok: true,
      value: 10000,
    });
  });
});

describe("validateOutputFormat", () => {
  it("接受 jpg/png/webp 三种 MIME", () => {
    for (const f of ["image/jpeg", "image/png", "image/webp"]) {
      expect(validateOutputFormat(f).ok).toBe(true);
    }
  });

  it("大小写与空白容错", () => {
    const r = validateOutputFormat(" Image/PNG ");
    expect(r.ok).toBe(true);
  });

  it("gif 输出被拒绝", () => {
    const r = validateOutputFormat("image/gif");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("computeResizeTarget", () => {
  it("by-width：800×600 → 宽 400 时高 300", () => {
    const r = computeResizeTarget(800, 600, "by-width", 400, null);
    expect(r).toMatchObject({ ok: true, value: { width: 400, height: 300 } });
  });

  it("by-height：800×600 → 高 300 时宽 400", () => {
    const r = computeResizeTarget(800, 600, "by-height", null, 300);
    expect(r).toMatchObject({ ok: true, value: { width: 400, height: 300 } });
  });

  it("by-width 缺宽度 → INVALID_INPUT", () => {
    const r = computeResizeTarget(800, 600, "by-width", null, null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("exact：不保持比例直接取指定值", () => {
    const r = computeResizeTarget(800, 600, "exact", 200, 500);
    expect(r).toMatchObject({ ok: true, value: { width: 200, height: 500 } });
  });

  it("结果至少 1px（比例换算向下取整不为 0）", () => {
    const r = computeResizeTarget(10000, 3, "by-width", 1, null);
    expect(r).toMatchObject({ ok: true, value: { width: 1, height: 1 } });
  });

  it("非整数目标宽四舍五入（799/800 比例）", () => {
    const r = computeResizeTarget(800, 601, "by-width", 400, null);
    if (r.ok)
      expect(r.value.height).toBe(301); // 601*400/800=300.5 → 301
    else throw new Error("应当成功");
  });

  it("源图尺寸非法 → INVALID_INPUT", () => {
    const r = computeResizeTarget(0, 600, "by-width", 400, null);
    expect(r.ok).toBe(false);
  });
});

describe("buildResizedFilename / formatBytes", () => {
  it("jpg 输出生成 -resized.jpg", () => {
    expect(buildResizedFilename("photo.png", "image/jpeg")).toBe(
      "photo-resized.jpg",
    );
  });

  it("png/webp 输出扩展名正确", () => {
    expect(buildResizedFilename("a", "image/png")).toBe("a-resized.png");
    expect(buildResizedFilename("a.webp", "image/webp")).toBe("a-resized.webp");
  });

  it("formatBytes 分级显示", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.00 MB");
    expect(formatBytes(-1)).toBe("未知");
  });
});
