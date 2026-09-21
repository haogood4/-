// 在线 GIF 解析工具 — 纯逻辑层（不依赖 DOM / Canvas，可单测）
// 降级方案说明：GIF 编/解码均需 LZW 算法，体积超出项目每页 JS 预算，故完整
// 「逐帧导出 / 重新编码」功能不上线；本引擎提供的是纯字节扫描契约 —— 解析
// GIF 逻辑屏幕尺寸与帧数（不解码像素数据，浏览器 <img> 仅能原生显示首帧）。
// 页面脚本 src/scripts/image-gif-cn-page.ts 据此展示帧数与尺寸，并支持导出
// 首帧 PNG；UI 明确提示「导出逐帧 PNG 的完整功能开发中」。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type GifErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_FORMAT"
  | "FILE_TOO_LARGE"
  | "TRUNCATED"
  | "NO_FRAMES";

export interface GifError {
  code: GifErrorCode;
  message: string;
}

export type GifResult<T> =
  { ok: true; value: T } | { ok: false; error: GifError };

function fail(
  code: GifErrorCode,
  message: string,
): { ok: false; error: GifError } {
  return { ok: false, error: { code, message } };
}

/** 单文件大小上限：20 MB（GIF 动图普遍大于普通图片，放宽一倍） */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/** 输入 MIME 白名单：仅 GIF */
export const GIF_MIME = "image/gif";

export interface GifFileLike {
  name: string;
  type: string;
  size: number;
}

export interface ValidatedGifFile {
  name: string;
  size: number;
}

export interface GifInfo {
  /** 逻辑屏幕宽度（像素） */
  width: number;
  /** 逻辑屏幕高度（像素） */
  height: number;
  /** 图像帧数（含逐帧动画的全部图像描述符） */
  frames: number;
}

/** 校验用户选择的文件：非空、须为 GIF（MIME 优先、.gif 扩展名兜底）、≤20MB */
export function validateGifFile(
  file: GifFileLike | null | undefined,
): GifResult<ValidatedGifFile> {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return fail("EMPTY_INPUT", "请先选择一个 GIF 文件");
  }
  const isGif =
    file.type.toLowerCase() === GIF_MIME || /\.gif$/i.test(file.name);
  if (!isGif) {
    return fail("INVALID_FORMAT", "仅支持 GIF 格式文件");
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail("FILE_TOO_LARGE", "文件超过 20 MB 上限，请换一个更小的 GIF");
  }
  return { ok: true, value: { name: file.name, size: file.size } };
}

/** 跳过子块序列（扩展与图像数据共用）：返回新的偏移；越界返回 -1 */
function skipSubBlocks(bytes: Uint8Array, start: number): number {
  let i = start;
  while (true) {
    if (i >= bytes.length) return -1;
    const len = bytes[i];
    i += 1;
    if (len === 0) return i;
    i += len;
    if (i > bytes.length) return -1;
  }
}

/**
 * 扫描 GIF 字节流：解析逻辑屏幕宽高并统计图像帧数。
 * 只读取块结构（签名/逻辑屏幕描述符/扩展/图像描述符/结束符），不解码 LZW
 * 像素数据。签名非 GIF、未知块类型返回 INVALID_FORMAT；流不完整返回
 * TRUNCATED；未发现任何图像帧返回 NO_FRAMES。
 */
export function parseGifInfo(bytes: Uint8Array): GifResult<GifInfo> {
  if (!bytes || bytes.length === 0) {
    return fail("EMPTY_INPUT", "文件内容为空，请重新选择");
  }
  if (bytes.length < 13) {
    return fail("TRUNCATED", "GIF 文件不完整或已损坏");
  }
  const sig = String.fromCharCode(
    bytes[0],
    bytes[1],
    bytes[2],
    bytes[3],
    bytes[4],
    bytes[5],
  );
  if (sig !== "GIF87a" && sig !== "GIF89a") {
    return fail("INVALID_FORMAT", "不是有效的 GIF 文件（签名不符）");
  }
  const width = bytes[6] | (bytes[7] << 8);
  const height = bytes[8] | (bytes[9] << 8);
  if (width === 0 || height === 0) {
    return fail("INVALID_FORMAT", "GIF 逻辑屏幕尺寸无效");
  }
  let i = 13;
  // 逻辑屏幕描述符 packed 字节：最高位为 1 时存在全局颜色表
  if (bytes[10] & 0x80) {
    i += 3 * 2 ** ((bytes[10] & 0x07) + 1);
    if (i > bytes.length) return fail("TRUNCATED", "GIF 文件不完整或已损坏");
  }
  let frames = 0;
  while (true) {
    if (i >= bytes.length) {
      return fail("TRUNCATED", "GIF 数据流缺少结束符，文件可能不完整");
    }
    const block = bytes[i];
    i += 1;
    if (block === 0x3b) break; // trailer：正常结束
    if (block === 0x21) {
      // 扩展块：1 字节标签 + 子块序列
      i += 1; // label（不区分类型，统一跳过）
      i = skipSubBlocks(bytes, i);
      if (i < 0) return fail("TRUNCATED", "GIF 文件不完整或已损坏");
      continue;
    }
    if (block === 0x2c) {
      // 图像描述符：9 字节定长 + 可选局部颜色表 + LZW 最小码长 + 子块序列
      frames += 1;
      if (i + 9 > bytes.length) {
        return fail("TRUNCATED", "GIF 文件不完整或已损坏");
      }
      const packed = bytes[i + 8];
      i += 9;
      if (packed & 0x80) {
        i += 3 * 2 ** ((packed & 0x07) + 1);
        if (i > bytes.length)
          return fail("TRUNCATED", "GIF 文件不完整或已损坏");
      }
      if (i >= bytes.length) return fail("TRUNCATED", "GIF 文件不完整或已损坏");
      i += 1; // LZW min code size
      i = skipSubBlocks(bytes, i);
      if (i < 0) return fail("TRUNCATED", "GIF 文件不完整或已损坏");
      continue;
    }
    return fail("INVALID_FORMAT", "GIF 包含无法识别的数据块，文件可能已损坏");
  }
  if (frames === 0) {
    return fail("NO_FRAMES", "未发现任何图像帧，文件可能是空 GIF");
  }
  return { ok: true, value: { width, height, frames } };
}

/** 生成第 index 帧（从 1 开始）的导出文件名：frame-01.png、frame-02.png … */
export function buildFrameFilename(index: number): GifResult<string> {
  if (!Number.isInteger(index) || index < 1 || index > 9999) {
    return fail("INVALID_FORMAT", "帧序号须为 1 ~ 9999 的整数");
  }
  return { ok: true, value: `frame-${String(index).padStart(2, "0")}.png` };
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
