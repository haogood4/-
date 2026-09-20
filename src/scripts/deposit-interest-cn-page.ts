import {
  calculateDeposit,
  formatDeposit,
} from "../lib/calculators/deposit-interest-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const principalInput = el<HTMLInputElement>("#principal");
const rateInput = el<HTMLInputElement>("#rate");
const yearsInput = el<HTMLInputElement>("#years");
const typeSelect = el<HTMLSelectElement>("#type");
const err_principal = el<HTMLParagraphElement>("#field-error-principal");
const err_rate = el<HTMLParagraphElement>("#field-error-rate");
const err_years = el<HTMLParagraphElement>("#field-error-years");
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
  clearError(rateInput || rateInput, err_rate);
  clearError(yearsInput || yearsInput, err_years);
  clearError(typeSelect || typeSelect, err_principal);
  const r = calculateDeposit({
    principal: principalInput.value,
    rate: rateInput.value,
    years: yearsInput.value,
    type: typeSelect.value as "compound" | "simple",
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
  const f = formatDeposit(v);
  resultCaption.textContent = `存款利息 · ${yearsInput.value} 年`;
  resultMain.textContent = String(f.total ?? "");
  resultDetail.textContent = `利息 ${v.interest}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  principalInput.value = "";
  rateInput.value = "";
  yearsInput.value = "";
  typeSelect.value = "compound";
  clearError(principalInput, err_principal);
  clearError(rateInput, err_rate);
  clearError(yearsInput, err_years);
  setState("empty");
});
principalInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
rateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
yearsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
typeSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
