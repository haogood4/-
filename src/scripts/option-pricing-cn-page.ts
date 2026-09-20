import {
  calculateOption,
  formatOption,
} from "../lib/calculators/option-pricing-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const spotInput = el<HTMLInputElement>("#spot");
const strikeInput = el<HTMLInputElement>("#strike");
const rateInput = el<HTMLInputElement>("#rate");
const volInput = el<HTMLInputElement>("#vol");
const timeInput = el<HTMLInputElement>("#time");
const typeSelect = el<HTMLSelectElement>("#type");
const err_spot = el<HTMLParagraphElement>("#field-error-spot");
const err_strike = el<HTMLParagraphElement>("#field-error-strike");
const err_rate = el<HTMLParagraphElement>("#field-error-rate");
const err_vol = el<HTMLParagraphElement>("#field-error-vol");
const err_time = el<HTMLParagraphElement>("#field-error-time");
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
  clearError(spotInput, err_spot);
  clearError(strikeInput, err_strike);
  clearError(rateInput, err_rate);
  clearError(volInput, err_vol);
  clearError(timeInput, err_time);
  const r = calculateOption({
    spot: spotInput.value,
    strike: strikeInput.value,
    rate: rateInput.value,
    vol: volInput.value,
    time: timeInput.value,
    type: typeSelect.value as "call" | "put",
  });
  if (!r.ok) {
    setError(spotInput, err_spot, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatOption(v);
  resultCaption.textContent = "期权定价计算器";
  resultMain.textContent = String(f.price ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  spotInput.value = "";
  strikeInput.value = "";
  rateInput.value = "";
  volInput.value = "";
  timeInput.value = "";
  typeSelect.value = "call";
  clearError(spotInput, err_spot);
  clearError(strikeInput, err_strike);
  clearError(rateInput, err_rate);
  clearError(volInput, err_vol);
  clearError(timeInput, err_time);
  setState("empty");
});
spotInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
strikeInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
rateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
volInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
timeInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
typeSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
