// 在线 GIF 解析页面交互（降级方案）：解析帧数与尺寸 + 导出首帧 PNG。
// 完整「逐帧导出 PNG / GIF 重新编码」需 LZW 编解码依赖，超出每页 JS 预算，
// UI 与结果区均已诚实注明「完整功能开发中」；帧数/尺寸契约由纯逻辑引擎
// src/lib/calculators/image-gif-cn.ts 提供（字节扫描，可单测）。
import {
  buildFrameFilename,
  formatBytes,
  parseGifInfo,
  validateGifFile,
  type ValidatedGifFile,
} from "../lib/calculators/image-gif-cn";
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
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const previewImg = requireEl<HTMLImageElement>("#preview-gif");
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

let currentFile: (ValidatedGifFile & { file: File }) | null = null;
let previewUrl = "";
let frameUrl = "";
let frameName = "";
let lastCopy = "";

function revokeUrls(): void {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  if (frameUrl) URL.revokeObjectURL(frameUrl);
  previewUrl = "";
  frameUrl = "";
}

function acceptFile(file: File | undefined): void {
  clearFieldError(fileInput, errFile);
  const r = validateGifFile(
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
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  previewImg.src = previewUrl;
  previewImg.alt = `GIF 预览（浏览器显示首帧）：${r.value.name}`;
  fileInfo.textContent = `已选择：${r.value.name} · ${formatBytes(r.value.size)}`;
  fileInfo.hidden = false;
  goStaleIfComputed();
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(fileInput, errFile);
  const source = currentFile;
  if (!source) {
    setFieldError(fileInput, errFile, "请先选择一个 GIF 文件");
    return;
  }
  calcBtn.disabled = true;
  calcBtn.textContent = "解析中…";
  try {
    const buf = await source.file.arrayBuffer();
    const info = parseGifInfo(new Uint8Array(buf));
    if (!info.ok) {
      setFieldError(fileInput, errFile, info.error.message);
      goStaleIfComputed();
      return;
    }
    // 导出首帧 PNG：浏览器 <img>/drawImage 原生只渲染 GIF 首帧，
    // 逐帧导出（需 LZW 解码）与 GIF 编码均属完整功能，开发中。
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("GIF 解码失败"));
      image.src = previewUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = info.value.width;
    canvas.height = info.value.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持 Canvas");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) throw new Error("首帧导出失败，请重试");
    if (frameUrl) URL.revokeObjectURL(frameUrl);
    frameUrl = URL.createObjectURL(blob);
    const name = buildFrameFilename(1);
    frameName = name.ok ? name.value : "frame-01.png";

    resultCaption.textContent = "解析完成";
    resultMain.textContent = `${info.value.width}×${info.value.height} · 共 ${info.value.frames} 帧`;
    resultDetail.textContent = `已导出首帧 PNG（${frameName}）；逐帧导出与 GIF 编码需较大依赖，完整功能开发中（结果仅供参考）`;
    lastCopy = `${source.name}：GIF 尺寸 ${info.value.width}×${info.value.height}，共 ${info.value.frames} 帧`;
    setState("computed");
  } catch (err) {
    setFieldError(
      fileInput,
      errFile,
      err instanceof Error ? err.message : "解析失败，请重试",
    );
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = "解析 GIF";
  }
}

function handleReset(): void {
  currentFile = null;
  revokeUrls();
  fileInput.value = "";
  fileInfo.textContent = "";
  fileInfo.hidden = true;
  previewImg.removeAttribute("src");
  clearFieldError(fileInput, errFile);
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
downloadBtn.addEventListener("click", () => {
  if (!frameUrl) return;
  const a = document.createElement("a");
  a.href = frameUrl;
  a.download = frameName;
  a.click();
  flashButton(downloadBtn, "已开始下载");
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
setState("empty");
