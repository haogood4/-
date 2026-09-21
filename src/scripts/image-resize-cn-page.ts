// 在线图片改尺寸页面交互：图片解码、Canvas 等比/精确缩放与 toBlob 输出全部
// 在浏览器本地完成；可测纯逻辑（校验/尺寸计算/文件名）在
// src/lib/calculators/image-resize-cn.ts。与压缩（压体积）、转换（转格式）
// 工具差异化：本页以「指定目标宽/高」为核心。
import {
  buildResizedFilename,
  computeResizeTarget,
  formatBytes,
  validateDimension,
  validateImageFile,
  validateOutputFormat,
  type AllowedOutputMime,
  type ResizeMode,
  type ValidatedImageFile,
} from "../lib/calculators/image-resize-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
  flashButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const dropzone = requireEl<HTMLElement>("#dropzone");
const fileInput = requireEl<HTMLInputElement>("#file-input");
const errFile = requireEl<HTMLParagraphElement>("#field-error-file");
const fileInfo = requireEl<HTMLParagraphElement>("#file-info");
const modeSelect = requireEl<HTMLSelectElement>("#resize-mode");
const widthInput = requireEl<HTMLInputElement>("#target-width");
const errWidth = requireEl<HTMLParagraphElement>("#field-error-width");
const heightInput = requireEl<HTMLInputElement>("#target-height");
const errHeight = requireEl<HTMLParagraphElement>("#field-error-height");
const formatSelect = requireEl<HTMLSelectElement>("#output-format");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewOriginal = requireEl<HTMLImageElement>("#preview-original");
const previewResized = requireEl<HTMLImageElement>("#preview-resized");
const previewOriginalCap = requireEl<HTMLElement>("#preview-original-caption");
const previewResizedCap = requireEl<HTMLElement>("#preview-resized-caption");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const downloadBtn = requireEl<HTMLButtonElement>("#download-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn, downloadBtn],
});

let currentFile: (ValidatedImageFile & { file: File }) | null = null;
let originalUrl = "";
let resizedUrl = "";
let resizedName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (resizedUrl) URL.revokeObjectURL(resizedUrl);
  originalUrl = "";
  resizedUrl = "";
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
  previewOriginalCap.textContent = `原图 ${r.value.name}（${formatBytes(r.value.size)}）`;
  fileInfo.textContent = `已选择：${r.value.name} · ${formatBytes(r.value.size)}`;
  fileInfo.hidden = false;
  goStaleIfComputed();
}

/** FileReader 读为 data URL 并解码（仅页面侧，jsdom 不可测） */
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
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime);
  });
}

/** 按模式启用/禁用宽高输入（by-width 只填宽，by-height 只填高） */
function syncModeFields(): void {
  const mode: ResizeMode =
    modeSelect.value === "by-height"
      ? "by-height"
      : modeSelect.value === "exact"
        ? "exact"
        : "by-width";
  widthInput.disabled = mode === "by-height";
  heightInput.disabled = mode === "by-width";
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(fileInput, errFile);
  clearFieldError(widthInput, errWidth);
  clearFieldError(heightInput, errHeight);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一张图片文件");
    return;
  }
  const mode: ResizeMode =
    modeSelect.value === "by-height"
      ? "by-height"
      : modeSelect.value === "exact"
        ? "exact"
        : "by-width";
  const fmt = validateOutputFormat(formatSelect.value);
  if (!fmt.ok) {
    setFieldError(widthInput, errWidth, fmt.error.message);
    return;
  }
  const rawW = widthInput.value.trim() === "" ? null : Number(widthInput.value);
  const rawH =
    heightInput.value.trim() === "" ? null : Number(heightInput.value);
  if (mode !== "by-height" && rawW !== null) {
    const w = validateDimension(rawW, "宽度");
    if (!w.ok) {
      setFieldError(widthInput, errWidth, w.error.message);
      return;
    }
  }
  if (mode !== "by-width" && rawH !== null) {
    const h = validateDimension(rawH, "高度");
    if (!h.ok) {
      setFieldError(heightInput, errHeight, h.error.message);
      return;
    }
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "处理中…";
  try {
    const img = await loadImage(source.file);
    const target = computeResizeTarget(
      img.naturalWidth,
      img.naturalHeight,
      mode,
      rawW,
      rawH,
    );
    if (!target.ok) {
      setFieldError(widthInput, errWidth, target.error.message);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = target.value.width;
    canvas.height = target.value.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    if (fmt.value === "image/jpeg") {
      ctx.fillStyle = "#ffffff"; // JPEG 无透明通道，透明像素垫白底
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, fmt.value);
    if (!blob) throw new Error("输出失败，请更换输出格式重试");

    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    resizedUrl = URL.createObjectURL(blob);
    resizedName = buildResizedFilename(source.name, fmt.value);
    previewResized.src = resizedUrl;
    previewResized.alt = `改尺寸后预览：${resizedName}`;
    previewResizedCap.textContent = `处理后 ${canvas.width}×${canvas.height}（${formatBytes(blob.size)}）`;

    resultCaption.textContent = "改尺寸完成";
    resultMain.textContent = `${img.naturalWidth}×${img.naturalHeight} → ${canvas.width}×${canvas.height}`;
    resultDetail.textContent = `输出 ${resizedName} · ${formatBytes(blob.size)}（结果仅供参考）`;
    lastCopy = `${source.name}：${img.naturalWidth}×${img.naturalHeight} → ${canvas.width}×${canvas.height}，输出 ${resizedName}`;
    setState("computed");
  } catch (err) {
    setFieldError(
      fileInput,
      errFile,
      err instanceof Error ? err.message : "处理失败，请重试",
    );
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = "开始改尺寸";
  }
}

function handleReset(): void {
  currentFile = null;
  revokeUrls();
  fileInput.value = "";
  fileInfo.textContent = "";
  fileInfo.hidden = true;
  previewOriginal.removeAttribute("src");
  previewResized.removeAttribute("src");
  previewOriginalCap.textContent = "原图预览";
  previewResizedCap.textContent = "处理后预览";
  modeSelect.value = "by-width";
  widthInput.value = "800";
  heightInput.value = "600";
  formatSelect.value = "image/jpeg";
  clearFieldError(fileInput, errFile);
  clearFieldError(widthInput, errWidth);
  clearFieldError(heightInput, errHeight);
  syncModeFields();
  lastCopy = "";
  setState("empty");
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
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
modeSelect.addEventListener("change", () => {
  syncModeFields();
  goStaleIfComputed();
});
widthInput.addEventListener("input", () => {
  clearFieldError(widthInput, errWidth);
  goStaleIfComputed();
});
heightInput.addEventListener("input", () => {
  clearFieldError(heightInput, errHeight);
  goStaleIfComputed();
});
formatSelect.addEventListener("change", goStaleIfComputed);
downloadBtn.addEventListener("click", () => {
  if (!resizedUrl) return;
  const a = document.createElement("a");
  a.href = resizedUrl;
  a.download = resizedName;
  a.click();
  flashButton(downloadBtn, "已开始下载");
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
syncModeFields();
setState("empty");
