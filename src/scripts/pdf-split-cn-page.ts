// PDF 拆分页面交互 — 占位工具：完整功能开发中，暂提供接口契约。
// 引擎 splitPdf 固定返回 NOT_IMPLEMENTED，页面据实展示「开发中」提示；
// 页码范围解析为本页辅助逻辑，未来真实现时迁入引擎层补单测。
import { splitPdf } from "../lib/calculators/pdf-split-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const fileInput = requireEl<HTMLInputElement>("#pdf-input");
const errFile = requireEl<HTMLParagraphElement>("#field-error-file");
const modeSelect = requireEl<HTMLSelectElement>("#split-mode");
const nInput = requireEl<HTMLInputElement>("#split-n");
const errN = requireEl<HTMLParagraphElement>("#field-error-n");
const rangesInput = requireEl<HTMLInputElement>("#split-ranges");
const errRanges = requireEl<HTMLParagraphElement>("#field-error-ranges");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultProcess = requireEl<HTMLParagraphElement>("#result-process");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const shareBtn = requireEl<HTMLButtonElement>("#share-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  resultBox: requireEl("#result"),
  buttons: [copyBtn, shareBtn],
});

let lastCopy = "";

/** 解析页码范围文本（如 "1-3,5"）为升序去重页码数组；非法返回 null */
function parseRanges(raw: string): number[] | null {
  const out = new Set<number>();
  for (const part of raw.split(/[,，]/)) {
    const seg = part.trim();
    if (!seg) continue;
    const m = /^(\d+)(?:-(\d+))?$/.exec(seg);
    if (!m) return null;
    const a = Number(m[1]);
    const b = m[2] === undefined ? a : Number(m[2]);
    if (a < 1 || b < 1 || Math.max(a, b) > 10000) return null;
    for (let p = Math.min(a, b); p <= Math.max(a, b); p++) out.add(p);
  }
  const list = [...out].sort((x, y) => x - y);
  return list.length > 0 ? list : null;
}

function syncModeFields(): void {
  const isEveryN = modeSelect.value === "every-n";
  nInput.hidden = !isEveryN;
  rangesInput.hidden = isEveryN;
  // 切换模式时同步收起两侧错误提示，避免旧错误残留到已隐藏字段
  errN.hidden = true;
  errRanges.hidden = true;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(fileInput, errFile);
  clearFieldError(nInput, errN);
  clearFieldError(rangesInput, errRanges);
  const count = fileInput.files?.length ?? 0;
  if (count < 1) {
    setFieldError(fileInput, errFile, "请先选择 1 个 PDF 文件（不会上传）");
    return;
  }
  const mode = modeSelect.value === "ranges" ? "ranges" : "every-n";
  let param: number | number[];
  if (mode === "every-n") {
    const n = Number(nInput.value);
    if (!Number.isInteger(n) || n < 1 || n > 1000) {
      setFieldError(nInput, errN, "每份页数须为 1 ~ 1000 的整数");
      return;
    }
    param = n;
  } else {
    const ranges = parseRanges(rangesInput.value);
    if (!ranges) {
      setFieldError(
        rangesInput,
        errRanges,
        '页码格式形如 "1-3,5,8-10"，页码须为 1 ~ 10000',
      );
      return;
    }
    param = ranges;
  }
  const result = splitPdf({ mode, param });
  const contract = result.ok
    ? "placeholder（占位保留）"
    : `${result.error.code}（${result.error.message}）`;
  const paramText = mode === "every-n" ? String(param) : JSON.stringify(param);
  resultCaption.textContent = "完整功能开发中";
  resultMain.textContent = "PDF 拆分功能正在开发，暂提供接口契约";
  resultProcess.textContent = `契约调用 splitPdf({ mode: "${mode}", param: ${paramText} }) → ${contract}；文件内容未被读取`;
  lastCopy = `PDF 拆分（开发中）：契约 splitPdf({ mode, param })，当前返回 NOT_IMPLEMENTED；所选文件未被解析或上传。`;
  setState("computed");
}

function handleReset(): void {
  fileInput.value = "";
  modeSelect.value = "every-n";
  nInput.value = "1";
  rangesInput.value = "";
  clearFieldError(fileInput, errFile);
  clearFieldError(nInput, errN);
  clearFieldError(rangesInput, errRanges);
  syncModeFields();
  lastCopy = "";
  setState("empty");
}

function onFieldChange(): void {
  if (!errFile.hidden) clearFieldError(fileInput, errFile);
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
fileInput.addEventListener("change", onFieldChange);
modeSelect.addEventListener("change", () => {
  syncModeFields();
  goStaleIfComputed();
});
nInput.addEventListener("input", () => {
  clearFieldError(nInput, errN);
  goStaleIfComputed();
});
rangesInput.addEventListener("input", () => {
  clearFieldError(rangesInput, errRanges);
  goStaleIfComputed();
});
bindCopyButton(copyBtn, () => lastCopy);
bindShareButton(shareBtn);
syncModeFields();
setState("empty");
