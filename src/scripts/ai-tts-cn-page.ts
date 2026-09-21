// 文字转语音页面交互：配置校验走 ai-tts-cn 引擎，实际播报走 speechSynthesis
import { buildVoiceConfig } from "../lib/calculators/ai-tts-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#tts-text");
const rateSelect = requireEl<HTMLSelectElement>("#tts-rate");
const pitchSelect = requireEl<HTMLSelectElement>("#tts-pitch");
const langSelect = requireEl<HTMLSelectElement>("#tts-lang");
const stopBtn = requireEl<HTMLButtonElement>("#stop-btn");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

const synth =
  typeof window !== "undefined" ? window.speechSynthesis : undefined;
const supported =
  typeof synth !== "undefined" &&
  typeof SpeechSynthesisUtterance !== "undefined";

let lastText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

function showUnsupported(): void {
  setFieldError(
    textInput,
    errorText,
    "当前浏览器不支持语音合成，请改用 Chrome、Edge 或 Safari",
  );
}

function stopSpeaking(): void {
  synth?.cancel();
}

function speak(text: string, rate: number, pitch: number, lang: string): void {
  if (!synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.lang = lang;
  synth.speak(utter);
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  if (!supported) {
    showUnsupported();
    return;
  }
  clearFieldError(textInput, errorText);
  const r = buildVoiceConfig(textInput.value, {
    rate: Number(rateSelect.value),
    pitch: Number(pitchSelect.value),
    lang: langSelect.value,
  });
  if (!r.ok) {
    setFieldError(textInput, errorText, r.error);
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  const { config, charCount, estSeconds } = r.plan;
  lastText = config.text;
  stopSpeaking();
  speak(config.text, config.rate, config.pitch, config.lang);
  resultCaption.textContent = "已开始朗读";
  resultMain.textContent = `预计时长约 ${estSeconds} 秒（${charCount} 字）`;
  resultProcess.textContent = `语速 ${config.rate}x · 音调 ${config.pitch} · 语言 ${config.lang}`;
  setState("computed");
}

function handleReset(): void {
  stopSpeaking();
  textInput.value = "";
  rateSelect.value = "1";
  pitchSelect.value = "1";
  langSelect.value = "zh-CN";
  clearFieldError(textInput, errorText);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!errorText.hidden && textInput.value !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
stopBtn.addEventListener("click", stopSpeaking);
textInput.addEventListener("input", onFieldInput);
for (const el of [rateSelect, pitchSelect, langSelect]) {
  el.addEventListener("change", goStaleIfComputed);
}

if (!supported) {
  stopBtn.disabled = true;
}

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
