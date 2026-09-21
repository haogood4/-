// 经济补偿金计算器页面交互（外部脚本）
import {
  calculateCompensation,
  COMPENSATION_TYPE_OPTIONS,
} from "../lib/calculators/compensation-cn";
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
const inputYears = requireEl<HTMLInputElement>("#input-years");
const selectType = requireEl<HTMLSelectElement>("#input-type");
const inputRegion = requireEl<HTMLInputElement>("#input-region-avg");
const errorSalary = requireEl<HTMLParagraphElement>("#field-error-salary");
const errorYears = requireEl<HTMLParagraphElement>("#field-error-years");
const errorRegion = requireEl<HTMLParagraphElement>("#field-error-region");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const labels: Record<string, string> = Object.fromEntries(
  COMPENSATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
);

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function showSalaryErr(m: string) {
  setFieldError(inputSalary, errorSalary, m);
}
function showYearsErr(m: string) {
  setFieldError(inputYears, errorYears, m);
}
function showRegionErr(m: string) {
  setFieldError(inputRegion, errorRegion, m);
}
function clearAll() {
  clearFieldError(inputSalary, errorSalary);
  clearFieldError(inputYears, errorYears);
  clearFieldError(inputRegion, errorRegion);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAll();

  const result = calculateCompensation({
    salary: inputSalary.value,
    years: inputYears.value,
    type: selectType.value,
    regionAvgSalary: inputRegion.value,
  });
  if (!result.ok) {
    const msg = result.error.message;
    if (result.error.field === "salary") showSalaryErr(msg);
    else if (result.error.field === "years") showYearsErr(msg);
    else if (result.error.field === "regionAvgSalary") showRegionErr(msg);
    else showSalaryErr(msg);
    goStaleIfComputed();
    return;
  }

  const typeLabel = labels[selectType.value] ?? selectType.value;
  const regionText = inputRegion.value.trim()
    ? `（社平 ${inputRegion.value.trim()}）`
    : "";
  resultCaption.textContent = `月薪 ${inputSalary.value.trim()} 元 · 工龄 ${inputYears.value.trim()} 年 · ${typeLabel}${regionText}`;
  resultMain.textContent = `应发 ¥${result.result.toFixed(2)}（${result.months} 月 × ¥${result.cappedSalary.toFixed(2)}）`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputSalary.value = "";
  inputYears.value = "";
  selectType.value = "N";
  inputRegion.value = "";
  clearAll();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorSalary.hidden && inputSalary.value.trim() !== "")
    clearFieldError(inputSalary, errorSalary);
  if (!errorYears.hidden && inputYears.value.trim() !== "")
    clearFieldError(inputYears, errorYears);
  if (!errorRegion.hidden && inputRegion.value.trim() !== "")
    clearFieldError(inputRegion, errorRegion);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputSalary.addEventListener("input", onFieldInput);
inputYears.addEventListener("input", onFieldInput);
inputRegion.addEventListener("input", onFieldInput);
selectType.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
