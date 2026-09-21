// JWT 解码页面交互（解码/过期判断在引擎纯函数内；验签需服务端，页面不实现）
import { decodeJwt } from "../lib/calculators/jwt-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const tokenInput = requireEl<HTMLTextAreaElement>("#jwt-token");
const errorText = requireEl<HTMLParagraphElement>("#field-error-token");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastPayloadJson = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(tokenInput, errorText);
  const result = decodeJwt(tokenInput.value);
  if (!result.ok) {
    setFieldError(tokenInput, errorText, result.error);
    tokenInput.focus();
    goStaleIfComputed();
    return;
  }
  lastPayloadJson = JSON.stringify(result.payload, null, 2);
  const expInfo =
    result.expiresIn === null
      ? "无 exp 字段"
      : result.expired
        ? `已过期 ${Math.abs(result.expiresIn)} 秒`
        : `剩余 ${result.expiresIn} 秒`;
  const alg =
    typeof result.header.alg === "string" ? result.header.alg : "未知";
  resultCaption.textContent = result.expired
    ? "令牌已过期"
    : "解码成功（未过期）";
  resultMain.textContent = lastPayloadJson;
  resultProcess.textContent = `算法 ${alg} · 签名 ${result.signature.slice(0, 8)}… · ${expInfo} · 仅解码未验签`;
  setState("computed");
}

function handleReset(): void {
  tokenInput.value = "";
  clearFieldError(tokenInput, errorText);
  lastPayloadJson = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && tokenInput.value.trim() !== "") {
    clearFieldError(tokenInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
tokenInput.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastPayloadJson);
bindShareButton(shareBtn);

setState("empty");
