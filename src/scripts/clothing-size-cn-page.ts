// 服装尺码对照页交互（外部脚本，无内联事件；样板见 _page-kit.ts）
// 对照表数据外置于 /data/clothing-size.json：首次操作时 fetch（模块级 Promise 缓存），
// datalist 候选值在数据就绪后重建；加载失败走字段错误提示。
import {
  convertClothingSize,
  formatSizeComparison,
  getSizeTable,
  SYSTEM_LABELS,
  type ClothingSizeTables,
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

const LOAD_FAIL_MSG = "数据加载失败，请刷新页面重试";

// ---------- 懒加载对照表：首次使用时 fetch，之后复用缓存 ----------
let tablesPromise: Promise<ClothingSizeTables> | null = null;

function loadTables(): Promise<ClothingSizeTables> {
  if (!tablesPromise) {
    tablesPromise = fetch("/data/clothing-size.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ClothingSizeTables>;
      })
      .catch((err: unknown) => {
        tablesPromise = null; // 失败后允许下次操作重试
        throw err;
      });
  }
  return tablesPromise;
}

/** 按当前分类 + 号制重建 datalist 候选值（选择或填写均可），需数据已加载 */
async function populateOptions(): Promise<void> {
  let tables: ClothingSizeTables;
  try {
    tables = await loadTables();
  } catch {
    setError(valueInput, errValue, LOAD_FAIL_MSG);
    return;
  }
  const table = getSizeTable(categorySelect.value, tables);
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

async function handleSubmit(event: Event): Promise<void> {
  event.preventDefault();
  clearError(valueInput, errValue);
  let tables: ClothingSizeTables;
  try {
    tables = await loadTables();
  } catch {
    setError(valueInput, errValue, LOAD_FAIL_MSG);
    setState("empty");
    return;
  }
  const r = convertClothingSize({
    category: categorySelect.value,
    system: systemSelect.value,
    value: valueInput.value,
    tables,
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
  void populateOptions();
  lastCopy = "";
  setState("empty");
}

form.addEventListener("submit", (event) => {
  void handleSubmit(event);
});
resetBtn.addEventListener("click", handleReset);
valueInput.addEventListener("input", () => {
  if (!errValue.hidden && valueInput.value.trim() !== "") {
    clearError(valueInput, errValue);
  }
  goStaleIfComputed();
});
categorySelect.addEventListener("change", () => {
  void populateOptions();
  goStaleIfComputed();
});
systemSelect.addEventListener("change", () => {
  void populateOptions();
  goStaleIfComputed();
});

// 初始 datalist 与占位符由页面静态 HTML 提供（默认 男装·中国号），
// 不在加载期 fetch，首次换算/切换分类号制时才拉取数据。
setState("empty");
bindCopyButton(copyBtn, () => lastCopy);
