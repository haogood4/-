import {
  calculateFutures,
  formatFutures,
} from "../lib/calculators/futures-margin-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const priceInput = el<HTMLInputElement>("#price");
const lotsInput = el<HTMLInputElement>("#lots");
const multiplierInput = el<HTMLInputElement>("#multiplier");
const marginRateInput = el<HTMLInputElement>("#marginRate");

const err_price = el<HTMLParagraphElement>("#field-error-price");
const err_lots = el<HTMLParagraphElement>("#field-error-lots");
const err_multiplier = el<HTMLParagraphElement>("#field-error-multiplier");
const err_marginRate = el<HTMLParagraphElement>("#field-error-marginRate");
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
  clearError(priceInput, err_price);
  clearError(lotsInput, err_lots);
  clearError(multiplierInput, err_multiplier);
  clearError(marginRateInput, err_marginRate);
  const r = calculateFutures({
    price: priceInput.value,
    lots: lotsInput.value,
    multiplier: multiplierInput.value,
    marginRate: marginRateInput.value,
  });
  if (!r.ok) {
    setError(priceInput, err_price, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatFutures(v);
  resultCaption.textContent = "期货保证金计算器";
  resultMain.textContent = String(f.margin ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  priceInput.value = "";
  lotsInput.value = "";
  multiplierInput.value = "";
  marginRateInput.value = "";

  clearError(priceInput, err_price);
  clearError(lotsInput, err_lots);
  clearError(multiplierInput, err_multiplier);
  clearError(marginRateInput, err_marginRate);
  setState("empty");
});
priceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
lotsInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
multiplierInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
marginRateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
