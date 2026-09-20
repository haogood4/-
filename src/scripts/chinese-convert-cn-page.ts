// 繁简转换页面交互
import {
  convertChinese,
  type ConvertDirection,
} from "../lib/calculators/chinese-convert-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const textInput = requireEl<HTMLTextAreaElement>("#text");
const err_text = requireEl<HTMLParagraphElement>("#field-error-text");
const dirButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("button[data-dir]"),
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

const DIR_LABEL: Record<string, string> = {
  s2t: "简→繁",
  t2s: "繁→简",
};

function apply(dir: string) {
  clearFieldError(textInput, err_text);
  const r = convertChinese({ text: textInput.value }, dir as ConvertDirection);
  if (!r.ok) {
    setFieldError(textInput, err_text, r.error.message);
    setState("empty");
    return;
  }
  resultCaption.textContent = `${DIR_LABEL[dir] ?? dir}结果（仅供参考）`;
  resultMain.textContent = r.value.output || "（空）";
  const srcChars = [...textInput.value].length;
  resultDetail.textContent = `原文 ${srcChars} 字符 · 结果 ${r.value.chars} 字符 · 转换 ${r.value.converted} 字`;
  lastCopy = r.value.output;
  setState("computed");
}

dirButtons.forEach((btn) => {
  btn.addEventListener("click", () => apply(btn.dataset.dir ?? ""));
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  clearFieldError(textInput, err_text);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
