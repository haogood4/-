// 二维码生成器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { generateQrCode, type QrLevel } from "../lib/calculators/qr-code-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#qr-text");
const levelSelect = requireEl<HTMLSelectElement>("#qr-level");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const canvas = requireEl<HTMLCanvasElement>("#qr-canvas");
const downloadBtn = requireEl<HTMLButtonElement>("#download-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn, downloadBtn],
});

/** 把模块矩阵画到 canvas：白底黑块 + 4 模块静区，仿源实现 renderQR */
function drawQr(grid: number[][], size: number): void {
  const q = 4; // 静区（quiet zone）宽度，模块数
  const scale = Math.max(3, Math.floor(280 / size));
  canvas.width = (size + 2 * q) * scale;
  canvas.height = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === 1) {
        ctx.fillRect((j + q) * scale, (i + q) * scale, scale, scale);
      }
    }
  }
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(textInput, errorText);

  const level = levelSelect.value as QrLevel;
  const result = generateQrCode({ text: textInput.value, level });
  if (!result.ok) {
    setFieldError(textInput, errorText, result.error.message);
    textInput.focus();
    goStaleIfComputed();
    return;
  }

  const { grid, size, version, mask } = result.value;
  drawQr(grid, size);
  lastText = textInput.value.trim();
  resultCaption.textContent = "二维码已生成";
  resultMain.textContent = `${size} × ${size} 模块`;
  resultProcess.textContent = `版本 ${version} · 纠错等级 ${level} · 掩码 ${mask}`;
  setState("computed");
}

function handleDownload(): void {
  if (canvas.width === 0) return;
  const a = document.createElement("a");
  a.download = "qrcode.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
}

function handleReset(): void {
  textInput.value = "";
  levelSelect.value = "L";
  clearFieldError(textInput, errorText);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && textInput.value.trim() !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
downloadBtn.addEventListener("click", handleDownload);
textInput.addEventListener("input", onFieldInput);
levelSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
