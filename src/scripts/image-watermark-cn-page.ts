// 在线图片加水印页面交互：Canvas 文字水印（平铺/单点、字号/透明度/旋转可调）
// 全部在浏览器本地完成；可测纯逻辑（校验/落点计算/字体规格）在
// src/lib/calculators/image-watermark-cn.ts。
import {
  buildFontSpec,
  buildWatermarkedFilename,
  computeSinglePosition,
  computeTilePositions,
  formatBytes,
  toRadians,
  validateAnchor,
  validateColor,
  validateFontSize,
  validateGap,
  validateImageFile,
  validateLayout,
  validateMargin,
  validateOpacity,
  validateRotation,
  validateText,
  type ValidatedImageFile,
  type WatermarkColor,
} from "../lib/calculators/image-watermark-cn";
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
const textInput = requireEl<HTMLInputElement>("#watermark-text");
const errText = requireEl<HTMLParagraphElement>("#field-error-text");
const layoutSelect = requireEl<HTMLSelectElement>("#watermark-layout");
const anchorSelect = requireEl<HTMLSelectElement>("#watermark-anchor");
const marginInput = requireEl<HTMLInputElement>("#watermark-margin");
const errMargin = requireEl<HTMLParagraphElement>("#field-error-margin");
const gapInput = requireEl<HTMLInputElement>("#watermark-gap");
const errGap = requireEl<HTMLParagraphElement>("#field-error-gap");
const sizeInput = requireEl<HTMLInputElement>("#font-size");
const errSize = requireEl<HTMLParagraphElement>("#field-error-size");
const opacityInput = requireEl<HTMLInputElement>("#opacity");
const errOpacity = requireEl<HTMLParagraphElement>("#field-error-opacity");
const rotationInput = requireEl<HTMLInputElement>("#rotation");
const errRotation = requireEl<HTMLParagraphElement>("#field-error-rotation");
const colorSelect = requireEl<HTMLSelectElement>("#watermark-color");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewOriginal = requireEl<HTMLImageElement>("#preview-original");
const watermarkCanvas = requireEl<HTMLCanvasElement>("#watermark-canvas");
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
let watermarkedUrl = "";
let watermarkedName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
  originalUrl = "";
  watermarkedUrl = "";
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
  fileInfo.textContent = `已选择：${r.value.name} · ${formatBytes(r.value.size)}`;
  fileInfo.hidden = false;
  goStaleIfComputed();
}

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

