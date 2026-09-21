// PDF 加水印页面交互 — 占位工具：完整功能开发中，暂提供接口契约。
// 引擎 watermarkPdf 固定返回 NOT_IMPLEMENTED，页面据实展示「开发中」提示，
// 绝不伪造「加水印成功」结果；所选 PDF 不会被解析或上传。
import { watermarkPdf } from "../lib/calculators/pdf-watermark-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const fileInput = requireEl<HTMLInputElement>("#pdf-input");
const errFile = requireEl<HTMLParagraphElement>("#field-error-file");
const textInput = requireEl<HTMLInputElement>("#watermark-text");
const errText = requireEl<HTMLParagraphElement>("#field-error-text");
const opacityInput = requireEl<HTMLInputElement>("#watermark-opacity");
const errOpacity = requireEl<HTMLParagraphElement>("#field-error-opacity");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

let lastCopy = "";

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(fileInput, errFile);
  clearFieldError(textInput, errText);
  clearFieldError(opacityInput, errOpacity);
  const count = fileInput.files?.length ?? 0;
  if (count < 1) {
    setFieldError(fileInput, errFile, "请先选择 1 个 PDF 文件（不会上传）");
    return;
  }
  const text = textInput.value.trim();
  if (!text) {
    setFieldError(textInput, errText, "请填写水印文字");
    return;
  }
  const opacity = Number(opacityInput.value);
  if (!Number.isFinite(opacity) || opacity <= 0 || opacity > 1) {
    setFieldError(
      opacityInput,
      errOpacity,
      "不透明度须在 0 ~ 1 之间（不含 0）",
    );
    return;
  }
  const result = watermarkPdf({ text, opacity });
  const contract = result.ok
    ? "placeholder（占位保留）"
    : `${result.error.code}（${result.error.message}）`;
  resultCaption.textContent = "完整功能开发中";
  resultMain.textContent = "PDF 加水印功能正在开发，暂提供接口契约";
  resultProcess.textContent = `契约调用 watermarkPdf({ text: ${JSON.stringify(text)}, opacity: ${opacity} }) → ${contract}；文件内容未被读取`;
  lastCopy = `PDF 加水印（开发中）：契约 watermarkPdf({ text, opacity })，水印「${text}」，当前返回 NOT_IMPLEMENTED；所选文件未被解析或上传。`;
  setState("computed");
}

function handleReset(): void {
  fileInput.value = "";
  textInput.value = "";
  opacityInput.value = "0.3";
  clearFieldError(fileInput, errFile);
  clearFieldError(textInput, errText);
  clearFieldError(opacityInput, errOpacity);
  lastCopy = "";
  setState("empty");
}

function onFieldChange(): void {
  if (!errFile.hidden) clearFieldError(fileInput, errFile);
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
fileInput.addEventListener("change", onFieldChange);
textInput.addEventListener("input", () => {
  clearFieldError(textInput, errText);
  goStaleIfComputed();
});
opacityInput.addEventListener("input", () => {
  clearFieldError(opacityInput, errOpacity);
  goStaleIfComputed();
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
setState("empty");
