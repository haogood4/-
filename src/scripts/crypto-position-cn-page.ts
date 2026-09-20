import {
  calculateCryptoPosition,
  formatCryptoPosition,
} from "../lib/calculators/crypto-position-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const equityInput = el<HTMLInputElement>("#equity");
const leverageInput = el<HTMLInputElement>("#leverage");
const entryPriceInput = el<HTMLInputElement>("#entryPrice");
const sideSelect = el<HTMLSelectElement>("#side");
const err_equity = el<HTMLParagraphElement>("#field-error-equity");
const err_leverage = el<HTMLParagraphElement>("#field-error-leverage");
const err_entryPrice = el<HTMLParagraphElement>("#field-error-entryPrice");
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
  clearError(equityInput, err_equity);
  clearError(leverageInput, err_leverage);
  clearError(entryPriceInput, err_entryPrice);
  const r = calculateCryptoPosition({
    equity: equityInput.value,
    leverage: leverageInput.value,
    entryPrice: entryPriceInput.value,
    side: sideSelect.value as "long" | "short",
  });
  if (!r.ok) {
    setError(equityInput, err_equity, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatCryptoPosition(v);
  resultCaption.textContent = "加密货币仓位计算器";
  resultMain.textContent = String(f.positionValue ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  equityInput.value = "";
  leverageInput.value = "";
  entryPriceInput.value = "";
  sideSelect.value = "long";
  clearError(equityInput, err_equity);
  clearError(leverageInput, err_leverage);
  clearError(entryPriceInput, err_entryPrice);
  setState("empty");
});
equityInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
leverageInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
entryPriceInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
sideSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
