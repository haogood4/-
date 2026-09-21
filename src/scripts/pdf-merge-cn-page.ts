// PDF 合并页面交互 — 占位工具：完整功能开发中，暂提供接口契约。
// 引擎 mergePdfs 固定返回 NOT_IMPLEMENTED，页面据实展示「开发中」提示，
// 绝不伪造「合并成功」结果；所选 PDF 仅用于统计数量，不会被解析或上传。
import { mergePdfs } from "../lib/calculators/pdf-merge-cn";
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
const nameInput = requireEl<HTMLInputElement>("#output-name");
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
  if (count < 2) {
    setFieldError(
      fileInput,
      errFile,
      "请先选择至少 2 个 PDF 文件（仅统计数量，不会上传）",
    );
    return;
  }
  const outputName = nameInput.value.trim() || "merged";
  const result = mergePdfs({ count, outputName });
  const contract = result.ok
    ? "placeholder（占位保留）"
    : `${result.error.code}（${result.error.message}）`;
  resultCaption.textContent = "完整功能开发中";
  resultMain.textContent = "PDF 合并功能正在开发，暂提供接口契约";
  resultProcess.textContent = `契约调用 mergePdfs({ count: ${count}, outputName: "${outputName}" }) → ${contract}；文件内容未被读取`;
  lastCopy = `PDF 合并（开发中）：契约 mergePdfs({ count, outputName })，当前返回 NOT_IMPLEMENTED；本次选择的 ${count} 个文件未被解析或上传。`;
  setState("computed");
}

function handleReset(): void {
  fileInput.value = "";
  nameInput.value = "merged";
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
nameInput.addEventListener("input", onFieldChange);
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
setState("empty");
