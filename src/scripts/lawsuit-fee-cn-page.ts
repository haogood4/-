// 诉讼费计算器页面交互（外部脚本）
import {
  calculateLawsuitFee,
  LAWSUIT_FEE_CASE_TYPE_OPTIONS,
} from "../lib/calculators/lawsuit-fee-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const selectCase = requireEl<HTMLSelectElement>("#input-case");
const inputAmount = requireEl<HTMLInputElement>("#input-amount");
const errorAmount = requireEl<HTMLParagraphElement>("#field-error-amount");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const labels: Record<string, string> = Object.fromEntries(
  LAWSUIT_FEE_CASE_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
);

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(inputAmount, errorAmount);

  const result = calculateLawsuitFee({
    caseType: selectCase.value,
    amount: inputAmount.value,
  });
  if (!result.ok) {
    setFieldError(inputAmount, errorAmount, result.error.message);
    goStaleIfComputed();
    return;
  }

  const caseLabel = labels[selectCase.value] ?? selectCase.value;
  const amountText = inputAmount.value.trim() || "0";
  resultCaption.textContent = `${caseLabel} · 标的 ¥${amountText}`;
  resultMain.textContent = `案件受理费 ¥${result.fee.toFixed(2)}`;
  resultProcess.textContent = `${result.note}；${result.formula}`;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  selectCase.value = "property";
  inputAmount.value = "";
  clearFieldError(inputAmount, errorAmount);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorAmount.hidden && inputAmount.value.trim() !== "")
    clearFieldError(inputAmount, errorAmount);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputAmount.addEventListener("input", onFieldInput);
selectCase.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
