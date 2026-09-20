// 跨行转账手续费计算器页面交互（外部脚本）
import { calculateTransferFee } from "../lib/calculators/interbank-transfer-fee";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputAmount = requireEl<HTMLInputElement>("#input-amount");
const selectChannel = requireEl<HTMLSelectElement>("#input-channel");
const errorAmount = requireEl<HTMLParagraphElement>("#field-error-amount");
const errorChannel = requireEl<HTMLParagraphElement>("#field-error-channel");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(inputAmount, errorAmount);
  clearFieldError(selectChannel, errorChannel);

  const result = calculateTransferFee({
    amount: inputAmount.value,
    channel: selectChannel.value,
  });
  if (!result.ok) {
    const msg = result.error.message;
    if (result.error.field === "channel") {
      setFieldError(selectChannel, errorChannel, msg);
    } else {
      setFieldError(inputAmount, errorAmount, msg);
    }
    goStaleIfComputed();
    return;
  }

  const channelText =
    selectChannel.selectedOptions[0]?.textContent ?? selectChannel.value;
  resultCaption.textContent = `跨行转账 ${inputAmount.value.trim()} 元 · ${channelText}`;
  resultMain.textContent = `手续费 ¥${result.fee.toFixed(2)} | 柜台指导价对照 ¥${result.counterFee.toFixed(2)}`;
  resultProcess.textContent = `${result.formulaText}。${result.noteText}`;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputAmount.value = "";
  selectChannel.value = "mobile";
  clearFieldError(inputAmount, errorAmount);
  clearFieldError(selectChannel, errorChannel);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorAmount.hidden && inputAmount.value.trim() !== "")
    clearFieldError(inputAmount, errorAmount);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputAmount.addEventListener("input", onFieldInput);
selectChannel.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
