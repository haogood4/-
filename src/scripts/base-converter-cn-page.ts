// 进制转换计算器页面交互（样板见 _page-kit.ts）
import { convertBase, formatBase } from "../lib/calculators/base-converter-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const valueInput = requireEl<HTMLInputElement>("#value");
const fromBaseSelect = requireEl<HTMLInputElement>("#fromBase");
const toBaseSelect = requireEl<HTMLInputElement>("#toBase");
const err_value = requireEl<HTMLParagraphElement>("#field-error-value");
const err_fromBase = requireEl<HTMLParagraphElement>("#field-error-fromBase");
const err_toBase = requireEl<HTMLParagraphElement>("#field-error-toBase");
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
  clearFieldError(valueInput, err_value);
  clearFieldError(fromBaseSelect, err_fromBase);
  clearFieldError(toBaseSelect, err_toBase);
  const r = convertBase({
    value: valueInput.value,
    fromBase: fromBaseSelect.value,
    toBase: toBaseSelect.value,
  });
  if (!r.ok) {
    setFieldError(valueInput, err_value, r.error.message);
    setState("empty");
    return;
  }
  const f = formatBase(r.value);
  resultCaption.textContent = "进制转换计算器";
  resultMain.textContent = String(f.result ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent ?? "";
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  valueInput.value = "";
  fromBaseSelect.value = "";
  toBaseSelect.value = "";
  clearFieldError(valueInput, err_value);
  clearFieldError(fromBaseSelect, err_fromBase);
  clearFieldError(toBaseSelect, err_toBase);
  setState("empty");
});
valueInput.addEventListener("input", goStaleIfComputed);
fromBaseSelect.addEventListener("input", goStaleIfComputed);
toBaseSelect.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
