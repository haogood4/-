import { calculateRoas, formatRoas } from "../lib/calculators/roas-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const adCostInput = el<HTMLInputElement>("#adCost");
const revenueInput = el<HTMLInputElement>("#revenue");
const profitRateInput = el<HTMLInputElement>("#profitRate");

const err_adCost = el<HTMLParagraphElement>("#field-error-adCost");
const err_revenue = el<HTMLParagraphElement>("#field-error-revenue");
const err_profitRate = el<HTMLParagraphElement>("#field-error-profitRate");
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
  clearError(adCostInput, err_adCost);
  clearError(revenueInput, err_revenue);
  clearError(profitRateInput, err_profitRate);
  const r = calculateRoas({
    adCost: adCostInput.value,
    revenue: revenueInput.value,
    profitRate: profitRateInput.value,
  });
  if (!r.ok) {
    setError(adCostInput, err_adCost, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatRoas(v);
  resultCaption.textContent = "广告 ROAS 计算器";
  resultMain.textContent = String(f.roas ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  adCostInput.value = "";
  revenueInput.value = "";
  profitRateInput.value = "";

  clearError(adCostInput, err_adCost);
  clearError(revenueInput, err_revenue);
  clearError(profitRateInput, err_profitRate);
  setState("empty");
});
adCostInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
revenueInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
profitRateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
