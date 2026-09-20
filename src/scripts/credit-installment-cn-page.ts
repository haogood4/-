import {
  calculateCredit,
  formatCredit,
} from "../lib/calculators/credit-installment-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const principalInput = el<HTMLInputElement>("#principal");
const monthlyRateInput = el<HTMLInputElement>("#monthlyRate");
const monthsInput = el<HTMLInputElement>("#months");

const err_principal = el<HTMLParagraphElement>("#field-error-principal");
const err_monthlyRate = el<HTMLParagraphElement>("#field-error-monthlyRate");
const err_months = el<HTMLParagraphElement>("#field-error-months");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");
const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  buttons: [copyBtn],
});
let lastCopy = "";
function getInputByError(
  errId: string,
): HTMLInputElement | HTMLSelectElement | null {
  const m = errId.match(/field-error-(.+)/);
  if (!m) return null;
  const id = m[1];
  return document.querySelector(`#${id}`);
}
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(principalInput || principalInput, err_principal);
  clearError(monthlyRateInput || monthlyRateInput, err_monthlyRate);
  clearError(monthsInput || monthsInput, err_months);
  const r = calculateCredit({
    principal: principalInput.value,
    monthlyRate: monthlyRateInput.value,
    months: monthsInput.value,
  });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        principalInput,
      err_principal,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatCredit(v);
  resultCaption.textContent = `信用卡分期 · ${monthsInput.value} 期`;
  resultMain.textContent = String(f.monthlyPayment ?? "");
  resultDetail.textContent = `总手续费 ${v.totalFee}，实际年化约 ${v.effectiveAnnualRate}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  monthlyRateInput.value = "";
  monthsInput.value = "";

  clearError(principalInput, err_principal);
  clearError(monthlyRateInput, err_monthlyRate);
  clearError(monthsInput, err_months);
  setState("empty");
});
principalInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
monthlyRateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
monthsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
