// 文本相似度对比页面交互（样板见 _page-kit.ts）
// 注意：input 变化不触发重算（避免大文本 DP 抖动），仅点击「对比」触发计算。
import { compareText } from "../lib/calculators/text-similarity-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const textA = requireEl<HTMLTextAreaElement>("#text-a");
const textB = requireEl<HTMLTextAreaElement>("#text-b");
const errA = requireEl<HTMLParagraphElement>("#field-error-text-a");
const errB = requireEl<HTMLParagraphElement>("#field-error-text-b");
const ignoreCaseInput = requireEl<HTMLInputElement>("#opt-ignore-case");
const ignoreWsInput = requireEl<HTMLInputElement>("#opt-ignore-whitespace");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultVerdict = requireEl<HTMLParagraphElement>("#result-verdict");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

const VERDICT_LABEL: Record<"high" | "medium" | "low", string> = {
  high: "高度相似",
  medium: "中度相似",
  low: "低相似度",
};

function pct(x: number): string {
  return `${(x * 100).toFixed(2)}%`;
}

let lastSummary = "";

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(textA, errA);
  clearFieldError(textB, errB);
  const a = textA.value;
  const b = textB.value;
  if (!a.trim() && !b.trim()) {
    setFieldError(textA, errA, "请先输入要对比的两段文本");
    setState("empty");
    return;
  }
  const ignoreCase = ignoreCaseInput.checked;
  const ignoreWhitespace = ignoreWsInput.checked;

  const r = compareText({ a, b, ignoreCase, ignoreWhitespace });
  if (!r.ok) {
    if (r.error.message.includes("文本 B")) {
      setFieldError(textB, errB, r.error.message);
    } else {
      setFieldError(textA, errA, r.error.message);
    }
    setState("empty");
    return;
  }
  const v = r.value;
  resultCaption.textContent = "文本相似度结果";
  resultMain.textContent = `相似度 ${pct(v.similarity)}`;
  resultVerdict.textContent = `判定：${VERDICT_LABEL[v.verdict]}`;
  resultDetail.textContent =
    `编辑距离 ${v.levenshtein} · Jaccard ${pct(v.jaccard)} · ` +
    `长度 文本A ${v.lengthA} / 文本B ${v.lengthB} 字符`;
  lastSummary = `文本相似度：${pct(v.similarity)}（${VERDICT_LABEL[v.verdict]}）\n编辑距离：${v.levenshtein}\nJaccard 相似度：${pct(v.jaccard)}\n长度：文本A ${v.lengthA} / 文本B ${v.lengthB} 字符`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  textA.value = "";
  textB.value = "";
  ignoreCaseInput.checked = false;
  ignoreWsInput.checked = false;
  clearFieldError(textA, errA);
  clearFieldError(textB, errB);
  setState("empty");
});

textA.addEventListener("input", goStaleIfComputed);
textB.addEventListener("input", goStaleIfComputed);
ignoreCaseInput.addEventListener("change", goStaleIfComputed);
ignoreWsInput.addEventListener("change", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastSummary);
setState("empty");
