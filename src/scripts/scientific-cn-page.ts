import {
  calculateScientific,
  formatScientific,
} from "../lib/calculators/scientific-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";
const form = el<HTMLFormElement>("#calc-form");
const expressionInput = el<HTMLInputElement>("#expression");

const err_expression = el<HTMLParagraphElement>("#field-error-expression");
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
  clearError(expressionInput, err_expression);
  const r = calculateScientific({ expression: expressionInput.value });
  if (!r.ok) {
    setError(expressionInput, err_expression, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  const f = formatScientific(v);
  resultCaption.textContent = "科学计算器";
  resultMain.textContent = String(f.value ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent;
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  expressionInput.value = "";

  clearError(expressionInput, err_expression);
  setState("empty");
});
expressionInput?.addEventListener("input", () => {
  goStaleIfComputed();
});
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
