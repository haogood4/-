import {
  calculateCalorie,
  formatCalorie,
} from "../lib/calculators/calorie-burn-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const weightInput = el<HTMLInputElement>("#weight");
const minutesInput = el<HTMLInputElement>("#minutes");
const metInput = el<HTMLInputElement>("#met");

const err_weight = el<HTMLParagraphElement>("#field-error-weight");
const err_minutes = el<HTMLParagraphElement>("#field-error-minutes");
const err_met = el<HTMLParagraphElement>("#field-error-met");
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
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(weightInput, err_weight);
  clearError(minutesInput, err_minutes);
  clearError(metInput, err_met);
  const r = calculateCalorie({
    weight: weightInput.value,
    minutes: minutesInput.value,
    met: metInput.value,
  });
  if (!r.ok) {
    setError(weightInput, err_weight, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatCalorie(v);
  resultCaption.textContent = "卡路里消耗计算器";
  resultMain.textContent = String(f.kcal ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  weightInput.value = "";
  minutesInput.value = "";
  metInput.value = "";

  clearError(weightInput, err_weight);
  clearError(minutesInput, err_minutes);
  clearError(metInput, err_met);
  setState("empty");
});
weightInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
minutesInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
metInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
