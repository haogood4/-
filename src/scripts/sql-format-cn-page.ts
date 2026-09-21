// SQL 格式化/压缩页面交互（词法与布局全在引擎纯函数内）
import { formatSql, minifySql } from "../lib/calculators/sql-format-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#sql-source");
const modeSelect = requireEl<HTMLSelectElement>("#sql-mode");
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
    setFieldError(textInput, errorText, "请输入 SQL 语句");
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  const format = modeSelect.value === "format";
  const output = format ? formatSql(src) : minifySql(src);
  if (output.trim() === "") {
    setFieldError(textInput, errorText, "未解析到有效 SQL 内容");
    goStaleIfComputed();
    return;
  }
  lastOutput = output;
  resultCaption.textContent = format ? "格式化完成" : "压缩完成";
  resultMain.textContent = output;
  resultProcess.textContent = format
    ? `共 ${output.split("\n").length} 行 · 关键字已大写`
    : `${src.length} 字符 → ${output.length} 字符`;
  setState("computed");
}

function handleReset(): void {
  textInput.value = "";
  modeSelect.value = "format";
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
