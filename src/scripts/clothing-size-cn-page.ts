// 服装尺码对照页交互（外部脚本，无内联事件；样板见 _page-kit.ts）
import {
  convertClothingSize,
  formatSizeComparison,
  getSizeTable,
  SYSTEM_LABELS,
  type SizeSystem,
} from "../lib/calculators/clothing-size-cn";
import {
  bindCopyButton,
  clearFieldError as clearError,
  createResultState,
  requireEl as el,
  setFieldError as setError,
} from "./_page-kit";

const form = el<HTMLFormElement>("#calc-form");
const categorySelect = el<HTMLSelectElement>("#category");
const systemSelect = el<HTMLSelectElement>("#system");
const valueInput = el<HTMLInputElement>("#size-value");
const sizeOptions = el<HTMLDataListElement>("#size-options");
const errValue = el<HTMLParagraphElement>("#field-error-size");
const resultCaption = el<HTMLParagraphElement>("#result-caption");
const resultMain = el<HTMLParagraphElement>("#result-main");
const resultDetail = el<HTMLParagraphElement>("#result-detail");
const copyBtn = el<HTMLButtonElement>("#copy-btn");
const resetBtn = el<HTMLButtonElement>("#reset-btn");

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: el("#result-empty"),
  resultContent: el("#result-content"),
  staleHint: el("#result-stale-hint"),
  resultBox: el("#result"),
  buttons: [copyBtn],
});
let lastCopy = "";

/** 按当前分类 + 号制重建 datalist 候选值（选择或填写均可） */
function populateOptions(): void {
  const table = getSizeTable(categorySelect.value);
  const system = systemSelect.value as SizeSystem;
  const frag = document.createDocumentFragment();
  if (table) {
    for (const row of table) {
      const opt = document.createElement("option");
      opt.value = row[system];
      frag.appendChild(opt);
    }
  }
  sizeOptions.replaceChildren(frag);
  valueInput.placeholder = `选择或填写${SYSTEM_LABELS[system]}，如 ${table ? table[0][system] : ""}`;
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearError(valueInput, errValue);
  const r = convertClothingSize({
    category: categorySelect.value,
    system: systemSelect.value,
    value: valueInput.value,
  });
  if (!r.ok) {
    setError(valueInput, errValue, r.error.message);
    valueInput.focus();
    setState("empty");
    return;
  }
  const v = r.value;
  resultCaption.textContent = `${v.categoryLabel} · 输入 ${v.systemLabel} ${v.input}`;
  resultMain.textContent =
    `中国号 ${v.cn} / 欧洲号 ${v.eu} / 美国号 ${v.us} / 英国号 ${v.uk}` +
    (v.label ? `（字母码 ${v.label}）` : "");
  resultDetail.textContent = `参考区间：${v.measures}。仅供参考，各品牌尺码存在差异，请以实际商品尺码表为准。`;
  lastCopy = formatSizeComparison(v);
  setState("computed");
}

function handleReset(): void {
  categorySelect.value = "men";
  systemSelect.value = "cn";
  valueInput.value = "";
  clearError(valueInput, errValue);
  populateOptions();
  lastCopy = "";
  setState("empty");
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
valueInput.addEventListener("input", () => {
  if (!errValue.hidden && valueInput.value.trim() !== "") {
    clearError(valueInput, errValue);
  }
  goStaleIfComputed();
});
categorySelect.addEventListener("change", () => {
  populateOptions();
  goStaleIfComputed();
});
systemSelect.addEventListener("change", () => {
  populateOptions();
  goStaleIfComputed();
});

populateOptions();
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