/** 按布局启用/禁用平铺间距与单点边距/锚位 */
function syncLayoutFields(): void {
  const isTile = layoutSelect.value === "tile";
  gapInput.disabled = !isTile;
  anchorSelect.disabled = isTile;
  marginInput.disabled = isTile;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  for (const [input, err] of [
    [fileInput, errFile],
    [textInput, errText],
    [sizeInput, errSize],
    [opacityInput, errOpacity],
    [rotationInput, errRotation],
  ] as const) {
    clearFieldError(input, err);
  }
  clearFieldError(gapInput, errGap);
  clearFieldError(marginInput, errMargin);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一张图片文件");
    return;
  }
  const text = validateText(textInput.value);
  if (!text.ok) {
    setFieldError(textInput, errText, text.error.message);
    return;
  }
  const layout = validateLayout(layoutSelect.value);
  if (!layout.ok) {
    setFieldError(fileInput, errFile, layout.error.message);
    return;
  }
  const fontSize = validateFontSize(Number(sizeInput.value));
  if (!fontSize.ok) {
    setFieldError(sizeInput, errSize, fontSize.error.message);
    return;
  }
  const opacity = validateOpacity(Number(opacityInput.value));
  if (!opacity.ok) {
    setFieldError(opacityInput, errOpacity, opacity.error.message);
    return;
  }
  const rotation = validateRotation(Number(rotationInput.value));
  if (!rotation.ok) {
    setFieldError(rotationInput, errRotation, rotation.error.message);
    return;
  }
  const color = validateColor(colorSelect.value);
  if (!color.ok) {
    setFieldError(fileInput, errFile, color.error.message);
    return;
  }
  let gapPx = 60;
  if (layout.value === "tile") {
    const gap = validateGap(Number(gapInput.value));
    if (!gap.ok) {
      setFieldError(gapInput, errGap, gap.error.message);
      return;
    }
    gapPx = gap.value;
  }
  const anchor = validateAnchor(anchorSelect.value);
  if (!anchor.ok) {
    setFieldError(fileInput, errFile, anchor.error.message);
    return;
  }
  let marginPx = 24;
  if (layout.value === "single") {
    const margin = validateMargin(Number(marginInput.value));
    if (!margin.ok) {
      setFieldError(marginInput, errMargin, margin.error.message);
      return;
    }
    marginPx = margin.value;
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "处理中…";
  try {
    const img = await loadImage(source.file);
    const canvas = watermarkCanvas;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    ctx.drawImage(img, 0, 0);
    ctx.font = buildFontSpec(fontSize.value);
    ctx.fillStyle = color.value as WatermarkColor;
    ctx.globalAlpha = opacity.value;
    ctx.textBaseline = "top";
    const metrics = ctx.measureText(text.value);
    const textW = Math.ceil(metrics.width);
    const textH = fontSize.value; // 近似取字号作为行高，落点计算足够
    const positions =
      layout.value === "tile"
        ? computeTilePositions(canvas.width, canvas.height, textW, textH, gapPx)
        : [
            computeSinglePosition(
              canvas.width,
              canvas.height,
              textW,
              textH,
              anchor.value,
              marginPx,
            ),
          ];
    const rad = toRadians(rotation.value);
    for (const p of positions) {
      ctx.save();
      ctx.translate(p.x + textW / 2, p.y + textH / 2);
      if (rad !== 0) ctx.rotate(rad);
      ctx.fillText(text.value, -textW / 2, -textH / 2);
      ctx.restore();
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) throw new Error("输出失败，请重试");
    if (watermarkedUrl) URL.revokeObjectURL(watermarkedUrl);
    watermarkedUrl = URL.createObjectURL(blob);
    watermarkedName = buildWatermarkedFilename(source.name);

    resultCaption.textContent = "水印添加完成";
    resultMain.textContent = `${canvas.width}×${canvas.height} · ${positions.length} 处水印`;
    resultDetail.textContent = `「${text.value}」${layout.value === "tile" ? "平铺" : "单点"} · ${fontSize.value}px / 透明度 ${opacity.value} / ${rotation.value}°（结果仅供参考）`;
    lastCopy = `${source.name}：已添加文字水印「${text.value}」（${positions.length} 处，${canvas.width}×${canvas.height}）`;
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
    calcBtn.textContent = "添加水印";
  }
}

function handleReset(): void {
  currentFile = null;
  revokeUrls();
  fileInput.value = "";
  fileInfo.textContent = "";
  fileInfo.hidden = true;
  previewOriginal.removeAttribute("src");
  watermarkCanvas.width = 0;
  watermarkCanvas.height = 0;
  textInput.value = "";
  layoutSelect.value = "tile";
  anchorSelect.value = "bottom-right";
  marginInput.value = "24";
  gapInput.value = "60";
  sizeInput.value = "36";
  opacityInput.value = "0.3";
  rotationInput.value = "-30";
  colorSelect.value = "#ffffff";
  clearFieldError(fileInput, errFile);
  clearFieldError(textInput, errText);
  clearFieldError(sizeInput, errSize);
  clearFieldError(opacityInput, errOpacity);
  clearFieldError(rotationInput, errRotation);
  clearFieldError(gapInput, errGap);
  clearFieldError(marginInput, errMargin);
  syncLayoutFields();
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
textInput.addEventListener("input", () => {
  clearFieldError(textInput, errText);
  goStaleIfComputed();
});
layoutSelect.addEventListener("change", () => {
  syncLayoutFields();
  goStaleIfComputed();
});
for (const el of [
  sizeInput,
  opacityInput,
  rotationInput,
  gapInput,
  marginInput,
]) {
  el.addEventListener("input", goStaleIfComputed);
}
anchorSelect.addEventListener("change", goStaleIfComputed);
colorSelect.addEventListener("change", goStaleIfComputed);
downloadBtn.addEventListener("click", () => {
  if (!watermarkedUrl) return;
  const a = document.createElement("a");
  a.href = watermarkedUrl;
  a.download = watermarkedName;
  a.click();
  flashButton(downloadBtn, "已开始下载");
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
syncLayoutFields();
setState("empty");
