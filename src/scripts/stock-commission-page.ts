// 股票佣金计算器页面交互（外部脚本）
import { calculateStockCommission } from "../lib/calculators/stock-commission";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputPrice = requireEl<HTMLInputElement>("#input-price");
const inputShares = requireEl<HTMLInputElement>("#input-shares");
const selectDirection = requireEl<HTMLSelectElement>("#input-direction");
const inputRate = requireEl<HTMLInputElement>("#input-rate");
const inputMinFee = requireEl<HTMLInputElement>("#input-min-fee");
const inputStampTax = requireEl<HTMLInputElement>("#input-stamp-tax");
const inputTransferFee = requireEl<HTMLInputElement>("#input-transfer-fee");
const errorPrice = requireEl<HTMLParagraphElement>("#field-error-price");
const errorShares = requireEl<HTMLParagraphElement>("#field-error-shares");
const errorRate = requireEl<HTMLParagraphElement>("#field-error-rate");
const errorMinFee = requireEl<HTMLParagraphElement>("#field-error-min-fee");
const errorStamp = requireEl<HTMLParagraphElement>("#field-error-stamp");
const errorTransfer = requireEl<HTMLParagraphElement>("#field-error-transfer");
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
  clearFieldError(inputPrice, errorPrice);
  clearFieldError(inputShares, errorShares);
  clearFieldError(inputRate, errorRate);
  clearFieldError(inputMinFee, errorMinFee);
  clearFieldError(inputStampTax, errorStamp);
  clearFieldError(inputTransferFee, errorTransfer);

  const result = calculateStockCommission({
    price: inputPrice.value,
    shares: inputShares.value,
    direction: selectDirection.value,
    rate: inputRate.value,
    minFee: inputMinFee.value,
    stampTaxRate: inputStampTax.value,
    transferFeeRate: inputTransferFee.value,
  });
  if (!result.ok) {
    const msg = result.error.message;
    const code = result.error.code;
    if (code === "INVALID_RATE") {
      // 三个费率字段都用 INVALID_RATE；按当前页面输入字段优先高亮第一个
      setFieldError(inputRate, errorRate, msg);
    } else {
      setFieldError(inputPrice, errorPrice, msg);
    }
    goStaleIfComputed();
    return;
  }

  const dirText = selectDirection.value === "buy" ? "买入" : "卖出";
  const price = inputPrice.value.trim();
  const shares = inputShares.value.trim();
  resultCaption.textContent = `${dirText} ${price} 元 × ${shares} 股 @ ${inputRate.value}‱`;
  resultMain.textContent = `券商佣金 ¥${result.brokerFee.toFixed(2)} · 过户费 ¥${result.transferFee.toFixed(2)} · 印花税 ¥${result.stampTax.toFixed(2)} | 合计费用 ¥${result.totalCost.toFixed(2)}`;
  resultProcess.textContent = result.breakdownText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  inputPrice.value = "";
  inputShares.value = "";
  selectDirection.value = "buy";
  inputRate.value = "2.5";
  inputMinFee.value = "5";
  inputStampTax.value = "5";
  inputTransferFee.value = "0.1";
  clearFieldError(inputPrice, errorPrice);
  clearFieldError(inputShares, errorShares);
  clearFieldError(inputRate, errorRate);
  clearFieldError(inputMinFee, errorMinFee);
  clearFieldError(inputStampTax, errorStamp);
  clearFieldError(inputTransferFee, errorTransfer);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorPrice.hidden && inputPrice.value.trim() !== "")
    clearFieldError(inputPrice, errorPrice);
  if (!errorShares.hidden && inputShares.value.trim() !== "")
    clearFieldError(inputShares, errorShares);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputPrice.addEventListener("input", onFieldInput);
inputShares.addEventListener("input", onFieldInput);
selectDirection.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
