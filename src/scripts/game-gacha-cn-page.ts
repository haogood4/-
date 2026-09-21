// 抽卡保底计算器页面交互：期望计算走 game-gacha-cn 引擎
import { calcGacha } from "../lib/calculators/game-gacha-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const gameSelect = requireEl<HTMLSelectElement>("#gacha-game");
const pityInput = requireEl<HTMLInputElement>("#gacha-pity");
const guaranteedInput = requireEl<HTMLInputElement>("#gacha-guaranteed");
const errorText = requireEl<HTMLParagraphElement>("#field-error-pity");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

let lastText = "";

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(pityInput, errorText);
  const pity = Number(pityInput.value);
  const r = calcGacha(gameSelect.value, pity, guaranteedInput.checked);
  if (!r.ok) {
    setFieldError(pityInput, errorText, r.error);
    pityInput.focus();
    goStaleIfComputed();
    return;
  }
  const { game, remaining, eGold, expectPulls, note } = r.plan;
  resultCaption.textContent = `${game} · 拿到 UP 角色期望`;
  resultMain.textContent = `约 ${expectPulls} 抽`;
  resultProcess.textContent = `出金期望 ${eGold.toFixed(1)} 抽 · 距硬保底还剩 ${remaining} 抽 · ${note}`;
  lastText = `${game}：拿到 UP 角色约需 ${expectPulls} 抽（出金期望 ${eGold.toFixed(1)} 抽，距硬保底 ${remaining} 抽）\n${note}`;
  setState("computed");
}

function handleReset(): void {
  gameSelect.value = "genshin";
  pityInput.value = "0";
  guaranteedInput.checked = false;
  clearFieldError(pityInput, errorText);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && pityInput.value !== "") {
    clearFieldError(pityInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
pityInput.addEventListener("input", onFieldInput);
gameSelect.addEventListener("change", goStaleIfComputed);
guaranteedInput.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
