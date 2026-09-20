// 汉字转拼音页面交互：懒加载拼音字典（模块级缓存，仅 fetch 一次）+ 引擎调用
import { convertPinyin, type PinyinDict } from "../lib/calculators/pinyin-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#text");
const polyphoneBox = requireEl<HTMLInputElement>("#polyphone");
const dataStatus = requireEl<HTMLParagraphElement>("#data-status");
const errorText = requireEl<HTMLParagraphElement>("#field-error-text");
const calcBtn = requireEl<HTMLButtonElement>("#calc-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");

let lastCopyText = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

// ---------- 懒加载数据表：字典不进 bundle，首次使用时下载并缓存 ----------
let dictPromise: Promise<PinyinDict> | null = null;

function loadDict(): Promise<PinyinDict> {
  if (!dictPromise) {
    dictPromise = fetch("/data/pinyin-dict.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PinyinDict>;
      })
      .catch((err: unknown) => {
        dictPromise = null; // 失败后允许下次点击重试
        throw err;
      });
  }
  return dictPromise;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(textInput, errorText);

  const text = textInput.value;
  if (text.trim() === "") {
    setFieldError(textInput, errorText, "请输入要转换的文本");
    goStaleIfComputed();
    return;
  }

  calcBtn.disabled = true;
  dataStatus.textContent = "正在加载拼音数据（约 370KB，仅首次）…";
  dataStatus.hidden = false;
  try {
    const dict = await loadDict();
    const result = convertPinyin({
      text,
      dict,
      showAllPolyphones: polyphoneBox.checked,
    });
    if (!result.ok) {
      setFieldError(textInput, errorText, result.error.message);
      goStaleIfComputed();
      return;
    }
    const { segments, hasNonHan } = result.value;
    const pinyinLine = segments
      .map((s) => (s.han ? s.pinyin : s.src))
      .join(" ");
    const alignLine = segments
      .map((s) => (s.han ? `${s.src}(${s.pinyin})` : s.src))
      .join("");
    const hanCount = segments.reduce((n, s) => n + (s.han ? 1 : 0), 0);
    resultCaption.textContent = `共 ${segments.length} 字，转换 ${hanCount} 个汉字`;
    resultMain.textContent = pinyinLine;
    resultProcess.textContent = hasNonHan
      ? `${alignLine}（非汉字原样保留）`
      : alignLine;
    lastCopyText = pinyinLine;
    setState("computed");
  } catch {
    setFieldError(textInput, errorText, "数据加载失败，请刷新重试");
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    dataStatus.hidden = true;
  }
}

function handleReset(): void {
  textInput.value = "";
  polyphoneBox.checked = false;
  clearFieldError(textInput, errorText);
  lastCopyText = "";
  setState("empty");
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
textInput.addEventListener("input", () => {
  if (!errorText.hidden && textInput.value.trim() !== "") {
    clearFieldError(textInput, errorText);
  }
  goStaleIfComputed();
});
polyphoneBox.addEventListener("change", goStaleIfComputed);

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
