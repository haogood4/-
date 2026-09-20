import {
  calculateBreakEven,
  formatBreakEven,
} from "../lib/calculators/break-even-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const fixedCostInput = el<HTMLInputElement>("#fixedCost");
const pricePerUnitInput = el<HTMLInputElement>("#pricePerUnit");
const variablePerUnitInput = el<HTMLInputElement>("#variablePerUnit");

const err_fixedCost = el<HTMLParagraphElement>("#field-error-fixedCost");
const err_pricePerUnit = el<HTMLParagraphElement>("#field-error-pricePerUnit");
const err_variablePerUnit = el<HTMLParagraphElement>(
  "#field-error-variablePerUnit",
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
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(fixedCostInput, err_fixedCost);
  clearError(pricePerUnitInput, err_pricePerUnit);
  clearError(variablePerUnitInput, err_variablePerUnit);
  const r = calculateBreakEven({
    fixedCost: fixedCostInput.value,
    pricePerUnit: pricePerUnitInput.value,
    variablePerUnit: variablePerUnitInput.value,
  });
  if (!r.ok) {
    setError(fixedCostInput, err_fixedCost, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatBreakEven(v);
  resultCaption.textContent = "盈亏平衡点计算器";
  resultMain.textContent = String(f.units ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  fixedCostInput.value = "";
  pricePerUnitInput.value = "";
  variablePerUnitInput.value = "";

  clearError(fixedCostInput, err_fixedCost);
  clearError(pricePerUnitInput, err_pricePerUnit);
  clearError(variablePerUnitInput, err_variablePerUnit);
  setState("empty");
});
fixedCostInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
pricePerUnitInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
variablePerUnitInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
