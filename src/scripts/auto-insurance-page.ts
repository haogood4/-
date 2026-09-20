// 车险保费计算器页面交互（外部脚本）
import { calculateAutoInsurance } from "../lib/calculators/auto-insurance";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const selectSeat = requireEl<HTMLSelectElement>("#input-seat");
const selectNoClaim = requireEl<HTMLSelectElement>("#input-noclaim");
const selectClaims = requireEl<HTMLSelectElement>("#input-claims");
const selectRegion = requireEl<HTMLSelectElement>("#input-region");
const inputCommercial = requireEl<HTMLInputElement>("#input-commercial");
const errorCommercial = requireEl<HTMLParagraphElement>(
  "#field-error-commercial",
);
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
  clearFieldError(inputCommercial, errorCommercial);

  const result = calculateAutoInsurance({
    seatType: selectSeat.value,
    noClaimYears: selectNoClaim.value,
    claims: selectClaims.value,
    regionClass: selectRegion.value,
    commercialBase: inputCommercial.value,
  });
  if (!result.ok) {
    // 页面 select 取值恒合法，错误只可能来自商业险基准保费字段
    setFieldError(inputCommercial, errorCommercial, result.error.message);
    goStaleIfComputed();
    return;
  }

  const seatText = selectSeat.value === "under6" ? "6 座以下" : "6 座及以上";
  resultCaption.textContent = `${seatText} · ${selectRegion.selectedOptions[0]?.textContent ?? selectRegion.value}`;
  resultMain.textContent = `交强险 ¥${result.compulsoryPremium.toFixed(2)}（系数 ${result.compulsoryRate}）· 商业险 ¥${result.commercialPremium.toFixed(2)}（NCD ${result.ncdRate}） | 合计保费 ¥${result.totalPremium.toFixed(2)}`;
  resultProcess.textContent = result.formulaText;
  lastCopyText = `${resultCaption.textContent}\n${resultMain.textContent}\n${resultProcess.textContent}`;
  setState("computed");
}

function handleReset(): void {
  selectSeat.value = "under6";
  selectNoClaim.value = "0";
  selectClaims.value = "0";
  selectRegion.value = "E";
  inputCommercial.value = "";
  clearFieldError(inputCommercial, errorCommercial);
  lastCopyText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorCommercial.hidden && inputCommercial.value.trim() !== "")
    clearFieldError(inputCommercial, errorCommercial);
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
inputCommercial.addEventListener("input", onFieldInput);
selectSeat.addEventListener("change", goStaleIfComputed);
selectNoClaim.addEventListener("change", goStaleIfComputed);
selectClaims.addEventListener("change", goStaleIfComputed);
selectRegion.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
