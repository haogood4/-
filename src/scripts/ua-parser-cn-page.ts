// UA 解析页面交互（正则表全在引擎纯函数内）
import { parseUA } from "../lib/calculators/ua-parser-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const uaInput = requireEl<HTMLTextAreaElement>("#ua-text");
const errorText = requireEl<HTMLParagraphElement>("#field-error-ua");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastSummary = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(uaInput, errorText);
  const ua = uaInput.value.trim();
  if (ua === "") {
    setFieldError(uaInput, errorText, "请粘贴 User-Agent 字符串");
    uaInput.focus();
    goStaleIfComputed();
    return;
  }
  const r = parseUA(ua);
  lastSummary = `浏览器：${r.browser} ${r.browserVersion}\n系统：${r.os}\n设备：${r.device}`;
  resultCaption.textContent = "解析结果";
  resultMain.textContent = `${r.browser}${r.browserVersion ? ` ${r.browserVersion}` : ""}`;
  resultProcess.textContent = `${r.os} · ${r.device}`;
  setState("computed");
}

function handleReset(): void {
  uaInput.value = "";
  clearFieldError(uaInput, errorText);
  lastSummary = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && uaInput.value.trim() !== "") {
    clearFieldError(uaInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
uaInput.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastSummary);
bindShareButton(shareBtn);

setState("empty");
