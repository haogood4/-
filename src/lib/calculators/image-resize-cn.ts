// 在线图片改尺寸工具 — 纯逻辑层（不依赖 Canvas / FileReader / DOM，可单测）
// 与已有工具差异化：image-compress-cn 以「压体积」为核心，image-convert-cn 以
// 「转格式」为核心，本工具以「指定目标宽/高改尺寸」为核心（等比/精确两档）。
// 页面脚本 src/scripts/image-resize-cn-page.ts 负责图片解码、Canvas 绘制与
// toBlob 输出，本模块只做校验、目标尺寸计算与文件名生成。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type ResizeErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_FORMAT"
  | "FILE_TOO_LARGE"
  | "INVALID_INPUT"
  | "OUT_OF_RANGE";

export interface ResizeError {
  code: ResizeErrorCode;
  message: string;
}

export type ResizeResult<T> =
  { ok: true; value: T } | { ok: false; error: ResizeError };

function fail(
  code: ResizeErrorCode,
  message: string,
): { ok: false; error: ResizeError } {
  return { ok: false, error: { code, message } };
}

/** 单文件大小上限：10 MB */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** 输入格式白名单 */
export const ALLOWED_INPUT_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type AllowedInputMime = (typeof ALLOWED_INPUT_MIME)[number];

/** 输出格式白名单：JPG / PNG / WebP 三种可选 */
export const ALLOWED_OUTPUT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedOutputMime = (typeof ALLOWED_OUTPUT_MIME)[number];

/** 宽/高取值范围（像素，含端点） */
export const DIM_MIN = 1;
export const DIM_MAX = 10000;

/** 缩放模式：按宽度等比 / 按高度等比 / 精确宽高（可能变形） */
export type ResizeMode = "by-width" | "by-height" | "exact";

/** 待校验的文件元信息（结构化子集，便于单测构造） */
export interface ImageFileLike {
  name: string;
  type: string;
  size: number;
}

export interface ValidatedImageFile {
  name: string;
  mime: AllowedInputMime;
  size: number;
}

const EXT_MIME: Record<string, AllowedInputMime> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** 从文件名扩展名推断 MIME（部分拖拽场景 type 为空的兜底），不在白名单返回 null */
export function guessMimeFromName(name: string): AllowedInputMime | null {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return null;
  return EXT_MIME[name.slice(dot + 1).toLowerCase()] ?? null;
}

/** 校验用户选择的图片：非空、格式白名单（type 优先、扩展名兜底）、≤10MB */
export function validateImageFile(
  file: ImageFileLike | null | undefined,
): ResizeResult<ValidatedImageFile> {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return fail("EMPTY_INPUT", "请先选择一张图片文件");
  }
  const mime = ALLOWED_INPUT_MIME.includes(file.type as AllowedInputMime)
    ? (file.type as AllowedInputMime)
    : guessMimeFromName(file.name);
  if (!mime) {
    return fail("INVALID_FORMAT", "仅支持 PNG / JPEG / WebP 格式的图片");
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail(
      "FILE_TOO_LARGE",
      `图片超过 ${formatBytes(MAX_FILE_BYTES)} 上限，请换一张更小的图片`,
    );
  }
  return { ok: true, value: { name: file.name, mime, size: file.size } };
}

/** 校验宽/高取值：1 ~ 10000 的整数 */
export function validateDimension(
  raw: number,
  label: "宽度" | "高度",
): ResizeResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail("OUT_OF_RANGE", `${label}须为 1 ~ ${DIM_MAX} 的整数`);
  }
  if (raw < DIM_MIN || raw > DIM_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `${label}超出范围（${DIM_MIN} ~ ${DIM_MAX} 像素）`,
    );
  }
  return { ok: true, value: raw };
}

/** 校验输出格式选项（select 的字符串值） */
export function validateOutputFormat(
  raw: string,
): ResizeResult<AllowedOutputMime> {
  const t = raw.trim().toLowerCase();
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") {
    return { ok: true, value: t };
  }
  return fail("INVALID_INPUT", "输出格式仅支持 JPG、PNG 或 WebP");
}

export interface TargetDimensions {
  width: number;
  height: number;
}

/**
 * 按模式计算目标尺寸（四舍五入且保证至少 1px）：
 * - by-width：指定宽度，高度按源图比例换算；
 * - by-height：指定高度，宽度按源图比例换算；
 * - exact：宽高都按指定值（不保持比例，可能变形）。
 * mode/参数不匹配（如 by-width 缺宽度）返回 INVALID_INPUT。
 */
export function computeResizeTarget(
  srcW: number,
  srcH: number,
  mode: ResizeMode,
  width: number | null,
  height: number | null,
): ResizeResult<TargetDimensions> {
  if (
    !Number.isFinite(srcW) ||
    !Number.isFinite(srcH) ||
    srcW < 1 ||
    srcH < 1 ||
    !Number.isInteger(srcW) ||
    !Number.isInteger(srcH)
  ) {
    return fail("INVALID_INPUT", "源图尺寸无效，请重新选择图片");
  }
  if (mode === "by-width") {
    if (width === null) {
      return fail("INVALID_INPUT", "按宽度缩放时须填写目标宽度");
    }
    const w = Math.max(1, Math.round(width));
    return {
      ok: true,
      value: { width: w, height: Math.max(1, Math.round((srcH * w) / srcW)) },
    };
  }
  if (mode === "by-height") {
    if (height === null) {
      return fail("INVALID_INPUT", "按高度缩放时须填写目标高度");
    }
    const h = Math.max(1, Math.round(height));
    return {
      ok: true,
      value: { width: Math.max(1, Math.round((srcW * h) / srcH)), height: h },
    };
  }
  if (width === null || height === null) {
    return fail("INVALID_INPUT", "精确缩放时须同时填写目标宽度与高度");
  }
  return {
    ok: true,
    value: {
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    },
  };
}

const OUTPUT_EXT: Record<AllowedOutputMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 生成下载文件名：`<原名去扩展名>-resized.<新扩展名>`（空名兜底 image） */
export function buildResizedFilename(
  originalName: string,
  outputMime: AllowedOutputMime,
): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim();
  return `${base === "" ? "image" : base}-resized.${OUTPUT_EXT[outputMime]}`;
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
