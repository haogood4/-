// PDF 压缩页面交互 — 占位工具：完整功能开发中，暂提供接口契约。
// 引擎 compressPdf 固定返回 NOT_IMPLEMENTED，页面据实展示「开发中」提示，
// 绝不伪造「压缩成功」结果；所选 PDF 不会被解析或上传。
import { compressPdf } from "../lib/calculators/pdf-compress-cn";
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
const levelSelect = requireEl<HTMLSelectElement>("#compress-level");
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
  const count = fileInput.files?.length ?? 0;
  if (count < 1) {
    setFieldError(fileInput, errFile, "请先选择 1 个 PDF 文件（不会上传）");
    return;
  }
  const level =
    levelSelect.value === "high"
      ? "high"
      : levelSelect.value === "medium"
        ? "medium"
        : "low";
  const result = compressPdf({ level });
  const contract = result.ok
    ? "placeholder（占位保留）"
    : `${result.error.code}（${result.error.message}）`;
  resultCaption.textContent = "完整功能开发中";
  resultMain.textContent = "PDF 压缩功能正在开发，暂提供接口契约";
  resultProcess.textContent = `契约调用 compressPdf({ level: "${level}" }) → ${contract}；文件内容未被读取`;
  lastCopy = `PDF 压缩（开发中）：契约 compressPdf({ level })，档位 ${level}，当前返回 NOT_IMPLEMENTED；所选文件未被解析或上传。`;
  setState("computed");
}

function handleReset(): void {
  fileInput.value = "";
  levelSelect.value = "medium";
  clearFieldError(fileInput, errFile);
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
levelSelect.addEventListener("change", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
setState("empty");
