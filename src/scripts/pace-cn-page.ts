import { calculatePace, formatPace } from "../lib/calculators/pace-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const distanceInput = el<HTMLInputElement>("#distance");
const hoursInput = el<HTMLInputElement>("#hours");
const minutesInput = el<HTMLInputElement>("#minutes");
const secondsInput = el<HTMLInputElement>("#seconds");

const err_distance = el<HTMLParagraphElement>("#field-error-distance");
const err_hours = el<HTMLParagraphElement>("#field-error-hours");
const err_minutes = el<HTMLParagraphElement>("#field-error-minutes");
const err_seconds = el<HTMLParagraphElement>("#field-error-seconds");
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
  clearError(distanceInput, err_distance);
  clearError(hoursInput, err_hours);
  clearError(minutesInput, err_minutes);
  clearError(secondsInput, err_seconds);
  const r = calculatePace({
    distance: distanceInput.value,
    hours: hoursInput.value,
    minutes: minutesInput.value,
    seconds: secondsInput.value,
  });
  if (!r.ok) {
    setError(distanceInput, err_distance, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatPace(v);
  resultCaption.textContent = "节拍计算器";
  resultMain.textContent = String(f.pacePerKm ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  distanceInput.value = "";
  hoursInput.value = "";
  minutesInput.value = "";
  secondsInput.value = "";

  clearError(distanceInput, err_distance);
  clearError(hoursInput, err_hours);
  clearError(minutesInput, err_minutes);
  clearError(secondsInput, err_seconds);
  setState("empty");
});
distanceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
hoursInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
minutesInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
secondsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
