// HTML 实体编码/解码页面交互：命名实体表 lazy fetch（模块级 Promise 缓存，
// 加载失败时降级为仅数值/核心实体解码，不阻断主流程）。
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
  type EntityMap,
} from "../lib/calculators/html-entity-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

let namedPromise: Promise<EntityMap | null> | null = null;

function loadNamed(): Promise<EntityMap | null> {
  if (!namedPromise) {
    namedPromise = fetch("/data/html-entities.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EntityMap>;
      })
      .catch(() => {
        namedPromise = null; // 失败后允许下次重试
        return null;
      });
  }
  return namedPromise;
}

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#entity-text");
const modeSelect = requireEl<HTMLSelectElement>("#entity-mode");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");

let lastOutput = "";

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
    setFieldError(textInput, errorText, "请输入要处理的文本");
    textInput.focus();
    goStaleIfComputed();
    return;
  }
  const decode = modeSelect.value === "decode";
  let output: string;
  let note = "";
  if (decode) {
    const named = await loadNamed();
    if (named === null) {
      note = " · 实体表加载失败，已降级为核心/数值实体";
    }
    output = decodeHtmlEntities(text, named ?? undefined);
  } else {
    output = encodeHtmlEntities(text);
  }
  lastOutput = output;
  resultCaption.textContent = decode ? "解码完成" : "编码完成";
  resultMain.textContent = output;
  resultProcess.textContent = `${decode ? "解码" : "编码"} ${text.length} 字符 → 输出 ${output.length} 字符${note}`;
  setState("computed");
}

function handleReset(): void {
  textInput.value = "";
  modeSelect.value = "encode";
  clearFieldError(textInput, errorText);
  lastOutput = "";
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
modeSelect.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastOutput);
bindShareButton(shareBtn);

setState("empty");
