import {
  calculatePaint,
  formatPaint,
} from "../lib/calculators/paint-quantity-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const wallAreaInput = el<HTMLInputElement>("#wallArea");
const coatsSelect = el<HTMLInputElement>("#coats");
const coveragePerLiterInput = el<HTMLInputElement>("#coveragePerLiter");

const err_wallArea = el<HTMLParagraphElement>("#field-error-wallArea");
const err_coats = el<HTMLParagraphElement>("#field-error-coats");
const err_coveragePerLiter = el<HTMLParagraphElement>(
  "#field-error-coveragePerLiter",
);
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
  clearError(wallAreaInput, err_wallArea);
  clearError(coatsSelect, err_coats);
  clearError(coveragePerLiterInput, err_coveragePerLiter);
  const r = calculatePaint({
    wallArea: wallAreaInput.value,
    coats: coatsSelect.value,
    coveragePerLiter: coveragePerLiterInput.value,
  });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        wallAreaInput,
      err_wallArea,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatPaint(v);
  resultCaption.textContent = `乳胶漆用量`;
  resultMain.textContent = String(f.cans ?? "");
  resultDetail.textContent = `总用量 ${v.liters}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  wallAreaInput.value = "";
  coatsSelect.value = "";
  coveragePerLiterInput.value = "";

  clearError(wallAreaInput, err_wallArea);
  clearError(coatsSelect, err_coats);
  clearError(coveragePerLiterInput, err_coveragePerLiter);
  setState("empty");
});
wallAreaInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
coatsSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
coveragePerLiterInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
