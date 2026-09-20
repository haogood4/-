import { calculateFba, formatFba } from "../lib/calculators/amazon-fba-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const sellingPriceInput = el<HTMLInputElement>("#sellingPrice");
const productCostInput = el<HTMLInputElement>("#productCost");
const sizeSelect = el<HTMLSelectElement>("#size");
const err_sellingPrice = el<HTMLParagraphElement>("#field-error-sellingPrice");
const err_productCost = el<HTMLParagraphElement>("#field-error-productCost");
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
  clearError(sellingPriceInput, err_sellingPrice);
  clearError(productCostInput, err_productCost);
  const r = calculateFba({
    sellingPrice: sellingPriceInput.value,
    productCost: productCostInput.value,
    size: sizeSelect.value as "standard" | "large",
  });
  if (!r.ok) {
    setError(sellingPriceInput, err_sellingPrice, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatFba(v);
  resultCaption.textContent = "Amazon FBA 费用计算器";
  resultMain.textContent = String(f.profit ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  sellingPriceInput.value = "";
  productCostInput.value = "";
  sizeSelect.value = "standard";
  clearError(sellingPriceInput, err_sellingPrice);
  clearError(productCostInput, err_productCost);
  setState("empty");
});
sellingPriceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
productCostInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
sizeSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
