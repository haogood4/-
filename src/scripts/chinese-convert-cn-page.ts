// 繁简转换页面交互
// 字库数据外置于 /data/chinese-convert.json（不进 JS bundle），首次点击转换时
// fetch 加载并构建双向 Map，之后复用缓存；加载失败提示刷新重试。
import {
  buildMaps,
  convertChinese,
  type ConvData,
  type ConvMaps,
  type ConvertDirection,
} from "../lib/calculators/chinese-convert-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const textInput = requireEl<HTMLTextAreaElement>("#text");
const err_text = requireEl<HTMLParagraphElement>("#field-error-text");
const dirButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>("button[data-dir]"),
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

const DIR_LABEL: Record<string, string> = {
  s2t: "简→繁",
  t2s: "繁→简",
};

// ---------- 懒加载字库：数据不进 bundle，首次使用时下载并缓存 ----------
let dataPromise: Promise<ConvData | null> | null = null;
let maps: ConvMaps | null = null;

function loadData(): Promise<ConvData | null> {
  if (!dataPromise) {
    dataPromise = fetch("/data/chinese-convert.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ConvData>;
      })
      .then((data) => {
        if (
          !Array.isArray(data.pairSimp) ||
          !Array.isArray(data.pairTrad) ||
          !Array.isArray(data.skip) ||
          data.pairSimp.length !== data.pairTrad.length
        )
          throw new Error("bad data");
        return data;
      })
      .catch(() => null); // 失败缓存 null，提示用户刷新后重试
  }
  return dataPromise;
}

async function apply(dir: string): Promise<void> {
  clearFieldError(textInput, err_text);
  if (!maps) {
    const data = await loadData();
    if (!data) {
      setFieldError(textInput, err_text, "数据加载失败，请刷新页面重试");
      setState("empty");
      return;
    }
    maps = buildMaps(data);
  }
  const r = convertChinese(
    { text: textInput.value },
    dir as ConvertDirection,
    maps,
  );
  if (!r.ok) {
    setFieldError(textInput, err_text, r.error.message);
    setState("empty");
    return;
  }
  resultCaption.textContent = `${DIR_LABEL[dir] ?? dir}结果（仅供参考）`;
  resultMain.textContent = r.value.output || "（空）";
  const srcChars = [...textInput.value].length;
  resultDetail.textContent = `原文 ${srcChars} 字符 · 结果 ${r.value.chars} 字符 · 转换 ${r.value.converted} 字`;
  lastCopy = r.value.output;
  setState("computed");
}

dirButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    void apply(btn.dataset.dir ?? "");
  });
});

resetBtn.addEventListener("click", () => {
  textInput.value = "";
  clearFieldError(textInput, err_text);
  setState("empty");
});

textInput.addEventListener("input", goStaleIfComputed);
bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
