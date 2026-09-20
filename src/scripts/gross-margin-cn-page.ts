import {
  calculateGrossMargin,
  formatGrossMargin,
} from "../lib/calculators/gross-margin-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const revenueInput = el<HTMLInputElement>("#revenue");
const costInput = el<HTMLInputElement>("#cost");

const err_revenue = el<HTMLParagraphElement>("#field-error-revenue");
const err_cost = el<HTMLParagraphElement>("#field-error-cost");
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
  clearError(revenueInput, err_revenue);
  clearError(costInput, err_cost);
  const r = calculateGrossMargin({
    revenue: revenueInput.value,
    cost: costInput.value,
  });
  if (!r.ok) {
    setError(revenueInput, err_revenue, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatGrossMargin(v);
  resultCaption.textContent = "毛利率计算器";
  resultMain.textContent = String(f.margin ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  revenueInput.value = "";
  costInput.value = "";

  clearError(revenueInput, err_revenue);
  clearError(costInput, err_cost);
  setState("empty");
});
revenueInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
costInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
