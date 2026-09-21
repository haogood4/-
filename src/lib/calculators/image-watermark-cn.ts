// 在线图片加水印工具 — 纯逻辑层（不依赖 Canvas / FileReader / DOM，可单测）
// 页面脚本 src/scripts/image-watermark-cn-page.ts 负责图片解码、Canvas 绘制与
// toBlob 输出；本模块只做参数校验、平铺/单点坐标计算与文件名生成。
// 铁律：绝不 throw，失败一律返回判别联合 { ok: false, error }。

export type WatermarkErrorCode =
  | "EMPTY_INPUT"
  | "INVALID_FORMAT"
  | "FILE_TOO_LARGE"
  | "INVALID_INPUT"
  | "OUT_OF_RANGE";

export interface WatermarkError {
  code: WatermarkErrorCode;
  message: string;
}

export type WatermarkResult<T> =
  { ok: true; value: T } | { ok: false; error: WatermarkError };

function fail(
  code: WatermarkErrorCode,
  message: string,
): { ok: false; error: WatermarkError } {
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

/** 水印文字长度上限（字符数） */
export const TEXT_MAX = 40;

/** 字号范围（像素，含端点） */
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 200;

/** 不透明度范围（含端点） */
export const OPACITY_MIN = 0.05;
export const OPACITY_MAX = 1;

/** 旋转角度范围（度，含端点） */
export const ROTATION_MIN = -90;
export const ROTATION_MAX = 90;

/** 平铺间距范围（像素，含端点） */
export const GAP_MIN = 10;
export const GAP_MAX = 300;

/** 单点锚位边距范围（像素，含端点） */
export const MARGIN_MIN = 0;
export const MARGIN_MAX = 500;

/** 水印布局：平铺 / 单点 */
export type WatermarkLayout = "tile" | "single";

/** 单点模式的五个锚位 */
export type WatermarkAnchor =
  "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** 水印颜色白名单 */
export const COLOR_WHITELIST = ["#ffffff", "#000000"] as const;
export type WatermarkColor = (typeof COLOR_WHITELIST)[number];

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

/** 校验用户选择的图片：非空、格式白名单（type 优先、扩展名兜底）、≤10MB */
export function validateImageFile(
  file: ImageFileLike | null | undefined,
): WatermarkResult<ValidatedImageFile> {
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

function guessMimeFromName(name: string): AllowedInputMime | null {
  const dot = name.lastIndexOf(".");
  if (dot < 0 || dot === name.length - 1) return null;
  return EXT_MIME[name.slice(dot + 1).toLowerCase()] ?? null;
}

/** 校验水印文字：去除首尾空白后非空且 ≤40 字符 */
export function validateText(raw: string): WatermarkResult<string> {
  const text = raw.trim();
  if (!text) return fail("EMPTY_INPUT", "请填写水印文字");
  if (text.length > TEXT_MAX) {
    return fail("OUT_OF_RANGE", `水印文字不超过 ${TEXT_MAX} 个字符`);
  }
  return { ok: true, value: text };
}

/** 校验字号：12 ~ 200 的整数 */
export function validateFontSize(raw: number): WatermarkResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail(
      "OUT_OF_RANGE",
      `字号须为 ${FONT_SIZE_MIN} ~ ${FONT_SIZE_MAX} 的整数`,
    );
  }
  if (raw < FONT_SIZE_MIN || raw > FONT_SIZE_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `字号超出范围（${FONT_SIZE_MIN} ~ ${FONT_SIZE_MAX} 像素）`,
    );
  }
  return { ok: true, value: raw };
}

/** 校验不透明度：0.05 ~ 1（含端点） */
export function validateOpacity(raw: number): WatermarkResult<number> {
  if (!Number.isFinite(raw))
    return fail("INVALID_INPUT", "请输入有效的不透明度");
  if (raw < OPACITY_MIN || raw > OPACITY_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `不透明度须在 ${OPACITY_MIN} ~ ${OPACITY_MAX} 之间`,
    );
  }
  return { ok: true, value: raw };
}

/** 校验旋转角度：-90 ~ 90 的整数 */
export function validateRotation(raw: number): WatermarkResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail(
      "OUT_OF_RANGE",
      `旋转角度须为 ${ROTATION_MIN} ~ ${ROTATION_MAX} 的整数`,
    );
  }
  if (raw < ROTATION_MIN || raw > ROTATION_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `旋转角度超出范围（${ROTATION_MIN} ~ ${ROTATION_MAX} 度）`,
    );
  }
  return { ok: true, value: raw };
}

/** 校验布局选项（select 的字符串值） */
export function validateLayout(raw: string): WatermarkResult<WatermarkLayout> {
  if (raw === "tile" || raw === "single") return { ok: true, value: raw };
  return fail("INVALID_INPUT", "布局仅支持平铺或单点");
}

