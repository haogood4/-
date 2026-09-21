// cron 表达式解析页面交互（解析全在引擎纯函数内）
import { parseCron } from "../lib/calculators/cron-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const exprInput = requireEl<HTMLInputElement>("#cron-expr");
const errorText = requireEl<HTMLParagraphElement>("#field-error-expr");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const FIELD_NAMES = ["分钟", "小时", "日", "月", "星期"];
let lastDesc = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(exprInput, errorText);
  const result = parseCron(exprInput.value);
  if (!result.valid) {
    setFieldError(exprInput, errorText, result.error);
    exprInput.focus();
    goStaleIfComputed();
    return;
  }
  lastDesc = result.desc;
  resultCaption.textContent = "解析成功";
  resultMain.textContent = result.desc;
  resultProcess.textContent = result.fields
    .map((f, i) => `${FIELD_NAMES[i]}[${f.raw}] → ${f.values.join(",")}`)
    .join(" · ");
  setState("computed");
}

function handleReset(): void {
  exprInput.value = "";
  clearFieldError(exprInput, errorText);
  lastDesc = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && exprInput.value.trim() !== "") {
    clearFieldError(exprInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
exprInput.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastDesc);
bindShareButton(shareBtn);

setState("empty");
