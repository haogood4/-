import {
  calculateReno,
  formatReno,
} from "../lib/calculators/renovation-budget-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const areaInput = el<HTMLInputElement>("#area");
const perSqmInput = el<HTMLInputElement>("#perSqm");

const err_area = el<HTMLParagraphElement>("#field-error-area");
const err_perSqm = el<HTMLParagraphElement>("#field-error-perSqm");
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
  clearError(areaInput, err_area);
  clearError(perSqmInput, err_perSqm);
  const r = calculateReno({ area: areaInput.value, perSqm: perSqmInput.value });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        areaInput,
      err_area,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatReno(v);
  resultCaption.textContent = `装修预算 · ${areaInput.value} 平`;
  resultMain.textContent = String(f.total ?? "");
  resultDetail.textContent = `硬装 ${v.hard} · 软装 ${v.soft}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  areaInput.value = "";
  perSqmInput.value = "";

  clearError(areaInput, err_area);
  clearError(perSqmInput, err_perSqm);
  setState("empty");
});
areaInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
perSqmInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
