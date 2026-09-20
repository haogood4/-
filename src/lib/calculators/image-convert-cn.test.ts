import { describe, expect, it } from "vitest";
import {
  buildConvertedFilename,
  formatBytes,
  guessMimeFromName,
  MAX_FILE_BYTES,
  needsWhiteMatte,
  validateImageFile,
  validateOutputFormat,
  validateQuality,
} from "./image-convert-cn";

describe("validateImageFile / 三格式输入白名单", () => {
  it("PNG / JPEG / WebP 均通过", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp"]) {
      const r = validateImageFile({ name: "a.bin", type, size: 1024 });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.mime).toBe(type);
    }
  });

  it("非法 MIME（image/gif）返回 INVALID_INPUT", () => {
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

  it("type 为空时按扩展名兜底识别 .JPG（大小写不敏感）", () => {
    const r = validateImageFile({ name: "photo.JPG", type: "", size: 2048 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.mime).toBe("image/jpeg");
  });

  it("type 为空且无扩展名返回 INVALID_INPUT", () => {
    const r = validateImageFile({ name: "noext", type: "", size: 1024 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("validateImageFile / 空输入与 10MB 边界", () => {
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
      name: "big.webp",
      type: "image/webp",
      size: MAX_FILE_BYTES + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_INPUT");
      expect(r.error.message).toContain("10.00 MB");
    }
  });
});

describe("validateOutputFormat / 目标格式白名单", () => {
  it("image/png、image/jpeg、image/webp 三种目标均通过", () => {
    for (const v of ["image/png", "image/jpeg", "image/webp"]) {
      const r = validateOutputFormat(v);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(v);
    }
  });

  it("非白名单格式（image/gif、空串）返回 INVALID_INPUT", () => {
    for (const v of ["image/gif", "", "png"]) {
      const r = validateOutputFormat(v);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
    }
  });
});

describe("validateQuality / 质量范围 0.5–1.0", () => {
  it("默认 0.92 与边界 0.5、1.0 均通过", () => {
    expect(validateQuality(0.92).ok).toBe(true);
    expect(validateQuality(0.5).ok).toBe(true);
    expect(validateQuality(1.0).ok).toBe(true);
  });

  it("0.4、1.1、NaN 返回 INVALID_INPUT", () => {
    for (const bad of [0.4, 1.1, NaN]) {
      const r = validateQuality(bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
    }
  });
});

describe("buildConvertedFilename / 文件名生成", () => {
  it("photo.png + image/jpeg → photo-converted.jpg", () => {
    expect(buildConvertedFilename("photo.png", "image/jpeg")).toBe(
      "photo-converted.jpg",
    );
  });

  it("中文文件名：头像.webp + image/png → 头像-converted.png", () => {
    expect(buildConvertedFilename("头像.webp", "image/png")).toBe(
      "头像-converted.png",
    );
  });

  it("同名多扩展只剥最后一段：a.png.jpeg + image/webp → a.png-converted.webp", () => {
    expect(buildConvertedFilename("a.png.jpeg", "image/webp")).toBe(
      "a.png-converted.webp",
    );
  });

  it("无扩展名保留原名，空名兜底 image", () => {
    expect(buildConvertedFilename("noext", "image/png")).toBe(
      "noext-converted.png",
    );
    expect(buildConvertedFilename("", "image/jpeg")).toBe(
      "image-converted.jpg",
    );
  });
});

describe("needsWhiteMatte / JPEG 透明通道提示", () => {
  it("PNG/WebP → JPEG 需要垫白底", () => {
    expect(needsWhiteMatte("image/png", "image/jpeg")).toBe(true);
    expect(needsWhiteMatte("image/webp", "image/jpeg")).toBe(true);
  });

  it("JPEG → JPEG、任意 → PNG/WebP 不需要垫白底", () => {
    expect(needsWhiteMatte("image/jpeg", "image/jpeg")).toBe(false);
    expect(needsWhiteMatte("image/png", "image/webp")).toBe(false);
    expect(needsWhiteMatte("image/webp", "image/png")).toBe(false);
  });
});

describe("formatBytes / guessMimeFromName", () => {
  it("B / KB / MB 三档格式化与非法值", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(MAX_FILE_BYTES)).toBe("10.00 MB");
    expect(formatBytes(-1)).toBe("未知");
  });

  it("扩展名识别：.webp/.jpeg 命中，无扩展名与 .txt、结尾点号返回 null", () => {
    expect(guessMimeFromName("a.webp")).toBe("image/webp");
    expect(guessMimeFromName("a.jpeg")).toBe("image/jpeg");
    expect(guessMimeFromName("noext")).toBeNull();
    expect(guessMimeFromName("a.txt")).toBeNull();
    expect(guessMimeFromName("a.")).toBeNull();
  });
});
