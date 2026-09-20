// 文本处理页面交互
import { transformText } from "../lib/calculators/text-transform";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const textInput = requireEl<HTMLTextAreaElement>("#text");
const err_text = requireEl<HTMLParagraphElement>("#field-error-text");
const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("button[data-mode]"),
);
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

const MODE_LABEL: Record<string, string> = {
  upper: "转大写",
  lower: "转小写",
  nospace: "去除所有空格",
  noline: "去除换行",
  trim: "首尾去空白",
};

function apply(mode: string) {
  clearFieldError(textInput, err_text);
  const r = transformText({ text: textInput.value }, mode as "upper");
  if (!r.ok) {
    setFieldError(textInput, err_text, r.error.message);
    setState("empty");
    return;
  }
  resultCaption.textContent = `${MODE_LABEL[mode] ?? mode}结果`;
  resultMain.textContent = r.value.output || "（空）";
  resultDetail.textContent = `Unicode 字符数：${r.value.chars}`;
  lastCopy = r.value.output;
  setState("computed");
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => apply(btn.dataset.mode ?? ""));
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  clearFieldError(textInput, err_text);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");