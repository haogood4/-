// 单价比较计算器页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { compareUnitPrice } from "../lib/calculators/unit-price";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const inputPriceA = requireEl<HTMLInputElement>("#price-a");
const inputQtyA = requireEl<HTMLInputElement>("#qty-a");
const inputPriceB = requireEl<HTMLInputElement>("#price-b");
const inputQtyB = requireEl<HTMLInputElement>("#qty-b");
const errorA = requireEl<HTMLParagraphElement>("#field-error-a");
const errorB = requireEl<HTMLParagraphElement>("#field-error-b");
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

function clearAllErrors(): void {
  clearFieldError(inputPriceA, errorA);
  clearFieldError(inputQtyA, errorA);
  clearFieldError(inputPriceB, errorB);
  clearFieldError(inputQtyB, errorB);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearAllErrors();

  const result = compareUnitPrice(
    inputPriceA.value,
    inputQtyA.value,
    inputPriceB.value,
    inputQtyB.value,
  );
  if (!result.ok) {
    const code = result.error.code;
    if (code === "NON_POSITIVE_QTY") {
      setFieldError(inputQtyA, errorA, result.error.message);
      inputQtyA.focus();
    } else {
      setFieldError(inputPriceA, errorA, result.error.message);
      inputPriceA.focus();
    }
    goStaleIfComputed();
    return;
  }

  const betterText =
    result.better === "a"
      ? "商品 A 更划算"
      : result.better === "b"
        ? "商品 B 更划算"
        : "两家单价相同";

  resultCaption.textContent = `${inputPriceA.value.trim()} ÷ ${inputQtyA.value.trim()} = ${result.unitAText}；${inputPriceB.value.trim()} ÷ ${inputQtyB.value.trim()} = ${result.unitBText}`;
  resultMain.textContent = betterText;
  resultProcess.textContent = result.processText;
  lastCopyText = `${resultCaption.textContent}：${betterText}（${result.processText}）`;
  setState("computed");
}

function handleReset(): void {
  inputPriceA.value = "";
  inputQtyA.value = "";
  inputPriceB.value = "";
  inputQtyB.value = "";
  clearAllErrors();
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(
  input: HTMLInputElement,
  err: HTMLParagraphElement,
): void {
  if (!err.hidden && input.value.trim() !== "") {
    clearFieldError(input, err);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputPriceA.addEventListener("input", () => onFieldInput(inputPriceA, errorA));
inputQtyA.addEventListener("input", () => onFieldInput(inputQtyA, errorA));
inputPriceB.addEventListener("input", () => onFieldInput(inputPriceB, errorB));
inputQtyB.addEventListener("input", () => onFieldInput(inputQtyB, errorB));

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
