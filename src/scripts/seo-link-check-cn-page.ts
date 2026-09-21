// 外链检查页面交互：URL 解析与状态分类走 seo-link-check-cn 引擎，
// HTTP 探测在页面 fetch（先 cors 读状态码，受限再 no-cors 探测连通性）。
import {
  classifyStatus,
  parseUrlList,
} from "../lib/calculators/seo-link-check-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const urlsInput = requireEl<HTMLTextAreaElement>("#links-input");
const urlsError = requireEl<HTMLParagraphElement>("#field-error-urls");
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

const MAX_CHECKS = 50;
const TIMEOUT_MS = 5000;

let lastText = "";

interface CheckOutcome {
  status: number;
  note: string;
}

async function checkOne(url: string): Promise<CheckOutcome> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      mode: "cors",
      redirect: "follow",
      signal: controller.signal,
    });
    return { status: res.status, note: classifyStatus(res.status).label };
  } catch {
    // CORS / 网络受限：降级为 no-cors 连通性探测（无法读取状态码）
    try {
      await fetch(url, { mode: "no-cors", signal: controller.signal });
      return { status: 0, note: "可达（CORS 限制无法读取状态码）" };
    } catch {
      return { status: -1, note: "无法访问或超时" };
    }
  } finally {
    window.clearTimeout(timer);
  }
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(urlsInput, urlsError);
  const parsed = parseUrlList(urlsInput.value);
  if (parsed.valid.length === 0) {
    const first = parsed.invalid[0];
    setFieldError(
      urlsInput,
      urlsError,
      first !== undefined
        ? `存在无法解析的 URL：${first}`
        : "请输入至少一条 URL",
    );
    urlsInput.focus();
    goStaleIfComputed();
    return;
  }
  const limited = parsed.valid.slice(0, MAX_CHECKS);
  const lines: string[] = [];
  let okCount = 0;
  let warnCount = 0;
  let badCount = 0;
  setState("computed");
  for (let i = 0; i < limited.length; i++) {
    resultCaption.textContent = `检查中 ${i + 1}/${limited.length}…`;
    const url = limited[i];
    const { status, note } = await checkOne(url);
    let tag: string;
    if (status === 0) {
      tag = "⚠";
      warnCount++;
    } else if (status < 0) {
      tag = "✗";
      badCount++;
    } else {
      const cls = classifyStatus(status);
      if (cls.group === "ok") {
        tag = "✓";
        okCount++;
      } else if (cls.group === "redirect") {
        tag = "→";
        warnCount++;
      } else {
        tag = "✗";
        badCount++;
      }
    }
    const code = status > 0 ? String(status) : "--";
    lines.push(`${tag} ${code} ${note}  ${url}`);
    resultMain.textContent = lines.join("\n");
  }
  lastText = lines.join("\n");
  resultCaption.textContent = `检查完成：${limited.length} 条链接`;
  const extra: string[] = [];
  if (parsed.duplicates > 0) extra.push(`去重 ${parsed.duplicates} 条`);
  if (parsed.invalid.length > 0) {
    extra.push(`无法解析 ${parsed.invalid.length} 条`);
  }
  if (parsed.valid.length > MAX_CHECKS) {
    extra.push(`超出上限，仅检查前 ${MAX_CHECKS} 条`);
  }
  resultProcess.textContent =
    `正常 ${okCount} · 重定向/受限 ${warnCount} · 异常 ${badCount}` +
    (extra.length > 0 ? ` · ${extra.join(" · ")}` : "");
  setState("computed");
}

function handleReset(): void {
  urlsInput.value = "";
  clearFieldError(urlsInput, urlsError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!urlsError.hidden && urlsInput.value !== "") {
    clearFieldError(urlsInput, urlsError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
urlsInput.addEventListener("input", onFieldInput);

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
