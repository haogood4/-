// 手机号归属地查询页面交互：按手机号前 2 位懒加载对应号段数据块（模块级缓存）
import {
  lookupPhoneRegion,
  type PhoneRegionChunk,
} from "../lib/calculators/phone-region-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const phoneInput = requireEl<HTMLInputElement>("#phone");
const dataStatus = requireEl<HTMLParagraphElement>("#data-status");
const errorPhone = requireEl<HTMLParagraphElement>("#field-error-phone");
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

// ---------- 懒加载数据表：每个前缀块首次用到时才 fetch，之后复用 ----------
const PHONE_RE = /^1\d{10}$/;
const SUPPORTED_RE = /^1[3-9]\d{9}$/;
const chunkCache = new Map<string, Promise<PhoneRegionChunk>>();

function loadChunk(prefix2: string): Promise<PhoneRegionChunk> {
  const cached = chunkCache.get(prefix2);
  if (cached) return cached;
  const pending = fetch(`/data/phone-region-${prefix2}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<PhoneRegionChunk>;
    })
    .catch((err: unknown) => {
      chunkCache.delete(prefix2); // 失败后允许下次点击重试
      throw err;
    });
  chunkCache.set(prefix2, pending);
  return pending;
}

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearFieldError(phoneInput, errorPhone);

  const phone = phoneInput.value.trim();
  if (!PHONE_RE.test(phone)) {
    setFieldError(phoneInput, errorPhone, "请输入 11 位中国大陆手机号");
    goStaleIfComputed();
    return;
  }
  if (!SUPPORTED_RE.test(phone)) {
    setFieldError(
      phoneInput,
      errorPhone,
      "暂不支持该号段（仅支持 13-19 开头）",
    );
    goStaleIfComputed();
    return;
  }

  const prefix2 = phone.slice(0, 2);
  calcBtn.disabled = true;
  dataStatus.textContent = "正在加载号段数据（仅首次）…";
  dataStatus.hidden = false;
  try {
    const chunk = await loadChunk(prefix2);
    const result = lookupPhoneRegion({ phone, chunk });
    if (!result.ok) {
      if (result.error.code === "NOT_FOUND") {
        resultCaption.textContent = `${phone} 查询结果`;
        resultMain.textContent = result.error.message;
        resultProcess.textContent = `号段前缀 ${phone.slice(0, 7)} 不在当前数据块中`;
        lastCopyText = "";
        setState("computed");
      } else {
        setFieldError(phoneInput, errorPhone, result.error.message);
        goStaleIfComputed();
      }
      return;
    }
    const { province, city, vendor, prefix7 } = result.value;
    resultCaption.textContent = `${phone} 归属地`;
    resultMain.textContent = `${province} ${city}`;
    resultProcess.textContent = `运营商：${vendor} · 号段前缀：${prefix7} · 数据版本：${chunk.v}`;
    lastCopyText = `${phone} ${province}${city} ${vendor}`;
    setState("computed");
  } catch {
    setFieldError(phoneInput, errorPhone, "数据加载失败，请刷新重试");
    goStaleIfComputed();
  } finally {
    calcBtn.disabled = false;
    dataStatus.hidden = true;
  }
}

function handleReset(): void {
  phoneInput.value = "";
  clearFieldError(phoneInput, errorPhone);
  lastCopyText = "";
  setState("empty");
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
phoneInput.addEventListener("input", () => {
  if (!errorPhone.hidden && phoneInput.value.trim() !== "") {
    clearFieldError(phoneInput, errorPhone);
  }
  goStaleIfComputed();
});

bindCopyButton(copyBtn, () => lastCopyText);
bindShareButton(shareBtn);

setState("empty");
