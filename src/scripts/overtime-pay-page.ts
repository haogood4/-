// 加班费计算器页面交互（外部脚本）
import {
  calculateOvertimePay,
  type OvertimePayField,
} from "../lib/calculators/overtime-pay";
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
const inputH1 = requireEl<HTMLInputElement>("#input-h1");
const inputH2 = requireEl<HTMLInputElement>("#input-h2");
const inputH3 = requireEl<HTMLInputElement>("#input-h3");
const errorSalary = requireEl<HTMLParagraphElement>("#field-error-salary");
const errorH1 = requireEl<HTMLParagraphElement>("#field-error-h1");
const errorH2 = requireEl<HTMLParagraphElement>("#field-error-h2");
const errorH3 = requireEl<HTMLParagraphElement>("#field-error-h3");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const fieldMap: Record<
  OvertimePayField,
  { input: HTMLInputElement; error: HTMLParagraphElement }
> = {
  salary: { input: inputSalary, error: errorSalary },
  h1: { input: inputH1, error: errorH1 },
  h2: { input: inputH2, error: errorH2 },
  h3: { input: inputH3, error: errorH3 },
};
const textFields = [fieldMap.salary, fieldMap.h1, fieldMap.h2, fieldMap.h3];

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
  for (const f of textFields) clearFieldError(f.input, f.error);

  const result = calculateOvertimePay({
    monthlySalary: inputSalary.value,
    hoursWorkday: inputH1.value,
    hoursWeekend: inputH2.value,
    hoursHoliday: inputH3.value,
  });
  if (!result.ok) {
    const target = fieldMap[result.error.field];
    setFieldError(target.input, target.error, result.error.message);
    goStaleIfComputed();
    return;
  }

  resultCaption.textContent = `月薪 ${inputSalary.value.trim()} 元 · 延时 ${inputH1.value.trim() || "0"}h + 休息日 ${inputH2.value.trim() || "0"}h + 节假日 ${inputH3.value.trim() || "0"}h`;
  resultMain.textContent = `加班费合计 ¥${result.total.toFixed(2)}（小时工资 ¥${result.hourlyWage.toFixed(2)}）`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputSalary.value = "";
  inputH1.value = "";
  inputH2.value = "";
  inputH3.value = "";
  for (const f of textFields) clearFieldError(f.input, f.error);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  for (const f of textFields) {
    if (!f.error.hidden && f.input.value.trim() !== "")
      clearFieldError(f.input, f.error);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const f of textFields) f.input.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
