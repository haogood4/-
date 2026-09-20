// 时间戳换算计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import {
  convertTimestamp,
  type TsDirection,
  type TsUnit,
} from "../lib/calculators/timestamp";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const selectDirection = requireEl<HTMLSelectElement>("#direction");
const selectUnit = requireEl<HTMLSelectElement>("#unit");
const inputRaw = requireEl<HTMLInputElement>("#input-raw");
const hint = requireEl<HTMLParagraphElement>("#input-hint");
const errorRaw = requireEl<HTMLParagraphElement>("#field-error-raw");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const HINTS: Record<TsDirection, string> = {
  "to-date": "例如：1700000000（秒）或 1700000000000（毫秒）",
  "to-timestamp": "例如：2025-01-01 00:00（视为 UTC+8）",
};

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

function applyMeta(): void {
  const d = selectDirection.value as TsDirection;
  hint.textContent = HINTS[d] ?? HINTS["to-date"];
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldRawError();

  const direction = selectDirection.value as TsDirection;
  const unit = selectUnit.value as TsUnit;
  const result = convertTimestamp(inputRaw.value, unit, direction);
  if (!result.ok) {
    showFieldError(result.error.message);
    inputRaw.focus();
    goStaleIfComputed();
    return;
  }

  const unitLabel = unit === "s" ? "秒" : "毫秒";
  const caption =
    direction === "to-date"
      ? `${inputRaw.value.trim()} ${unitLabel} → UTC+8 时间`
      : `${inputRaw.value.trim()}（UTC+8） → ${unitLabel}`;
  resultCaption.textContent = caption;
  resultMain.textContent = result.formatted;
  resultProcess.textContent = result.processText;
  lastCopyText = `${caption}：${resultMain.textContent}（${result.processText}）`;
  setState("computed");
}

function handleReset(): void {
  inputRaw.value = "";
  selectDirection.value = "to-date";
  selectUnit.value = "s";
  applyMeta();
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
selectDirection.addEventListener("change", () => {
  applyMeta();
  goStaleIfComputed();
});
selectUnit.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

applyMeta();
setState("empty");
