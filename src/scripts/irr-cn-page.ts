import { calculateIrrFromInput, formatIrr } from "../lib/calculators/irr-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const cashflowsInput = el<HTMLInputElement>("#cashflows");

const err_cashflows = el<HTMLParagraphElement>("#field-error-cashflows");
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
  clearError(cashflowsInput || cashflowsInput, err_cashflows);
  const r = calculateIrrFromInput(cashflowsInput.value);
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        cashflowsInput,
      err_cashflows,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatIrr(v);
  resultCaption.textContent = `IRR`;
  resultMain.textContent = f;
  resultDetail.textContent = `Newton-Raphson 数值求解`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  cashflowsInput.value = "";

  clearError(cashflowsInput, err_cashflows);
  setState("empty");
});
cashflowsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
