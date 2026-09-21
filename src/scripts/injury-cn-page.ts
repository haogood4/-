// 工伤赔偿计算器页面交互（外部脚本）
import { calculateInjury } from "../lib/calculators/injury-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputSalary = requireEl<HTMLInputElement>("#input-salary");
const inputLevel = requireEl<HTMLInputElement>("#input-level");
const selectResign = requireEl<HTMLSelectElement>("#input-resign");
const errorSalary = requireEl<HTMLParagraphElement>("#field-error-salary");
const errorLevel = requireEl<HTMLParagraphElement>("#field-error-level");
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

function clearAll() {
  clearFieldError(inputSalary, errorSalary);
  clearFieldError(inputLevel, errorLevel);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAll();

  const result = calculateInjury({
    salary: inputSalary.value,
    level: inputLevel.value,
    resign: selectResign.value,
  });
  if (!result.ok) {
    if (result.error.field === "salary")
      setFieldError(inputSalary, errorSalary, result.error.message);
    else setFieldError(inputLevel, errorLevel, result.error.message);
    goStaleIfComputed();
    return;
  }

  const resignText =
    selectResign.value === "true" ? "已解除/终止" : "保留劳动关系";
  resultCaption.textContent = `${result.level} 级伤残 · 月薪 ${inputSalary.value.trim()} 元 · ${resignText}`;
  const pensionText =
    result.monthlyPension !== undefined
      ? ` · 按月津贴 ¥${result.monthlyPension.toFixed(2)}`
      : "";
  resultMain.textContent = `合计 ¥${result.total.toFixed(2)}（一次性伤残补助金 ¥${result.disabilityAmount.toFixed(2)}${pensionText}）`;
  resultProcess.textContent = `${result.formulaText}；${result.note}`;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputSalary.value = "";
  inputLevel.value = "";
  selectResign.value = "false";
  clearAll();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorSalary.hidden && inputSalary.value.trim() !== "")
    clearFieldError(inputSalary, errorSalary);
  if (!errorLevel.hidden && inputLevel.value.trim() !== "")
    clearFieldError(inputLevel, errorLevel);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputSalary.addEventListener("input", onFieldInput);
inputLevel.addEventListener("input", onFieldInput);
selectResign.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
