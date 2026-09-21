// 语音转文字页面交互：识别走 webkitSpeechRecognition，片段合并走 ai-stt-cn 引擎
import { chunksToText, countCodePoints } from "../lib/calculators/ai-stt-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

// ---------- SpeechRecognition 最小结构类型（避免 any） ----------
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

const Ctor =
  (window as unknown as SpeechRecognitionWindow).SpeechRecognition ??
  (window as unknown as SpeechRecognitionWindow).webkitSpeechRecognition;

const form = requireEl<HTMLFormElement>("#calc-form");
const langSelect = requireEl<HTMLSelectElement>("#stt-lang");
const startBtn = requireEl<HTMLButtonElement>("#start-btn");
const stopBtn = requireEl<HTMLButtonElement>("#stop-btn");
const errorText = requireEl<HTMLParagraphElement>("#field-error-lang");
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

const chunks: string[] = [];
let recognition: SpeechRecognitionLike | null = null;
let recognizing = false;
let interim = "";

function currentText(): string {
  return chunksToText([...chunks, interim]);
}

function refresh(caption: string): void {
  const text = currentText();
  resultCaption.textContent = caption;
  resultMain.textContent = text;
  resultProcess.textContent = `已识别 ${chunks.length} 段 · 共 ${countCodePoints(text)} 字`;
  if (text !== "") setState("computed");
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "麦克风权限被拒绝，请在浏览器地址栏允许麦克风后重试",
  "service-not-allowed": "语音识别服务不可用，请检查系统麦克风设置",
  "no-speech": "没有检测到语音，请靠近麦克风再试",
  network: "网络异常，语音识别服务需要联网",
  "audio-capture": "未检测到可用麦克风设备",
};

function handleError(event: { error: string }): void {
  if (event.error === "no-speech" || event.error === "aborted") return;
  const msg = ERROR_MESSAGES[event.error] ?? `识别出错（${event.error}）`;
  setFieldError(langSelect, errorText, msg);
}

function handleEnd(): void {
  recognizing = false;
  interim = "";
  startBtn.disabled = false;
  stopBtn.disabled = true;
  refresh(chunks.length > 0 ? "识别完成，可复制或继续录制" : "未识别到内容");
}

function startRecognition(): void {
  if (!Ctor) {
    setFieldError(
      langSelect,
      errorText,
      "当前浏览器不支持语音识别，请改用 Chrome 或 Edge",
    );
    return;
  }
  clearFieldError(langSelect, errorText);
  recognition = new Ctor();
  recognition.lang = langSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (e) => {
    interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i];
      if (!result) continue;
      const alt = result[0];
      if (!alt) continue;
      if (result.isFinal) {
        chunks.push(alt.transcript);
      } else {
        interim = alt.transcript;
      }
    }
    refresh("识别中，点击「停止识别」结束");
  };
  recognition.onerror = (e) => handleError(e);
  recognition.onend = () => handleEnd();
  chunks.length = 0;
  interim = "";
  try {
    recognition.start();
    recognizing = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    refresh("聆听中，请开始说话…");
  } catch {
    setFieldError(langSelect, errorText, "无法启动录音，请检查麦克风占用情况");
  }
}

function stopRecognition(): void {
  recognition?.stop();
  recognition = null;
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  if (recognizing) {
    stopRecognition();
    return;
  }
  startRecognition();
}

function handleReset(): void {
  stopRecognition();
  recognizing = false;
  chunks.length = 0;
  interim = "";
  langSelect.value = "zh-CN";
  clearFieldError(langSelect, errorText);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setState("empty");
}

form.addEventListener("submit", handleSubmit);
langSelect.addEventListener("change", () => {
  if (!errorText.hidden) clearFieldError(langSelect, errorText);
  goStaleIfComputed();
});
resetBtn.addEventListener("click", handleReset);

if (!Ctor) {
  startBtn.disabled = true;
}

bindCopyButton(copyBtn, () => currentText().trim());
bindShareButton(shareBtn);

setState("empty");
