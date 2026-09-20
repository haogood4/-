// 在线图片压缩页面交互：Canvas 重绘 + toBlob 压缩全部在浏览器本地完成。
// 可测纯逻辑（校验/缩放计算/文件名）在 src/lib/calculators/image-compress-cn.ts。
import {
  buildCompressedFilename,
  computeSavings,
  computeTargetDimensions,
  formatBytes,
  validateImageFile,
  validateMaxEdge,
  validateOutputFormat,
  validateQuality,
  type AllowedOutputMime,
  type ValidatedImageFile,
} from "../lib/calculators/image-compress-cn";
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
const qualityRange = requireEl<HTMLInputElement>("#quality-range");
const qualityNum = requireEl<HTMLInputElement>("#quality-num");
const errQuality = requireEl<HTMLParagraphElement>("#field-error-quality");
const maxEdgeSelect = requireEl<HTMLSelectElement>("#max-edge");
const outputSelect = requireEl<HTMLSelectElement>("#output-format");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewOriginal = requireEl<HTMLImageElement>("#preview-original");
const previewCompressed = requireEl<HTMLImageElement>("#preview-compressed");
const previewOriginalCap = requireEl<HTMLElement>("#preview-original-caption");
const previewCompressedCap = requireEl<HTMLElement>(
  "#preview-compressed-caption",
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

/** 当前选中的图片（校验通过后填充） */
let currentFile: (ValidatedImageFile & { file: File }) | null = null;
/** 预览/下载用 object URL，替换或重置时回收 */
let originalUrl = "";
let compressedUrl = "";
let compressedName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  originalUrl = "";
  compressedUrl = "";
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

async function compress(): Promise<void> {
  clearFieldError(fileInput, errFile);
  clearFieldError(qualityNum, errQuality);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一张图片文件");
    return;
  }
  const q = validateQuality(Number(qualityNum.value));
  if (!q.ok) {
    setFieldError(qualityNum, errQuality, q.error.message);
    return;
  }
  const edge = validateMaxEdge(maxEdgeSelect.value);
  if (!edge.ok) {
    setFieldError(qualityNum, errQuality, edge.error.message);
    return;
  }
  const fmt = validateOutputFormat(outputSelect.value);
  if (!fmt.ok) {
    setFieldError(qualityNum, errQuality, fmt.error.message);
    return;
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "压缩中…";
  try {
    const img = await loadImage(source.file);
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const target = computeTargetDimensions(srcW, srcH, edge.value);
    const canvas = document.createElement("canvas");
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    if (fmt.value === "image/jpeg") {
      ctx.fillStyle = "#ffffff"; // JPEG 无透明通道，透明像素垫白底
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, target.width, target.height);
    const blob = await canvasToBlob(canvas, fmt.value, q.value);
    if (!blob) throw new Error("压缩失败，请更换输出格式重试");

    const savings = computeSavings(source.size, blob.size);
    if (!savings.ok) throw new Error(savings.error.message);

    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    compressedUrl = URL.createObjectURL(blob);
    compressedName = buildCompressedFilename(source.name, fmt.value);
    previewCompressed.src = compressedUrl;
    previewCompressed.alt = `压缩后预览：${compressedName}`;
    previewCompressedCap.textContent = `压缩后 ${compressedName}（${formatBytes(blob.size)}）`;

    const dims = `${srcW}×${srcH}${target.scaled ? ` → ${target.width}×${target.height}` : ""}`;
    resultCaption.textContent = "压缩完成";
    resultMain.textContent = `${formatBytes(source.size)} → ${formatBytes(blob.size)}`;
    resultDetail.textContent = savings.value.grew
      ? `${dims} · 压缩后反而变大，建议提高质量或改用 WebP（结果仅供参考）`
      : `${dims} · 节省 ${savings.value.savingsPercent}%（结果仅供参考）`;
    lastCopy = `${source.name}：${formatBytes(source.size)} → ${formatBytes(blob.size)}，节省 ${savings.value.savingsPercent}%`;
    setState("computed");
  } catch (err) {
    setFieldError(
      fileInput,
      errFile,
      err instanceof Error ? err.message : "压缩失败，请重试",
    );
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = "开始压缩";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void compress();
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
  qualityNum.value = qualityRange.value;
  clearFieldError(qualityNum, errQuality);
  goStaleIfComputed();
});
qualityNum.addEventListener("input", () => {
  if (qualityRange.value !== qualityNum.value) {
    const n = Number(qualityNum.value);
    if (Number.isFinite(n) && n >= 0.1 && n <= 1)
      qualityRange.value = qualityNum.value;
  }
  clearFieldError(qualityNum, errQuality);
  goStaleIfComputed();
});
maxEdgeSelect.addEventListener("change", goStaleIfComputed);
outputSelect.addEventListener("change", goStaleIfComputed);

downloadBtn.addEventListener("click", () => {
  if (!compressedUrl) return;
  const a = document.createElement("a");
  a.href = compressedUrl;
  a.download = compressedName;
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
  previewCompressed.removeAttribute("src");
  previewOriginalCap.textContent = "原图预览";
  previewCompressedCap.textContent = "压缩后预览";
  qualityRange.value = "0.8";
  qualityNum.value = "0.8";
  maxEdgeSelect.value = "0";
  outputSelect.value = "image/jpeg";
  clearFieldError(fileInput, errFile);
  clearFieldError(qualityNum, errQuality);
  lastCopy = "";
  setState("empty");
});

bindCopyButton(copyBtn, () => lastCopy);

setState("empty");
