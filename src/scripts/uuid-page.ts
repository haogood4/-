// UUID 生成器页面交互
import { generateUuids, type UuidFormat } from "../lib/calculators/uuid";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const countInput = requireEl<HTMLInputElement>("#count");
const formatSelect = requireEl<HTMLSelectElement>("#format");
const prefixInput = requireEl<HTMLInputElement>("#prefix");
const errCount = requireEl<HTMLParagraphElement>("#field-error-count");
const uuidList = requireEl<HTMLTextAreaElement>("#uuid-list");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

const FORMAT_LABELS: Record<UuidFormat, string> = {
  dash: "标准带连字符",
  "no-dash": "无连字符",
  upper: "大写带连字符",
  "no-dash-upper": "大写无连字符",
};

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

countInput.addEventListener("input", goStaleIfComputed);
formatSelect.addEventListener("change", goStaleIfComputed);
prefixInput.addEventListener("change", goStaleIfComputed);

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearFieldError(countInput, errCount);
  if (
    typeof crypto === "undefined" ||
    typeof crypto.getRandomValues !== "function"
  ) {
    setFieldError(
      countInput,
      errCount,
      "当前浏览器不支持 crypto.getRandomValues，无法生成密码学安全的 UUID",
    );
    setState("empty");
    return;
  }
  const count = Number(countInput.value);
  const format = formatSelect.value as UuidFormat;
  const r = generateUuids({
    count,
    format,
    random: crypto.getRandomValues.bind(crypto) as (buf: Uint8Array) => void,
  });
  if (!r.ok) {
    setFieldError(countInput, errCount, r.error.message);
    setState("empty");
    return;
  }
  const lines = r.value.uuids.map((u, i) =>
    prefixInput.checked ? `${i + 1}. ${u}` : u,
  );
  uuidList.value = lines.join("\n");
  lastCopy = uuidList.value;
  resultDetail.textContent = `共 ${r.value.count} 个 · ${FORMAT_LABELS[format]}`;
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  countInput.value = "5";
  formatSelect.value = "dash";
  prefixInput.checked = false;
  uuidList.value = "";
  lastCopy = "";
  clearFieldError(countInput, errCount);
  setState("empty");
});

bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
