// 在线图片格式转换页面交互：FileReader 解码 + Canvas 重绘 + toBlob 编码全部在浏览器本地完成。
// 可测纯逻辑（校验/文件名/透明提示判定）在 src/lib/calculators/image-convert-cn.ts。
import {
  buildConvertedFilename,
  formatBytes,
  needsWhiteMatte,
  validateImageFile,
  validateOutputFormat,
  validateQuality,
  type AllowedOutputMime,
  type ValidatedImageFile,
} from "../lib/calculators/image-convert-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  flashButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const dropzone = requireEl<HTMLElement>("#dropzone");
const fileInput = requireEl<HTMLInputElement>("#file-input");
const errFile = requireEl<HTMLParagraphElement>("#field-error-file");
const fileInfo = requireEl<HTMLParagraphElement>("#file-info");
const outputSelect = requireEl<HTMLSelectElement>("#output-format");
const qualityRange = requireEl<HTMLInputElement>("#quality-range");
const qualityValue = requireEl<HTMLElement>("#quality-value");
const errQuality = requireEl<HTMLParagraphElement>("#field-error-quality");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewOriginal = requireEl<HTMLImageElement>("#preview-original");
const previewConverted = requireEl<HTMLImageElement>("#preview-converted");
const previewOriginalCap = requireEl<HTMLElement>("#preview-original-caption");
const previewConvertedCap = requireEl<HTMLElement>(
  "#preview-converted-caption",
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const downloadBtn = requireEl<HTMLButtonElement>("#download-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, downloadBtn],
});

const MIME_LABEL: Record<AllowedOutputMime, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

/** 当前选中的图片（校验通过后填充） */
let currentFile: (ValidatedImageFile & { file: File }) | null = null;
/** 预览/下载用 object URL，替换或重置时回收 */
let originalUrl = "";
let convertedUrl = "";
let convertedName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (convertedUrl) URL.revokeObjectURL(convertedUrl);
  originalUrl = "";
  convertedUrl = "";
}

function acceptFile(file: File | undefined): void {
  clearFieldError(fileInput, errFile);
  const r = validateImageFile(
    file ? { name: file.name, type: file.type, size: file.size } : null,
  );
  if (!r.ok) {
    currentFile = null;
    fileInfo.textContent = "";
    fileInfo.hidden = true;
    setFieldError(fileInput, errFile, r.error.message);
    return;
  }
  if (!file) return;
  currentFile = { ...r.value, file };
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  originalUrl = URL.createObjectURL(file);
  previewOriginal.src = originalUrl;
  previewOriginal.alt = `原图预览：${r.value.name}`;
  previewOriginalCap.textContent = `原图 ${r.value.name}（${MIME_LABEL[r.value.mime]} · ${formatBytes(r.value.size)}）`;
  fileInfo.textContent = `已选择：${r.value.name} · ${formatBytes(r.value.size)}`;
  fileInfo.hidden = false;
  goStaleIfComputed();
}

/** 用 FileReader 读为 data URL 并解码为 Image（仅页面侧，无法单测） */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("图片解码失败"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: AllowedOutputMime,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

async function convert(): Promise<void> {
  clearFieldError(fileInput, errFile);
  clearFieldError(qualityRange, errQuality);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一张图片文件");
    return;
  }
  const fmt = validateOutputFormat(outputSelect.value);
  if (!fmt.ok) {
    setFieldError(fileInput, errFile, fmt.error.message);
    return;
  }
  const q = validateQuality(Number(qualityRange.value));
  if (!q.ok) {
    setFieldError(qualityRange, errQuality, q.error.message);
    return;
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "转换中…";
  try {
    const img = await loadImage(source.file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    const matte = needsWhiteMatte(source.mime, fmt.value);
    if (matte) {
      ctx.fillStyle = "#ffffff"; // JPEG 无透明通道，透明像素垫白底
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const blob = await canvasToBlob(canvas, fmt.value, q.value);
    if (!blob) throw new Error("转换失败，请更换目标格式重试");

    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    convertedUrl = URL.createObjectURL(blob);
    convertedName = buildConvertedFilename(source.name, fmt.value);
    previewConverted.src = convertedUrl;
    previewConverted.alt = `转换后预览：${convertedName}`;
    previewConvertedCap.textContent = `转换后 ${convertedName}（${formatBytes(blob.size)}）`;

    const dims = `${img.naturalWidth}×${img.naturalHeight}`;
    const flow = `${MIME_LABEL[source.mime]} → ${MIME_LABEL[fmt.value]}`;
    resultCaption.textContent = "转换完成";
    resultMain.textContent = `${formatBytes(source.size)} → ${formatBytes(blob.size)}`;
    resultDetail.textContent = matte
      ? `${dims} · ${flow} · 透明区域已垫白底（结果仅供参考）`
      : `${dims} · ${flow} · 已保留透明通道（结果仅供参考）`;
    lastCopy = `${source.name} → ${convertedName}：${flow}，${formatBytes(source.size)} → ${formatBytes(blob.size)}`;
    setState("computed");
  } catch (err) {
    setFieldError(
      fileInput,
      errFile,
      err instanceof Error ? err.message : "转换失败，请重试",
    );
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = "开始转换";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void convert();
});

fileInput.addEventListener("change", () => {
  acceptFile(fileInput.files?.[0]);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dropzone--active");
});
dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dropzone--active");
});
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dropzone--active");
  acceptFile(event.dataTransfer?.files?.[0]);
});

qualityRange.addEventListener("input", () => {
  qualityValue.textContent = qualityRange.value;
  clearFieldError(qualityRange, errQuality);
  goStaleIfComputed();
});
outputSelect.addEventListener("change", () => {
  clearFieldError(fileInput, errFile);
  goStaleIfComputed();
});

downloadBtn.addEventListener("click", () => {
  if (!convertedUrl) return;
  const a = document.createElement("a");
  a.href = convertedUrl;
  a.download = convertedName;
  a.click();
  flashButton(downloadBtn, "已开始下载");
});

resetBtn.addEventListener("click", () => {
  currentFile = null;
  revokeUrls();
  fileInput.value = "";
  fileInfo.textContent = "";
  fileInfo.hidden = true;
  previewOriginal.removeAttribute("src");
  previewConverted.removeAttribute("src");
  previewOriginalCap.textContent = "原图预览";
  previewConvertedCap.textContent = "转换后预览";
  outputSelect.value = "image/jpeg";
  qualityRange.value = "0.92";
  qualityValue.textContent = "0.92";
  clearFieldError(fileInput, errFile);
  clearFieldError(qualityRange, errQuality);
  lastCopy = "";
  setState("empty");
});

bindCopyButton(copyBtn, () => lastCopy);

setState("empty");
