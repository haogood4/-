import { describe, expect, it } from "vitest";
import {
  buildCompressedFilename,
  computeSavings,
  computeTargetDimensions,
  formatBytes,
  guessMimeFromName,
  MAX_FILE_BYTES,
  validateImageFile,
  validateMaxEdge,
  validateOutputFormat,
  validateQuality,
} from "./image-compress-cn";

describe("validateImageFile / 格式白名单", () => {
  it("PNG / JPEG / WebP 均通过", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp"]) {
      const r = validateImageFile({ name: "a.bin", type, size: 1024 });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.mime).toBe(type);
    }
  });

  it("不支持的格式（GIF）返回 INVALID_INPUT", () => {
    const r = validateImageFile({
      name: "a.gif",
      type: "image/gif",
      size: 1024,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_INPUT");
      expect(r.error.message).toContain("PNG");
    }
  });

  it("type 为空时按扩展名兜底识别 .jpg", () => {
    const r = validateImageFile({ name: "photo.JPG", type: "", size: 2048 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.mime).toBe("image/jpeg");
  });

  it("type 为空且扩展名不支持（.gif）返回 INVALID_INPUT", () => {
    const r = validateImageFile({ name: "a.gif", type: "", size: 1024 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("validateImageFile / 空输入与尺寸上限", () => {
  it("null / undefined 返回 INVALID_INPUT", () => {
    expect(validateImageFile(null).ok).toBe(false);
    expect(validateImageFile(undefined).ok).toBe(false);
  });

  it("0 字节文件视为无效输入", () => {
    const r = validateImageFile({
      name: "a.png",
      type: "image/png",
      size: 0,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("恰好 10MB 通过（边界含端点）", () => {
    const r = validateImageFile({
      name: "edge.png",
      type: "image/png",
      size: MAX_FILE_BYTES,
    });
    expect(r.ok).toBe(true);
  });

  it("超过 10MB 返回 INVALID_INPUT 且提示上限", () => {
    const r = validateImageFile({
      name: "big.png",
      type: "image/png",
      size: MAX_FILE_BYTES + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_INPUT");
      expect(r.error.message).toContain("10.00 MB");
    }
  });
});

describe("validateQuality / 质量范围", () => {
  it("0.8 通过", () => {
    const r = validateQuality(0.8);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(0.8);
  });

  it("边界 0.1 与 1.0 均通过", () => {
    expect(validateQuality(0.1).ok).toBe(true);
    expect(validateQuality(1.0).ok).toBe(true);
  });

  it("0、1.2、NaN 返回 INVALID_INPUT", () => {
    for (const bad of [0, 1.2, NaN]) {
      const r = validateQuality(bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
    }
  });
});

describe("validateMaxEdge / validateOutputFormat / 选项白名单", () => {
  it("0（不缩放）、1920、1600、1280 通过", () => {
    for (const v of ["0", "1920", "1600", "1280"]) {
      expect(validateMaxEdge(v).ok).toBe(true);
    }
  });

  it("非白名单档位（800）与非法值返回 INVALID_INPUT", () => {
    for (const v of ["800", "abc", "19.2"]) {
      const r = validateMaxEdge(v);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
    }
  });

  it("输出格式仅接受 image/jpeg 与 image/webp", () => {
    expect(validateOutputFormat("image/jpeg").ok).toBe(true);
    expect(validateOutputFormat("image/webp").ok).toBe(true);
    const r = validateOutputFormat("image/png");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("computeTargetDimensions / 宽高比缩放", () => {
  it("maxEdge=0 不缩放", () => {
    const d = computeTargetDimensions(4000, 3000, 0);
    expect(d).toEqual({ width: 4000, height: 3000, scaled: false });
  });

  it("最长边不超过上限时原样返回", () => {
    const d = computeTargetDimensions(1200, 800, 1920);
    expect(d).toEqual({ width: 1200, height: 800, scaled: false });
  });

  it("横图 4000×3000 限 1920 → 1920×1440（保持 4:3）", () => {
    const d = computeTargetDimensions(4000, 3000, 1920);
    expect(d).toEqual({ width: 1920, height: 1440, scaled: true });
  });

  it("竖图 1080×1920 限 1280 → 720×1280", () => {
    const d = computeTargetDimensions(1080, 1920, 1280);
    expect(d).toEqual({ width: 720, height: 1280, scaled: true });
  });

  it("极端比例（10000×10 限 1920）短边至少 1px", () => {
    const d = computeTargetDimensions(10000, 10, 1920);
    expect(d.width).toBe(1920);
    expect(d.height).toBeGreaterThanOrEqual(1);
  });

  it("非整数输入四舍五入", () => {
    const d = computeTargetDimensions(100.6, 50.4, 0);
    expect(d.width).toBe(101);
    expect(d.height).toBe(50);
  });
});

describe("buildCompressedFilename / 文件名生成", () => {
  it("photo.png + JPEG → photo-compressed.jpg", () => {
    expect(buildCompressedFilename("photo.png", "image/jpeg")).toBe(
      "photo-compressed.jpg",
    );
  });

  it("大写扩展名 .JPG 同样剥离，WebP 输出 → -compressed.webp", () => {
    expect(buildCompressedFilename("Holiday.JPG", "image/webp")).toBe(
      "Holiday-compressed.webp",
    );
  });

  it("多段点号文件名只剥最后一段扩展名", () => {
    expect(buildCompressedFilename("my.photo.final.jpeg", "image/jpeg")).toBe(
      "my.photo.final-compressed.jpg",
    );
  });

  it("无扩展名或空名兜底为 image", () => {
    expect(buildCompressedFilename("noext", "image/webp")).toBe(
      "noext-compressed.webp",
    );
    expect(buildCompressedFilename("", "image/jpeg")).toBe(
      "image-compressed.jpg",
    );
  });
});

describe("computeSavings / 节省百分比", () => {
  it("1000→600 节省 40%", () => {
    const r = computeSavings(1000, 600);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.savedBytes).toBe(400);
      expect(r.value.savingsPercent).toBe(40);
      expect(r.value.grew).toBe(false);
    }
  });

  it("压缩后反而更大 → grew=true 且百分比为负", () => {
    const r = computeSavings(1000, 1100);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.grew).toBe(true);
      expect(r.value.savingsPercent).toBe(-10);
    }
  });

  it("保留 1 位小数", () => {
    const r = computeSavings(3, 1);
    if (!r.ok) throw new Error("应成功");
    expect(r.value.savingsPercent).toBe(66.7);
  });

  it("0 或负数输入返回 INVALID_INPUT", () => {
    expect(computeSavings(0, 100).ok).toBe(false);
    expect(computeSavings(100, -1).ok).toBe(false);
  });
});

describe("formatBytes / guessMimeFromName", () => {
  it("B / KB / MB 三档格式化", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10.00 MB");
    expect(formatBytes(-1)).toBe("未知");
  });

  it("扩展名识别：.webp 命中、无扩展名与 .txt 返回 null", () => {
    expect(guessMimeFromName("a.webp")).toBe("image/webp");
    expect(guessMimeFromName("noext")).toBeNull();
    expect(guessMimeFromName("a.txt")).toBeNull();
    expect(guessMimeFromName("a.")).toBeNull();
  });
});
