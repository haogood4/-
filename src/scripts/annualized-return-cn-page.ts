import {
  calculateAnnualizedReturn,
  formatAnnualizedReturn,
} from "../lib/calculators/annualized-return-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const totalReturnInput = el<HTMLInputElement>("#totalReturn");
const daysInput = el<HTMLInputElement>("#days");

const err_totalReturn = el<HTMLParagraphElement>("#field-error-totalReturn");
const err_days = el<HTMLParagraphElement>("#field-error-days");
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
  clearError(totalReturnInput || totalReturnInput, err_totalReturn);
  clearError(daysInput || daysInput, err_days);
  const r = calculateAnnualizedReturn({
    totalReturn: totalReturnInput.value,
    days: daysInput.value,
  });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        totalReturnInput,
      err_totalReturn,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatAnnualizedReturn(v);
  resultCaption.textContent = `年化收益率`;
  resultMain.textContent = f;
  resultDetail.textContent = `总收益 ${totalReturnInput.value}% / ${daysInput.value} 天`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  totalReturnInput.value = "";
  daysInput.value = "";

  clearError(totalReturnInput, err_totalReturn);
  clearError(daysInput, err_days);
  setState("empty");
});
totalReturnInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
daysInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
