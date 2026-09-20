// 平均数计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { calculateAverage } from "../lib/calculators/average";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputRaw = requireEl<HTMLTextAreaElement>("#input-raw");
const errorRaw = requireEl<HTMLParagraphElement>("#field-error-raw");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

const showFieldError = (message: string) =>
  setFieldError(inputRaw, errorRaw, message);
const clearFieldRawError = () => clearFieldError(inputRaw, errorRaw);

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldRawError();

  const result = calculateAverage(inputRaw.value);
  if (!result.ok) {
    showFieldError(result.error.message);
    inputRaw.focus();
    goStaleIfComputed();
    return;
  }

  resultCaption.textContent = `共 ${result.count} 个数字`;
  resultMain.textContent = `平均 ${result.meanText}`;
  resultProcess.textContent = `总和 ${result.sumText} ÷ ${result.count} = ${result.meanText}`;
  lastCopyText = `${resultCaption.textContent}：${resultMain.textContent}（${resultProcess.textContent}）`;
  setState("computed");
}

function handleReset(): void {
  inputRaw.value = "";
  clearFieldRawError();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorRaw.hidden && inputRaw.value.trim() !== "") {
    clearFieldRawError();
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputRaw.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
