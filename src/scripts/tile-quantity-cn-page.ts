import { calculateTile, formatTile } from "../lib/calculators/tile-quantity-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const areaInput = el<HTMLInputElement>("#area");
const tileLengthInput = el<HTMLInputElement>("#tileLength");
const tileWidthInput = el<HTMLInputElement>("#tileWidth");
const wasteInput = el<HTMLInputElement>("#waste");

const err_area = el<HTMLParagraphElement>("#field-error-area");
const err_tileLength = el<HTMLParagraphElement>("#field-error-tileLength");
const err_tileWidth = el<HTMLParagraphElement>("#field-error-tileWidth");
const err_waste = el<HTMLParagraphElement>("#field-error-waste");
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
  clearError(areaInput || areaInput, err_area);
  clearError(tileLengthInput || tileLengthInput, err_tileLength);
  clearError(tileWidthInput || tileWidthInput, err_tileWidth);
  clearError(wasteInput || wasteInput, err_waste);
  const r = calculateTile({
    area: areaInput.value,
    tileLength: tileLengthInput.value,
    tileWidth: tileWidthInput.value,
    waste: wasteInput.value,
  });
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
  const f = formatTile(v);
  resultCaption.textContent = `瓷砖数量`;
  resultMain.textContent = String(f.count ?? "");
  resultDetail.textContent = `总覆盖面积 ${v.tilesArea}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  areaInput.value = "";
  tileLengthInput.value = "";
  tileWidthInput.value = "";
  wasteInput.value = "";

  clearError(areaInput, err_area);
  clearError(tileLengthInput, err_tileLength);
  clearError(tileWidthInput, err_tileWidth);
  clearError(wasteInput, err_waste);
  setState("empty");
});
areaInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
tileLengthInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
tileWidthInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
wasteInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
