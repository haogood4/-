// 公积金贷款计算器页面交互（外部脚本）
import { calculateHousingFundLoan } from "../lib/calculators/housing-fund-loan";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputAmount = requireEl<HTMLInputElement>("#input-amount");
const inputYears = requireEl<HTMLInputElement>("#input-years");
const selectHouse = requireEl<HTMLSelectElement>("#input-house");
const errorAmount = requireEl<HTMLParagraphElement>("#field-error-amount");
const errorYears = requireEl<HTMLParagraphElement>("#field-error-years");
const errorHouse = requireEl<HTMLParagraphElement>("#field-error-house");
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

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(inputAmount, errorAmount);
  clearFieldError(inputYears, errorYears);
  clearFieldError(selectHouse, errorHouse);

  const result = calculateHousingFundLoan({
    amount: inputAmount.value,
    years: inputYears.value,
    houseType: selectHouse.value,
  });
  if (!result.ok) {
    const msg = result.error.message;
    const field = result.error.field;
    if (field === "years") {
      setFieldError(inputYears, errorYears, msg);
    } else if (field === "houseType") {
      setFieldError(selectHouse, errorHouse, msg);
    } else {
      setFieldError(inputAmount, errorAmount, msg);
    }
    goStaleIfComputed();
    return;
  }

  const amount = inputAmount.value.trim();
  const years = inputYears.value.trim();
  resultCaption.textContent = `公积金贷款 ${amount} 元 · ${years} 年 · ${result.rateLabel}（年利率 ${(result.annualRate * 100).toFixed(3)}%）`;
  resultMain.textContent = `月供 ¥${result.monthPay.toFixed(2)} · 利息总额 ¥${result.totalInterest.toFixed(2)} | 还款总额 ¥${result.totalPay.toFixed(2)}`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputAmount.value = "";
  inputYears.value = "30";
  selectHouse.value = "first";
  clearFieldError(inputAmount, errorAmount);
  clearFieldError(inputYears, errorYears);
  clearFieldError(selectHouse, errorHouse);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorAmount.hidden && inputAmount.value.trim() !== "")
    clearFieldError(inputAmount, errorAmount);
  if (!errorYears.hidden && inputYears.value.trim() !== "")
    clearFieldError(inputYears, errorYears);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputAmount.addEventListener("input", onFieldInput);
inputYears.addEventListener("input", onFieldInput);
selectHouse.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