/** 校验单点锚位选项（select 的字符串值） */
export function validateAnchor(raw: string): WatermarkResult<WatermarkAnchor> {
  const anchors: readonly string[] = [
    "center",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];
  if (anchors.includes(raw)) return { ok: true, value: raw as WatermarkAnchor };
  return fail("INVALID_INPUT", "锚位选项无效");
}

/** 校验平铺间距：10 ~ 300 的整数 */
export function validateGap(raw: number): WatermarkResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail("OUT_OF_RANGE", `间距须为 ${GAP_MIN} ~ ${GAP_MAX} 的整数`);
  }
  if (raw < GAP_MIN || raw > GAP_MAX) {
    return fail("OUT_OF_RANGE", `间距超出范围（${GAP_MIN} ~ ${GAP_MAX} 像素）`);
  }
  return { ok: true, value: raw };
}

/** 校验单点边距：0 ~ 500 的整数 */
export function validateMargin(raw: number): WatermarkResult<number> {
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return fail(
      "OUT_OF_RANGE",
      `边距须为 ${MARGIN_MIN} ~ ${MARGIN_MAX} 的整数`,
    );
  }
  if (raw < MARGIN_MIN || raw > MARGIN_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `边距超出范围（${MARGIN_MIN} ~ ${MARGIN_MAX} 像素）`,
    );
  }
  return { ok: true, value: raw };
}

/** 校验水印颜色（select 的字符串值） */
export function validateColor(raw: string): WatermarkResult<WatermarkColor> {
  if ((COLOR_WHITELIST as readonly string[]).includes(raw)) {
    return { ok: true, value: raw as WatermarkColor };
  }
  return fail("INVALID_INPUT", "水印颜色仅支持白色或黑色");
}

/** 生成 Canvas 字体规格字符串（页面侧 ctx.font 直接可用，便于单测） */
export function buildFontSpec(size: number): string {
  return `${size}px sans-serif`;
}

/** 角度转弧度（Canvas rotate 用） */
export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface TilePosition {
  x: number;
  y: number;
}

/**
 * 计算平铺水印的落点（左上角坐标，配 textBaseline="top" 使用）：
 * 从 (0,0) 起按「文字尺寸 + 间距」步进，完整放得下的位置才落点；
 * 文字比画布还大时退化为单个居中（可负偏移由 clamp 归零）。
 */
export function computeTilePositions(
  canvasW: number,
  canvasH: number,
  textW: number,
  textH: number,
  gap: number,
): TilePosition[] {
  if (canvasW < 1 || canvasH < 1 || textW <= 0 || textH <= 0 || gap < 0) {
    return [];
  }
  if (textW > canvasW || textH > canvasH) {
    return [
      {
        x: Math.max(0, Math.floor((canvasW - textW) / 2)),
        y: Math.max(0, Math.floor((canvasH - textH) / 2)),
      },
    ];
  }
  const stepX = textW + gap;
  const stepY = textH + gap;
  const xs: number[] = [];
  for (let x = 0; x + textW <= canvasW; x += stepX) xs.push(x);
  const ys: number[] = [];
  for (let y = 0; y + textH <= canvasH; y += stepY) ys.push(y);
  const out: TilePosition[] = [];
  for (const y of ys) for (const x of xs) out.push({ x, y });
  return out;
}

/**
 * 计算单点水印的落点（左上角坐标），按锚位 + 边距摆放并夹紧到画布内；
 * 文字比画布大时坐标夹为 0（尽量贴左/上）。
 */
export function computeSinglePosition(
  canvasW: number,
  canvasH: number,
  textW: number,
  textH: number,
  anchor: WatermarkAnchor,
  margin: number,
): TilePosition {
  let x: number;
  let y: number;
  switch (anchor) {
    case "top-left":
      x = margin;
      y = margin;
      break;
    case "top-right":
      x = canvasW - textW - margin;
      y = margin;
      break;
    case "bottom-left":
      x = margin;
      y = canvasH - textH - margin;
      break;
    case "bottom-right":
      x = canvasW - textW - margin;
      y = canvasH - textH - margin;
      break;
    default:
      x = (canvasW - textW) / 2;
      y = (canvasH - textH) / 2;
  }
  return {
    x: Math.max(0, Math.min(Math.round(x), Math.max(0, canvasW - textW))),
    y: Math.max(0, Math.min(Math.round(y), Math.max(0, canvasH - textH))),
  };
}

/** 生成下载文件名：`<原名去扩展名>-watermarked.png`（空名兜底 image） */
export function buildWatermarkedFilename(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName).trim();
  return `${base === "" ? "image" : base}-watermarked.png`;
}

/** 字节数人性化显示：B / KB（1 位小数）/ MB（2 位小数） */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "未知";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
