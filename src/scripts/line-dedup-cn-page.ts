// 文本行去重页面交互（样板见 _page-kit.ts）
// 注意：input 变化不触发重算（避免大文本抖动），仅点击「去重」触发计算。
import { dedupLines } from "../lib/calculators/line-dedup-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textInput = requireEl<HTMLTextAreaElement>("#text");
const errText = requireEl<HTMLParagraphElement>("#field-error-text");
const trimInput = requireEl<HTMLInputElement>("#opt-trim");
const ignoreCaseInput = requireEl<HTMLInputElement>("#opt-ignore-case");
const removeEmptyInput = requireEl<HTMLInputElement>("#opt-remove-empty");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const outputText = requireEl<HTMLTextAreaElement>("#output-text");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(textInput, errText);
  const text = textInput.value;
  if (!text.trim()) {
    setFieldError(textInput, errText, "请先粘贴要处理的文本（至少一行）");
    setState("empty");
    return;
  }
  const trim = trimInput.checked;
  const ignoreCase = ignoreCaseInput.checked;
  const removeEmpty = removeEmptyInput.checked;

  const r = dedupLines({ text, trim, ignoreCase, removeEmpty });
  if (!r.ok) {
    setFieldError(textInput, errText, r.error.message);
    setState("empty");
    return;
  }
  const v = r.value;
  resultCaption.textContent = "去重结果";
  resultMain.textContent = `共 ${v.total} 行，保留 ${v.kept}，去除 ${v.removed}`;
  resultDetail.textContent = `选项：${trim ? "去首尾空格" : "保留空格"} · ${
    ignoreCase ? "忽略大小写" : "区分大小写"
  } · ${removeEmpty ? "删除空行" : "保留空行"}`;
  outputText.value = v.output;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  trimInput.checked = true;
  ignoreCaseInput.checked = false;
  removeEmptyInput.checked = true;
  outputText.value = "";
  clearFieldError(textInput, errText);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
trimInput.addEventListener("change", goStaleIfComputed);
ignoreCaseInput.addEventListener("change", goStaleIfComputed);
removeEmptyInput.addEventListener("change", goStaleIfComputed);
bindCopyButton(copyBtn, () => outputText.value);
setState("empty");
