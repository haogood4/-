// 在线证件照换底色工具 — 纯逻辑层（不依赖 Canvas / FileReader / DOM，可单测）
// 算法定位：简化色键（chroma-key）方案 —— 取照片四角采样平均色作为背景色，
// 对每个像素按色差阈值替换为红/白/蓝纯色底。非 AI 抠图，发丝边缘可能有残留，
// 页面侧已明确注明算法局限。像素遍历在页面脚本完成，本模块只做校验、
// 背景色平均采样、色差与判定纯函数。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type IdPhotoErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_FORMAT"
  | "FILE_TOO_LARGE"
  | "INVALID_INPUT"
  | "OUT_OF_RANGE";

export interface IdPhotoError {
  code: IdPhotoErrorCode;
  message: string;
}

export type IdPhotoResult<T> =
  { ok: true; value: T } | { ok: false; error: IdPhotoError };

function fail(
  code: IdPhotoErrorCode,
  message: string,
): { ok: false; error: IdPhotoError } {
  return { ok: false, error: { code, message } };
}

/** 单文件大小上限：10 MB */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** 输入格式白名单（证件照通常为 JPEG/PNG，WebP 亦兼容） */
export const ALLOWED_INPUT_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type AllowedInputMime = (typeof ALLOWED_INPUT_MIME)[number];

/** 换底色目标：红底 / 白底 / 蓝底 */
export type IdBgColor = "red" | "white" | "blue";

/** 目标底色 RGB 值（红底 / 白底 / 证件蓝） */
export const BG_COLOR_RGB: Record<IdBgColor, RGB> = {
  red: { r: 255, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  blue: { r: 67, g: 142, b: 219 },
};

/** 目标底色 HEX（供页面色块预览） */
export const BG_COLOR_HEX: Record<IdBgColor, string> = {
  red: "#ff0000",
  white: "#ffffff",
  blue: "#438edb",
};

/** 色差阈值范围（0~255 欧氏距离，含端点） */
export const TOLERANCE_MIN = 10;
export const TOLERANCE_MAX = 120;

export interface RGB {
  r: number;
  g: number;
  b: number;
}

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
): IdPhotoResult<ValidatedImageFile> {
  if (!file || !Number.isFinite(file.size) || file.size <= 0) {
    return fail("EMPTY_INPUT", "请先选择一张证件照");
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

/** 校验目标底色选项（select 的字符串值） */
export function validateBgColor(raw: string): IdPhotoResult<IdBgColor> {
  if (raw === "red" || raw === "white" || raw === "blue") {
    return { ok: true, value: raw };
  }
  return fail("INVALID_INPUT", "底色仅支持红底、白底或蓝底");
}

/** 校验色差阈值：10 ~ 120 的整数 */
export function validateTolerance(raw: number): IdPhotoResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail(
      "OUT_OF_RANGE",
      `色差阈值须为 ${TOLERANCE_MIN} ~ ${TOLERANCE_MAX} 的整数`,
    );
  }
  if (raw < TOLERANCE_MIN || raw > TOLERANCE_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `色差阈值超出范围（${TOLERANCE_MIN} ~ ${TOLERANCE_MAX}）`,
    );
  }
  return { ok: true, value: raw };
}

/** RGB 欧氏色差（0~441.67），用于背景判定 */
export function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 四角采样平均背景色：把各角采样到的像素求通道平均并四舍五入。
 * 采样列表为空返回 INVALID_INPUT（页面侧采样区异常时的防御）。
 */
export function averageRgb(samples: RGB[]): IdPhotoResult<RGB> {
  if (!Array.isArray(samples) || samples.length === 0) {
    return fail("INVALID_INPUT", "背景采样失败，请重新选择图片");
  }
  let r = 0;
  let g = 0;
  let b = 0;
  for (const s of samples) {
    r += s.r;
    g += s.g;
    b += s.b;
  }
  const n = samples.length;
  return {
    ok: true,
    value: {
      r: Math.round(r / n),
      g: Math.round(g / n),
      b: Math.round(b / n),
    },
  };
}

/**
 * 判定像素是否为背景：色差 ≤ 阈值（含边界）即视为背景。
 * 简化色键算法的核心判定，纯函数可单测。
 */
export function isBackgroundPixel(
  pixel: RGB,
  bg: RGB,
  tolerance: number,
): boolean {
  return colorDistance(pixel, bg) <= tolerance;
}

/** 生成下载文件名：`<原名去扩展名>-idphoto.png`（固定 PNG 保留处理结果细节） */
export function buildIdPhotoFilename(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim();
  return `${base === "" ? "image" : base}-idphoto.png`;
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
