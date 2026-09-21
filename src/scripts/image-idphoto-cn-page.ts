// 在线证件照换底色页面交互：Canvas 像素级换底色（四角采样 + 色差阈值色键）
// 全部在浏览器本地完成；可测纯逻辑（校验/采样平均/色差判定）在
// src/lib/calculators/image-idphoto-cn.ts。
// 算法定位：简化色键，非 AI 抠图 —— 发丝等细节边缘可能残留底色，页面已注明。
import {
  averageRgb,
  BG_COLOR_RGB,
  buildIdPhotoFilename,
  formatBytes,
  isBackgroundPixel,
  validateBgColor,
  validateImageFile,
  validateTolerance,
  type RGB,
  type ValidatedImageFile,
} from "../lib/calculators/image-idphoto-cn";
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
const bgSelect = requireEl<HTMLSelectElement>("#bg-color");
const toleranceInput = requireEl<HTMLInputElement>("#tolerance");
const errTolerance = requireEl<HTMLParagraphElement>("#field-error-tolerance");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewOriginal = requireEl<HTMLImageElement>("#preview-original");
const previewPhoto = requireEl<HTMLImageElement>("#preview-idphoto");
const previewPhotoCap = requireEl<HTMLElement>("#preview-idphoto-caption");
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
let photoUrl = "";
let photoName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  originalUrl = "";
  photoUrl = "";
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

/**
 * 四角采样背景像素：每角取 S×S 区域的全部像素。
 * 简化色键算法的采样步骤（页面侧 ImageData 依赖，无法在 jsdom 单测）。
 */
function collectCornerSamples(
  data: Uint8ClampedArray,
  w: number,
  h: number,
): RGB[] {
  const S = 4; // 每角采样边长
  const corners: Array<[number, number]> = [
    [0, 0],
    [w - S, 0],
    [0, h - S],
    [w - S, h - S],
  ];
  const out: RGB[] = [];
  for (const [cx, cy] of corners) {
    for (let dy = 0; dy < S; dy++) {
      for (let dx = 0; dx < S; dx++) {
        const i = ((cy + dy) * w + (cx + dx)) * 4;
        out.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
  }
  return out;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(fileInput, errFile);
  clearFieldError(toleranceInput, errTolerance);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一张证件照");
    return;
  }
  const bg = validateBgColor(bgSelect.value);
  if (!bg.ok) {
    setFieldError(fileInput, errFile, bg.error.message);
    return;
  }
  const tolerance = validateTolerance(Number(toleranceInput.value));
  if (!tolerance.ok) {
    setFieldError(toleranceInput, errTolerance, tolerance.error.message);
    return;
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "处理中…";
  try {
    const img = await loadImage(source.file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const sampled = averageRgb(
      collectCornerSamples(data, canvas.width, canvas.height),
    );
    if (!sampled.ok) throw new Error(sampled.error.message);
    const target = BG_COLOR_RGB[bg.value];

    // 逐像素色键替换：判定为背景的像素改写为目标底色（alpha 保持不变）
    let replaced = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (
        isBackgroundPixel(
          { r: data[i], g: data[i + 1], b: data[i + 2] },
          sampled.value,
          tolerance.value,
        )
      ) {
        data[i] = target.r;
        data[i + 1] = target.g;
        data[i + 2] = target.b;
        replaced += 1;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) throw new Error("输出失败，请重试");
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(blob);
    photoName = buildIdPhotoFilename(source.name);
    previewPhoto.src = photoUrl;
    previewPhoto.alt = `换底色后预览：${photoName}`;
    previewPhotoCap.textContent = `${bg.value === "red" ? "红底" : bg.value === "blue" ? "蓝底" : "白底"} ${canvas.width}×${canvas.height}`;

    resultCaption.textContent = "换底色完成";
    resultMain.textContent = `${canvas.width}×${canvas.height} · 替换 ${((replaced / (canvas.width * canvas.height)) * 100).toFixed(1)}% 像素`;
    resultDetail.textContent = `四角采样 + 色差阈值 ${tolerance.value}（简化色键算法，非 AI 抠图，结果仅供参考）`;
    lastCopy = `${source.name}：已换为${bg.value === "red" ? "红" : bg.value === "blue" ? "蓝" : "白"}底（${canvas.width}×${canvas.height}，阈值 ${tolerance.value}）`;
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
    calcBtn.textContent = "开始换底色";
  }
}

function handleReset(): void {
  currentFile = null;
  revokeUrls();
  fileInput.value = "";
  fileInfo.textContent = "";
  fileInfo.hidden = true;
  previewOriginal.removeAttribute("src");
  previewPhoto.removeAttribute("src");
  previewPhotoCap.textContent = "换底色后预览";
  bgSelect.value = "blue";
  toleranceInput.value = "40";
  clearFieldError(fileInput, errFile);
  clearFieldError(toleranceInput, errTolerance);
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
bgSelect.addEventListener("change", goStaleIfComputed);
toleranceInput.addEventListener("input", () => {
  clearFieldError(toleranceInput, errTolerance);
  goStaleIfComputed();
});
downloadBtn.addEventListener("click", () => {
  if (!photoUrl) return;
  const a = document.createElement("a");
  a.href = photoUrl;
  a.download = photoName;
  a.click();
  flashButton(downloadBtn, "已开始下载");
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
setState("empty");
