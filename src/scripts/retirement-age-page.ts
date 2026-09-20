// 渐进式延迟法定退休年龄计算器页面交互（外部脚本）
import {
  calculateRetirementAge,
  RETIREMENT_CATEGORY_OPTIONS,
} from "../lib/calculators/retirement-age";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputYear = requireEl<HTMLInputElement>("#input-year");
const inputMonth = requireEl<HTMLInputElement>("#input-month");
const inputDay = requireEl<HTMLInputElement>("#input-day");
const selectCategory = requireEl<HTMLSelectElement>("#input-category");
const errorYear = requireEl<HTMLParagraphElement>("#field-error-year");
const errorMonth = requireEl<HTMLParagraphElement>("#field-error-month");
const errorDay = requireEl<HTMLParagraphElement>("#field-error-day");
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

const showYearErr = (m: string) => setFieldError(inputYear, errorYear, m);
const showMonthErr = (m: string) => setFieldError(inputMonth, errorMonth, m);
const showDayErr = (m: string) => setFieldError(inputDay, errorDay, m);
const clearAll = () => {
  clearFieldError(inputYear, errorYear);
  clearFieldError(inputMonth, errorMonth);
  clearFieldError(inputDay, errorDay);
};

const labels: Record<string, string> = Object.fromEntries(
  RETIREMENT_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]),
);

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAll();

  const result = calculateRetirementAge({
    birthYear: inputYear.value,
    birthMonth: inputMonth.value,
    birthDay: inputDay.value,
    category: selectCategory.value,
  });
  if (!result.ok) {
    // 简单按错误码路由提示到对应字段
    const msg = result.error.message;
    const code = result.error.code;
    if (code === "EMPTY") {
      if (!inputYear.value.trim()) showYearErr(msg);
      else if (!inputMonth.value.trim()) showMonthErr(msg);
      else showDayErr(msg);
    } else if (code === "INVALID_YEAR" || code === "OUT_OF_RANGE") {
      showYearErr(msg);
    } else if (code === "INVALID_MONTH") {
      showMonthErr(msg);
    } else if (code === "INVALID_DATE") {
      showDayErr(msg);
    } else {
      showYearErr(msg);
    }
    goStaleIfComputed();
    return;
  }

  const cat = labels[selectCategory.value] ?? selectCategory.value;
  resultCaption.textContent = `出生 ${inputYear.value}-${inputMonth.value}-${inputDay.value} / ${cat}`;
  resultMain.textContent = `法定退休年龄：${result.newRetireAgeText}（${result.newRetireDateText} 退休）· 最低缴费年限：${result.minContributionYears} 年`;
  resultProcess.textContent = `原退休年月：${result.originalRetireYear}-${String(result.originalRetireMonth).padStart(2, "0")}；延迟 ${result.delayMonths} 个月（约 ${result.delayYears.toFixed(2)} 年）`;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputYear.value = "";
  inputMonth.value = "";
  inputDay.value = "";
  selectCategory.value = "male";
  clearAll();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorYear.hidden && inputYear.value.trim() !== "")
    clearFieldError(inputYear, errorYear);
  if (!errorMonth.hidden && inputMonth.value.trim() !== "")
    clearFieldError(inputMonth, errorMonth);
  if (!errorDay.hidden && inputDay.value.trim() !== "")
    clearFieldError(inputDay, errorDay);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputYear.addEventListener("input", onFieldInput);
inputMonth.addEventListener("input", onFieldInput);
inputDay.addEventListener("input", onFieldInput);
selectCategory.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
