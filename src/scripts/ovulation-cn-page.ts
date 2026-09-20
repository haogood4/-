// 排卵期计算器页面交互（样板见 _page-kit.ts）
import {
  calculateOvulation,
  formatOvulation,
} from "../lib/calculators/ovulation-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const lastPeriodInput = requireEl<HTMLInputElement>("#lastPeriod");
const cycleInput = requireEl<HTMLInputElement>("#cycle");
const err_lastPeriod = requireEl<HTMLParagraphElement>(
  "#field-error-lastPeriod",
);
const err_cycle = requireEl<HTMLParagraphElement>("#field-error-cycle");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(lastPeriodInput, err_lastPeriod);
  clearFieldError(cycleInput, err_cycle);
  const r = calculateOvulation({
    lastPeriod: lastPeriodInput.value,
    cycle: cycleInput.value,
  });
  if (!r.ok) {
    setFieldError(lastPeriodInput, err_lastPeriod, r.error.message);
    setState("empty");
    return;
  }
  const f = formatOvulation(r.value);
  resultCaption.textContent = "排卵期计算器";
  resultMain.textContent = String(f.ovulationDate ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent ?? "";
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  lastPeriodInput.value = "";
  cycleInput.value = "";
  clearFieldError(lastPeriodInput, err_lastPeriod);
  clearFieldError(cycleInput, err_cycle);
  setState("empty");
});
lastPeriodInput.addEventListener("input", goStaleIfComputed);
cycleInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
