// 字数统计计算器页面交互（样板见 _page-kit.ts）
import { countWords, formatWordCount } from "../lib/calculators/word-count-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLInputElement>("#text");
const err_text = requireEl<HTMLParagraphElement>("#field-error-text");
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
  clearFieldError(textInput, err_text);
  const r = countWords({ text: textInput.value });
  if (!r.ok) {
    setFieldError(textInput, err_text, r.error.message);
    setState("empty");
    return;
  }
  const f = formatWordCount(r.value);
  resultCaption.textContent = "字数统计计算器";
  resultMain.textContent = String(f.chars ?? "");
  resultDetail.textContent = JSON.stringify(f).slice(0, 200);
  lastCopy = resultMain.textContent ?? "";
  setState("computed");
});
resetBtn.addEventListener("click", () => {
  textInput.value = "";
  clearFieldError(textInput, err_text);
  setState("empty");
});
textInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
