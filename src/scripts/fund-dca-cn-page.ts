import { calculateDca, formatDca } from "../lib/calculators/fund-dca-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const monthlyInput = el<HTMLInputElement>("#monthly");
const rateInput = el<HTMLInputElement>("#rate");
const yearsInput = el<HTMLInputElement>("#years");
const errM = el<HTMLParagraphElement>("#field-error-monthly");
const errR = el<HTMLParagraphElement>("#field-error-rate");
const errY = el<HTMLParagraphElement>("#field-error-years");
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
  clearError(monthlyInput, errM);
  clearError(rateInput, errR);
  clearError(yearsInput, errY);
  const r = calculateDca({
    monthly: monthlyInput.value,
    rate: rateInput.value,
    years: yearsInput.value,
  });
  if (!r.ok) {
    const m = r.error.message;
    if (m.includes("月投")) setError(monthlyInput, errM, m);
    else if (m.includes("年化")) setError(rateInput, errR, m);
    else setError(yearsInput, errY, m);
    setState("empty");
    return;
  }
  const f = formatDca(r.value);
  resultCaption.textContent = `基金定投 · ${yearsInput.value} 年`;
  resultMain.textContent = `终值 ${f.totalValue}`;
  resultDetail.textContent = `总投入 ${f.totalInvest}，总收益 ${f.totalGain}`;
  lastCopy = `定投终值 ${f.totalValue}，收益 ${f.totalGain}`;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  monthlyInput.value = "";
  rateInput.value = "";
  yearsInput.value = "";
  clearError(monthlyInput, errM);
  clearError(rateInput, errR);
  clearError(yearsInput, errY);
  setState("empty");
});
[monthlyInput, rateInput, yearsInput].forEach((i) =>
  i.addEventListener("input", () => {
    goStaleIfComputed();
  }),
);
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
