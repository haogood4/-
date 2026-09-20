// 在线图片压缩工具 — 纯逻辑层（不依赖 Canvas / FileReader / DOM，可单测）
// 页面脚本 src/scripts/image-compress-cn-page.ts 负责实际的 Canvas 重绘与 toBlob 压缩，
// 本模块只做参数校验、目标尺寸计算、文件名生成与字节数格式化。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type CompressErrorCode = "INVALID_INPUT";

export interface CompressError {
  code: CompressErrorCode;
  message: string;
}

export type CompressResult<T> =
  { ok: true; value: T } | { ok: false; error: CompressError };

function fail(message: string): { ok: false; error: CompressError } {
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

/** 输出格式白名单（Canvas toBlob 跨浏览器稳定支持的两种有损格式） */
export const ALLOWED_OUTPUT_MIME = ["image/jpeg", "image/webp"] as const;
export type AllowedOutputMime = (typeof ALLOWED_OUTPUT_MIME)[number];

/** 质量区间（含端点） */
export const QUALITY_MIN = 0.1;
export const QUALITY_MAX = 1.0;

/** 最大边长可选项：0 = 不缩放 */
export const MAX_EDGE_CHOICES = [0, 1920, 1600, 1280] as const;
export type MaxEdgeChoice = (typeof MAX_EDGE_CHOICES)[number];

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
): CompressResult<ValidatedImageFile> {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return fail("请先选择一张图片文件");
  }
  const mime = ALLOWED_INPUT_MIME.includes(file.type as AllowedInputMime)
    ? (file.type as AllowedInputMime)
    : guessMimeFromName(file.name);
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

/** 校验压缩质量：0.1 ~ 1.0（含端点） */
export function validateQuality(raw: number): CompressResult<number> {
  if (!Number.isFinite(raw)) return fail("请输入有效的质量数值");
  if (raw < QUALITY_MIN || raw > QUALITY_MAX) {
    return fail(`质量须在 ${QUALITY_MIN} ~ ${QUALITY_MAX} 之间`);
  }
  return { ok: true, value: raw };
}

/** 校验最大边长选项（select 的字符串值），仅接受白名单档位 */
export function validateMaxEdge(
  raw: string | number,
): CompressResult<MaxEdgeChoice> {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (
    Number.isInteger(n) &&
    (MAX_EDGE_CHOICES as readonly number[]).includes(n)
  ) {
    return { ok: true, value: n as MaxEdgeChoice };
  }
  return fail("最大边长仅支持：不缩放 / 1920 / 1600 / 1280");
}

/** 校验输出格式选项（select 的字符串值） */
export function validateOutputFormat(
  raw: string,
): CompressResult<AllowedOutputMime> {
  if ((ALLOWED_OUTPUT_MIME as readonly string[]).includes(raw)) {
    return { ok: true, value: raw as AllowedOutputMime };
  }
  return fail("输出格式仅支持 JPEG 或 WebP");
}

export interface TargetDimensions {
  width: number;
  height: number;
  /** 是否实际发生了缩放 */
  scaled: boolean;
}

/**
 * 按最大边长等比缩放：maxEdge 为 0（不缩放）或最长边不超过上限时原样返回；
 * 否则以 maxEdge / 最长边 为比例缩放，四舍五入且保证宽高至少 1px。
 */
export function computeTargetDimensions(
  width: number,
  height: number,
  maxEdge: number,
): TargetDimensions {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const longest = Math.max(w, h);
  if (!Number.isFinite(maxEdge) || maxEdge <= 0 || longest <= maxEdge) {
    return { width: w, height: h, scaled: false };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
    scaled: true,
  };
}

/** 生成下载文件名：`<原名去扩展名>-compressed.<ext>`（空名兜底 image） */
export function buildCompressedFilename(
  originalName: string,
  outputMime: AllowedOutputMime,
): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim();
  const ext = outputMime === "image/jpeg" ? "jpg" : "webp";
  return `${base === "" ? "image" : base}-compressed.${ext}`;
}

export interface SavingsInfo {
  /** 节省字节数（压缩后反而变大时为负数） */
  savedBytes: number;
  /** 节省百分比，保留 1 位小数（变负即负数） */
  savingsPercent: number;
  /** 压缩后是否反而更大 */
  grew: boolean;
}

/** 计算压缩收益：originalBytes / compressedBytes 均须为正数 */
export function computeSavings(
  originalBytes: number,
  compressedBytes: number,
): CompressResult<SavingsInfo> {
  if (
    !Number.isFinite(originalBytes) ||
    !Number.isFinite(compressedBytes) ||
    originalBytes <= 0 ||
    compressedBytes <= 0
  ) {
    return fail("字节数必须为正数");
  }
  const savedBytes = originalBytes - compressedBytes;
  const savingsPercent = Math.round((savedBytes / originalBytes) * 1000) / 10;
  return {
    ok: true,
    value: {
      savedBytes,
      savingsPercent,
      grew: compressedBytes >= originalBytes,
    },
  };
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
