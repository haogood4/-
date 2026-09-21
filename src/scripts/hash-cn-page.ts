// 哈希生成器页面交互（样板见 _page-kit.ts；MD5 同步、SHA 系列走 crypto.subtle 异步）
import { md5Hex, sha1Hex, sha256Hex } from "../lib/calculators/hash-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#hash-text");
const algoSelect = requireEl<HTMLSelectElement>("#hash-algo");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const ALGO_NAMES: Record<string, string> = {
  md5: "MD5",
  sha1: "SHA-1",
  sha256: "SHA-256",
};

let lastHex = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(textInput, errorText);
  const text = textInput.value;
  if (text === "") {
    setFieldError(textInput, errorText, "请输入要计算哈希的文本");
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  const algo = algoSelect.value;
  let hex: string;
  try {
    if (algo === "md5") {
      hex = md5Hex(text);
    } else if (algo === "sha1") {
      hex = await sha1Hex(text);
    } else {
      hex = await sha256Hex(text);
    }
  } catch {
    setFieldError(textInput, errorText, "计算失败，请重试");
    goStaleIfComputed();
    return;
  }
  lastHex = hex;
  resultCaption.textContent = `${ALGO_NAMES[algo] ?? algo} 哈希已生成`;
  resultMain.textContent = hex;
  resultProcess.textContent = `输入 ${text.length} 字符 · 输出 ${hex.length} 位十六进制`;
  setState("computed");
}

function handleReset(): void {
  textInput.value = "";
  algoSelect.value = "md5";
  clearFieldError(textInput, errorText);
  lastHex = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && textInput.value !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
textInput.addEventListener("input", onFieldInput);
algoSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastHex);
bindShareButton(shareBtn);

setState("empty");
