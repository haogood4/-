import {
  calculateEqualInstallment,
  formatEqualInstallment,
} from "../lib/calculators/equal-installment-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const principalInput = el<HTMLInputElement>("#principal");
const yearsInput = el<HTMLInputElement>("#years");
const rateInput = el<HTMLInputElement>("#rate");

const err_principal = el<HTMLParagraphElement>("#field-error-principal");
const err_years = el<HTMLParagraphElement>("#field-error-years");
const err_rate = el<HTMLParagraphElement>("#field-error-rate");
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
  clearError(yearsInput || yearsInput, err_years);
  clearError(rateInput || rateInput, err_rate);
  const r = calculateEqualInstallment({
    principal: principalInput.value,
    years: yearsInput.value,
    rate: rateInput.value,
    type: "equal-installment",
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
  const f = formatEqualInstallment(v);
  resultCaption.textContent = `等额本息 · ${yearsInput.value} 年`;
  resultMain.textContent = String(f.monthlyFirst ?? "");
  resultDetail.textContent = `本金 ${principalInput.value} 元，年利率 ${rateInput.value}%，总还款 ${v.totalPayment}，总利息 ${v.totalInterest}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  yearsInput.value = "";
  rateInput.value = "";

  clearError(principalInput, err_principal);
  clearError(yearsInput, err_years);
  clearError(rateInput, err_rate);
  setState("empty");
});
principalInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
yearsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
rateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
