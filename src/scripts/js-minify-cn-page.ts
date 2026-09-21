// JS 压缩/美化页面交互（词法引擎在纯函数内）
import { beautifyJs, minifyJs } from "../lib/calculators/js-minify-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#js-source");
const modeSelect = requireEl<HTMLSelectElement>("#js-mode");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastOutput = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(textInput, errorText);
  const src = textInput.value;
  if (src.trim() === "") {
    setFieldError(textInput, errorText, "请粘贴要处理的 JavaScript 代码");
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  const minify = modeSelect.value === "minify";
  let output: string;
  try {
    output = minify ? minifyJs(src) : beautifyJs(src);
  } catch {
    setFieldError(
      textInput,
      errorText,
      "处理失败：请检查代码（字符串/模板字符串是否闭合）",
    );
    goStaleIfComputed();
    return;
  }
  lastOutput = output;
  resultCaption.textContent = minify ? "压缩完成" : "美化完成";
  resultMain.textContent = output;
  const ratio =
    src.length > 0 ? Math.round((output.length / src.length) * 100) : 100;
  resultProcess.textContent = `${src.length} 字符 → ${output.length} 字符（${ratio}%）`;
  setState("computed");
}

function handleReset(): void {
  textInput.value = "";
  modeSelect.value = "minify";
  clearFieldError(textInput, errorText);
  lastOutput = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && textInput.value.trim() !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
textInput.addEventListener("input", onFieldInput);
modeSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastOutput);
bindShareButton(shareBtn);

setState("empty");
