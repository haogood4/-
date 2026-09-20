import {
  calculateFuel,
  formatFuel,
} from "../lib/calculators/fuel-consumption-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const distanceInput = el<HTMLInputElement>("#distance");
const fuelInput = el<HTMLInputElement>("#fuel");

const err_distance = el<HTMLParagraphElement>("#field-error-distance");
const err_fuel = el<HTMLParagraphElement>("#field-error-fuel");
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
  clearError(distanceInput || distanceInput, err_distance);
  clearError(fuelInput || fuelInput, err_fuel);
  const r = calculateFuel({
    distance: distanceInput.value,
    fuel: fuelInput.value,
  });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        distanceInput,
      err_distance,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatFuel(v);
  resultCaption.textContent = `油耗 · ${distanceInput.value} km`;
  resultMain.textContent = String(f.perHundred ?? "");
  resultDetail.textContent = `每公里 ${v.perKm}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  distanceInput.value = "";
  fuelInput.value = "";

  clearError(distanceInput, err_distance);
  clearError(fuelInput, err_fuel);
  setState("empty");
});
distanceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
fuelInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
