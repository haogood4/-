import {
  calculateTurtle,
  formatTurtle,
} from "../lib/calculators/turtle-position-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const accountEquitySelect = el<HTMLInputElement>("#accountEquity");
const atrSelect = el<HTMLInputElement>("#atr");
const riskPercentSelect = el<HTMLInputElement>("#riskPercent");
const entryPriceSelect = el<HTMLInputElement>("#entryPrice");

const err_accountEquity = el<HTMLParagraphElement>(
  "#field-error-accountEquity",
);
const err_atr = el<HTMLParagraphElement>("#field-error-atr");
const err_riskPercent = el<HTMLParagraphElement>("#field-error-riskPercent");
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
  clearError(accountEquitySelect, err_accountEquity);
  clearError(atrSelect, err_atr);
  clearError(riskPercentSelect, err_riskPercent);
  clearError(entryPriceSelect, err_entryPrice);
  const r = calculateTurtle({
    accountEquity: accountEquitySelect.value,
    atr: atrSelect.value,
    riskPercent: riskPercentSelect.value,
    entryPrice: entryPriceSelect.value,
  });
  if (!r.ok) {
    setError(accountEquitySelect, err_accountEquity, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatTurtle(v);
  resultCaption.textContent = "海龟交易法仓位计算器";
  resultMain.textContent = String(f.totalUnits ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  accountEquitySelect.value = "";
  atrSelect.value = "";
  riskPercentSelect.value = "";
  entryPriceSelect.value = "";

  clearError(accountEquitySelect, err_accountEquity);
  clearError(atrSelect, err_atr);
  clearError(riskPercentSelect, err_riskPercent);
  clearError(entryPriceSelect, err_entryPrice);
  setState("empty");
});
accountEquitySelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
atrSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
riskPercentSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
entryPriceSelect?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
