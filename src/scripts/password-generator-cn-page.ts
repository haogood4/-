// 随机密码生成器页面交互
import { generatePassword } from "../lib/calculators/password-generator";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const lengthInput = requireEl<HTMLInputElement>("#length");
const lengthVal = requireEl<HTMLSpanElement>("#length-val");
const upperInput = requireEl<HTMLInputElement>("#upper");
const lowerInput = requireEl<HTMLInputElement>("#lower");
const digitInput = requireEl<HTMLInputElement>("#digit");
const symbolInput = requireEl<HTMLInputElement>("#symbol");
const err_length = requireEl<HTMLParagraphElement>("#field-error-length");
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

lengthInput.addEventListener("input", () => {
  lengthVal.textContent = lengthInput.value;
  goStaleIfComputed();
});
[upperInput, lowerInput, digitInput, symbolInput].forEach((el) =>
  el.addEventListener("change", goStaleIfComputed),
);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(lengthInput, err_length);
  const length = parseInt(lengthInput.value, 10);
  const options = {
    length,
    includeUpper: upperInput.checked,
    includeLower: lowerInput.checked,
    includeDigit: digitInput.checked,
    includeSymbol: symbolInput.checked,
  };
  const randoms = new Uint32Array(length);
  crypto.getRandomValues(randoms);
  const r = generatePassword(options, randoms);
  if (!r.ok) {
    setFieldError(lengthInput, err_length, r.error.message);
    setState("empty");
    return;
  }
  const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
  resultCaption.textContent = "您的密码（点击「复制密码」保存）";
  resultMain.textContent = r.value.password;
  resultMain.classList.add("mono");
  resultDetail.textContent = `长度 ${r.value.password.length} 位 · ${[
    options.includeUpper && "大写",
    options.includeLower && "小写",
    options.includeDigit && "数字",
    options.includeSymbol && "符号",
  ]
    .filter(Boolean)
    .join(" + ")}`;
  lastCopy = r.value.password;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  lengthInput.value = "16";
  lengthVal.textContent = "16";
  upperInput.checked = true;
  lowerInput.checked = true;
  digitInput.checked = true;
  symbolInput.checked = true;
  clearFieldError(lengthInput, err_length);
  setState("empty");
});

bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
