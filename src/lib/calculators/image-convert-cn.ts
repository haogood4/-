// 在线图片格式转换工具 — 纯逻辑层（不依赖 Canvas / FileReader / DOM，可单测）
// 页面脚本 src/scripts/image-convert-cn-page.ts 负责实际的图片解码、Canvas 重绘与
// toBlob 转换，本模块只做输入校验、目标格式/质量校验、输出文件名生成与透明通道提示判定。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type ConvertErrorCode = "INVALID_INPUT";

export interface ConvertError {
  code: ConvertErrorCode;
  message: string;
}

export type ConvertResult<T> =
  { ok: true; value: T } | { ok: false; error: ConvertError };

function fail(message: string): { ok: false; error: ConvertError } {
  return { ok: false, error: { code: "INVALID_INPUT", message } };
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

/** 目标格式白名单：PNG / JPEG / WebP 三者互转 */
export const ALLOWED_OUTPUT_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type AllowedOutputMime = (typeof ALLOWED_OUTPUT_MIME)[number];

/** 有损输出（JPEG/WebP）质量区间（含端点）与默认值 */
export const QUALITY_MIN = 0.5;
export const QUALITY_MAX = 1.0;
export const QUALITY_DEFAULT = 0.92;

/** 输出文件扩展名映射 */
const OUTPUT_EXT: Record<AllowedOutputMime, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

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

/** 精确匹配输入 MIME（大小写不敏感），不在白名单返回 null */
function normalizeInputMime(type: string): AllowedInputMime | null {
  switch (type.toLowerCase()) {
    case "image/png":
      return "image/png";
    case "image/jpeg":
      return "image/jpeg";
    case "image/webp":
      return "image/webp";
    default:
      return null;
  }
}

/** 从文件名扩展名推断 MIME（部分拖拽场景 type 为空的兜底），不在白名单返回 null */
export function guessMimeFromName(name: string): AllowedInputMime | null {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return null;
  return EXT_MIME[name.slice(dot + 1).toLowerCase()] ?? null;
}

/** 校验用户选择的图片：非空、格式白名单（type 优先、扩展名兜底）、≤10MB */
export function validateImageFile(
  file: ImageFileLike | null | undefined,
): ConvertResult<ValidatedImageFile> {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return fail("请先选择一张图片文件");
  }
  const mime = normalizeInputMime(file.type) ?? guessMimeFromName(file.name);
  if (!mime) {
    return fail("仅支持 PNG / JPEG / WebP 格式的图片");
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail(
      `图片超过 ${formatBytes(MAX_FILE_BYTES)} 上限，请换一张更小的图片`,
    );
  }
  return { ok: true, value: { name: file.name, mime, size: file.size } };
}

/** 校验目标格式选项（select 的字符串值）：仅接受 image/png、image/jpeg、image/webp */
export function validateOutputFormat(
  raw: string,
): ConvertResult<AllowedOutputMime> {
  const t = raw.trim().toLowerCase();
  if (t === "image/png" || t === "image/jpeg" || t === "image/webp") {
    return { ok: true, value: t };
  }
  return fail("目标格式仅支持 PNG、JPEG 或 WebP");
}

/** 校验输出质量：0.5 ~ 1.0（含端点，仅对有损格式生效） */
export function validateQuality(raw: number): ConvertResult<number> {
  if (!Number.isFinite(raw)) return fail("请输入有效的质量数值");
  if (raw < QUALITY_MIN || raw > QUALITY_MAX) {
    return fail(`质量须在 ${QUALITY_MIN} ~ ${QUALITY_MAX} 之间`);
  }
  return { ok: true, value: raw };
}

/** 生成下载文件名：`<原名去扩展名>-converted.<新扩展名>`（空名兜底 image） */
export function buildConvertedFilename(
  originalName: string,
  outputMime: AllowedOutputMime,
): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim();
  return `${base === "" ? "image" : base}-converted.${OUTPUT_EXT[outputMime]}`;
}

/**
 * 是否需要垫白底 / 透明通道提示：目标为 JPEG（无透明通道）且源为 PNG 或 WebP
 * （可能含透明像素）时返回 true。
 */
export function needsWhiteMatte(
  sourceMime: AllowedInputMime,
  outputMime: AllowedOutputMime,
): boolean {
  return outputMime === "image/jpeg" && sourceMime !== "image/jpeg";
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
