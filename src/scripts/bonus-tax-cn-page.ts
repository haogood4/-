import { calculateBonus, formatBonus } from "../lib/calculators/bonus-tax-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const bonusInput = el<HTMLInputElement>("#bonus");

const err_bonus = el<HTMLParagraphElement>("#field-error-bonus");
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
  clearError(bonusInput || bonusInput, err_bonus);
  const r = calculateBonus({ bonus: bonusInput.value });
  if (!r.ok) {
    setError(
      getInputByError("field-error-principal") ||
        getInputByError("field-error-bonus") ||
        getInputByError("field-error-amount") ||
        bonusInput,
      err_bonus,
      r.error.message,
    );
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatBonus(v);
  resultCaption.textContent = `年终奖 · 单独计税`;
  resultMain.textContent = String(f.tax ?? "");
  resultDetail.textContent = `应纳税 ${v.tax}，税后 ${v.afterTax}`;
  lastCopy = resultMain.textContent + " " + resultDetail.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  bonusInput.value = "";

  clearError(bonusInput, err_bonus);
  setState("empty");
});
bonusInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
