import { describe, expect, it } from "vitest";
import {
  buildFrameFilename,
  parseGifInfo,
  validateGifFile,
} from "./image-gif-cn";

/**
 * 构造最小合法 GIF 字节流（GIF89a 签名 + 逻辑屏幕描述符 + 2 色全局颜色表 +
 * N 个图像描述符（各带 1 个子块的 LZW 数据占位）+ trailer）。
 * 仅用于验证块结构扫描逻辑，不代表真实编码器输出。
 */
function buildGif(frames: number, width = 4, height = 3): Uint8Array {
  const b: number[] = [];
  const pushStr = (s: string) => {
    for (const c of s) b.push(c.charCodeAt(0));
  };
  pushStr("GIF89a");
  b.push(
    width & 0xff,
    (width >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff,
  );
  b.push(0x80, 0x00, 0x00); // packed：有全局颜色表，size bits=0 → 2 色
  for (let i = 0; i < 6; i++) b.push(0x00); // 全局颜色表 2 色 × 3 字节
  for (let f = 0; f < frames; f++) {
    b.push(0x2c); // 图像描述符（共 9 字节：left/top/width/height/packed）
    b.push(
      0,
      0,
      0,
      0,
      width & 0xff,
      (width >> 8) & 0xff,
      height & 0xff,
      (height >> 8) & 0xff,
    );
    b.push(0x00); // packed：无局部颜色表
    b.push(0x02); // LZW min code size
    b.push(0x02, 0x44, 0x01); // 一个 2 字节子块
    b.push(0x00); // 子块结束
  }
  b.push(0x3b); // trailer
  return new Uint8Array(b);
}

describe("validateGifFile", () => {
  it("空文件 → EMPTY_INPUT", () => {
    const r = validateGifFile(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY_INPUT");
  });

  it("非 GIF 格式 → INVALID_FORMAT", () => {
    const r = validateGifFile({ name: "a.png", type: "image/png", size: 10 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });

  it("type 为空时按 .gif 扩展名兜底", () => {
    const r = validateGifFile({ name: "anim.GIF", type: "", size: 10 });
    expect(r.ok).toBe(true);
  });

  it("超过 20MB → FILE_TOO_LARGE", () => {
    const r = validateGifFile({
      name: "big.gif",
      type: "image/gif",
      size: 20 * 1024 * 1024 + 1,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("FILE_TOO_LARGE");
  });
});

describe("parseGifInfo（帧数与尺寸契约）", () => {
  it("单帧 GIF：宽高与帧数正确", () => {
    const r = parseGifInfo(buildGif(1, 320, 240));
    expect(r).toMatchObject({
      ok: true,
      value: { width: 320, height: 240, frames: 1 },
    });
  });

  it("三帧动画 GIF：frames = 3", () => {
    const r = parseGifInfo(buildGif(3, 16, 16));
    expect(r).toMatchObject({
      ok: true,
      value: { frames: 3, width: 16, height: 16 },
    });
  });

  it("小端序宽高解析：1000 宽 = 0xE8 0x03", () => {
    const r = parseGifInfo(buildGif(1, 1000, 500));
    if (r.ok) {
      expect(r.value.width).toBe(1000);
      expect(r.value.height).toBe(500);
    } else throw new Error("应当成功");
  });

  it("GIF87a 签名同样接受", () => {
    const bytes = buildGif(1);
    bytes.set([0x47, 0x49, 0x46, 0x38, 0x37, 0x61], 0); // "GIF87a"
    expect(parseGifInfo(bytes).ok).toBe(true);
  });

  it("签名不符 → INVALID_FORMAT", () => {
    const bytes = buildGif(1);
    bytes.set([0x50, 0x4e, 0x47, 0x20, 0x20, 0x20], 0); // "PNG   "
    const r = parseGifInfo(bytes);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });

  it("空内容 → EMPTY_INPUT；不足 13 字节 → TRUNCATED", () => {
    expect(parseGifInfo(new Uint8Array(0))).toMatchObject({
      ok: false,
      error: { code: "EMPTY_INPUT" },
    });
    const r = parseGifInfo(new Uint8Array(8));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TRUNCATED");
  });

  it("图形控制扩展（0x21 0xF9 …）被跳过且不影响帧数", () => {
    const base = buildGif(2);
    const ext = [0x21, 0xf9, 0x04, 0x00, 0x64, 0x00, 0x00, 0x00];
    const out = new Uint8Array(base.length + ext.length);
    // 扩展块插在全局颜色表之后（第 19 字节处）
    out.set(base.subarray(0, 19), 0);
    out.set(ext, 19);
    out.set(base.subarray(19), 19 + ext.length);
    const r = parseGifInfo(out);
    expect(r).toMatchObject({ ok: true, value: { frames: 2 } });
  });

  it("截断在图像数据中途 → TRUNCATED", () => {
    const full = buildGif(2);
    const r = parseGifInfo(full.subarray(0, full.length - 6));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TRUNCATED");
  });

  it("未知块类型 → INVALID_FORMAT", () => {
    const full = buildGif(1);
    full[19] = 0x77; // 全局颜色表后第一个字节应为 0x2C
    const r = parseGifInfo(full);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });

  it("只有 trailer 没有帧 → NO_FRAMES", () => {
    const b: number[] = [];
    for (const c of "GIF89a") b.push(c.charCodeAt(0));
    b.push(1, 0, 1, 0, 0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0x3b);
    const r = parseGifInfo(new Uint8Array(b));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("NO_FRAMES");
  });
});

describe("buildFrameFilename（逐帧 PNG 导出契约）", () => {
  it("帧号补零：1 → frame-01.png，12 → frame-12.png", () => {
    expect(buildFrameFilename(1)).toMatchObject({
      ok: true,
      value: "frame-01.png",
    });
    expect(buildFrameFilename(12)).toMatchObject({
      ok: true,
      value: "frame-12.png",
    });
  });

  it("非法帧号 → INVALID_FORMAT", () => {
    const r = buildFrameFilename(0);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_FORMAT");
  });
});
