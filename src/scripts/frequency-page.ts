// 频率单位换算计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { convertFrequency, frequencyUnit } from "../lib/calculators/frequency";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputValue = requireEl<HTMLInputElement>("#input-value");
const selectFrom = requireEl<HTMLSelectElement>("#input-from");
const selectTo = requireEl<HTMLSelectElement>("#input-to");
const errorValue = requireEl<HTMLParagraphElement>("#field-error-value");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const unitText = (code: string): string => frequencyUnit(code)?.symbol ?? code;

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

const showFieldError = (message: string) =>
  setFieldError(inputValue, errorValue, message);
const clearFieldValueError = () => clearFieldError(inputValue, errorValue);

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldValueError();

  const result = convertFrequency({
    value: inputValue.value,
    from: selectFrom.value,
    to: selectTo.value,
  });
  if (!result.ok) {
    showFieldError(result.error.message);
    inputValue.focus();
    goStaleIfComputed();
    return;
  }

  const valueTrim = inputValue.value.trim();
  const fromUnit = unitText(selectFrom.value);
  const toUnit = unitText(selectTo.value);
  resultCaption.textContent = `${valueTrim} ${fromUnit} → ${toUnit}`;
  resultMain.textContent = `${result.convertedText} ${toUnit}`;
  resultProcess.textContent = result.processText;
  lastCopyText = `${resultCaption.textContent}：${resultMain.textContent}（${result.processText}）`;
  setState("computed");
}

function handleReset(): void {
  inputValue.value = "";
  selectFrom.value = "mhz";
  selectTo.value = "hz";
  clearFieldValueError();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorValue.hidden && inputValue.value.trim() !== "") {
    clearFieldValueError();
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputValue.addEventListener("input", onFieldInput);
selectFrom.addEventListener("change", goStaleIfComputed);
selectTo.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
