// JSON 格式化/校验页面交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import { formatJson, type JsonMode } from "../lib/calculators/json-format-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const textInput = requireEl<HTMLTextAreaElement>("#text");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const modeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("button[data-mode]"),
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

const MODE_LABEL: Record<JsonMode, string> = {
  pretty: "格式化",
  minify: "压缩",
};

function apply(mode: JsonMode): void {
  clearFieldError(textInput, errorText);
  const r = formatJson({ input: textInput.value, mode });
  if (!r.ok) {
    setFieldError(textInput, errorText, r.error.message);
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  resultCaption.textContent = `${MODE_LABEL[mode]}结果`;
  resultMain.textContent = r.value.output;
  resultProcess.textContent = `输出字符数：${r.value.output.length}`;
  lastCopy = r.value.output;
  setState("computed");
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () =>
    apply((btn.dataset.mode ?? "pretty") as JsonMode),
  );
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  clearFieldError(textInput, errorText);
  lastCopy = "";
  setState("empty");
});

textInput.addEventListener("input", () => {
  if (!errorText.hidden && textInput.value.trim() !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
});

bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);

setState("empty");
