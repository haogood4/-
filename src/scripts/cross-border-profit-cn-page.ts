import {
  calculateCrossBorder,
  formatCrossBorder,
} from "../lib/calculators/cross-border-profit-cn";
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
const shippingCostInput = el<HTMLInputElement>("#shippingCost");
const platformFeeInput = el<HTMLInputElement>("#platformFee");
const exchangeRateInput = el<HTMLInputElement>("#exchangeRate");

const err_sellingPrice = el<HTMLParagraphElement>("#field-error-sellingPrice");
const err_productCost = el<HTMLParagraphElement>("#field-error-productCost");
const err_shippingCost = el<HTMLParagraphElement>("#field-error-shippingCost");
const err_platformFee = el<HTMLParagraphElement>("#field-error-platformFee");
const err_exchangeRate = el<HTMLParagraphElement>("#field-error-exchangeRate");
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
  clearError(shippingCostInput, err_shippingCost);
  clearError(platformFeeInput, err_platformFee);
  clearError(exchangeRateInput, err_exchangeRate);
  const r = calculateCrossBorder({
    sellingPrice: sellingPriceInput.value,
    productCost: productCostInput.value,
    shippingCost: shippingCostInput.value,
    platformFee: platformFeeInput.value,
    exchangeRate: exchangeRateInput.value,
  });
  if (!r.ok) {
    setError(sellingPriceInput, err_sellingPrice, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatCrossBorder(v);
  resultCaption.textContent = "跨境电商利润计算器";
  resultMain.textContent = String(f.profitCny ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  sellingPriceInput.value = "";
  productCostInput.value = "";
  shippingCostInput.value = "";
  platformFeeInput.value = "";
  exchangeRateInput.value = "";

  clearError(sellingPriceInput, err_sellingPrice);
  clearError(productCostInput, err_productCost);
  clearError(shippingCostInput, err_shippingCost);
  clearError(platformFeeInput, err_platformFee);
  clearError(exchangeRateInput, err_exchangeRate);
  setState("empty");
});
sellingPriceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
productCostInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
shippingCostInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
platformFeeInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
exchangeRateInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
