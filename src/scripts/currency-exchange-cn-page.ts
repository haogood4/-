import {
  calculateExchange,
  CURRENCIES,
} from "../lib/calculators/currency-exchange-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const amountInput = el<HTMLInputElement>("#amount");
const fromSelect = el<HTMLSelectElement>("#from");
const toSelect = el<HTMLSelectElement>("#to");
const rateInput = el<HTMLInputElement>("#rate");
const errA = el<HTMLParagraphElement>("#field-error-amount");
const errR = el<HTMLParagraphElement>("#field-error-rate");
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
// 默认 CNY / USD
fromSelect.value = "USD";
toSelect.value = "CNY";
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearError(amountInput, errA);
  clearError(rateInput, errR);
  const r = calculateExchange({
    amount: amountInput.value,
    rate: rateInput.value,
    from: fromSelect.value as never,
    to: toSelect.value as never,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("汇率")) setError(rateInput, errR, m);
    else setError(amountInput, errA, m);
    setState("empty");
    return;
  }
  const toCurrency = CURRENCIES.find((c) => c.code === toSelect.value);
  const fromCurrency = CURRENCIES.find((c) => c.code === fromSelect.value);
  const symbol = toCurrency?.symbol ?? "";
  resultCaption.textContent = `${fromCurrency?.name} → ${toCurrency?.name}`;
  resultMain.textContent = `${symbol}${r.value.converted.toFixed(4)}`;
  resultDetail.textContent = `汇率 1 : ${r.value.rate}，反向 ${r.value.reverseRate.toFixed(6)}`;
  lastCopy = `${amountInput.value} ${fromSelect.value} = ${symbol}${r.value.converted.toFixed(2)} ${toSelect.value}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  amountInput.value = "";
  rateInput.value = "";
  fromSelect.value = "USD";
  toSelect.value = "CNY";
  clearError(amountInput, errA);
  clearError(rateInput, errR);
  setState("empty");
});
[amountInput, rateInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
