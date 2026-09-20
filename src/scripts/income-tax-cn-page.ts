import {
  calculateIncomeTax,
  formatIncomeTax,
} from "../lib/calculators/income-tax-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const salaryInput = el<HTMLInputElement>("#monthlySalary");
const siInput = el<HTMLInputElement>("#socialInsurance");
const spInput = el<HTMLInputElement>("#specialDeduction");
const errS = el<HTMLParagraphElement>("#field-error-monthlySalary");
const errSi = el<HTMLParagraphElement>("#field-error-socialInsurance");
const errSp = el<HTMLParagraphElement>("#field-error-specialDeduction");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail1 = el<HTMLParagraphElement>("#result-detail1");
const resultDetail2 = el<HTMLParagraphElement>("#result-detail2");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  buttons: [copyBtn],
});
let lastCopy = "";
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(salaryInput, errS);
  clearError(siInput, errSi);
  clearError(spInput, errSp);
  const r = calculateIncomeTax({
    monthlySalary: salaryInput.value,
    socialInsurance: siInput.value,
    specialDeduction: spInput.value,
  });
  if (!r.ok) {
    setError(salaryInput, errS, r.error.message);
    setState("empty");
    return;
  }
  const f = formatIncomeTax(r.value);
  resultCaption.textContent = `月度工资 · 应纳税所得额 ${f.taxable}`;
  resultMain.textContent = `应缴个税 ${f.tax}`;
  resultDetail1.textContent = `税后月薪 ${f.afterTax}，综合税负 ${f.effectiveRate}`;
  resultDetail2.textContent = `计算：应纳税所得额 = 月薪 − 5000 − 社保 − 专项附加扣除`;
  lastCopy = `应缴个税 ${f.tax}，税后月薪 ${f.afterTax}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  salaryInput.value = "";
  siInput.value = "";
  spInput.value = "";
  clearError(salaryInput, errS);
  clearError(siInput, errSi);
  clearError(spInput, errSp);
  setState("empty");
});
[salaryInput, siInput, spInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
