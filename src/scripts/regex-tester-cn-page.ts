// 正则表达式测试页面交互
import {
  matchRegex,
  MAX_MATCHES,
  type RegexMatchItem,
  type RegexMatchValue,
} from "../lib/calculators/regex-tester-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const patternInput = requireEl<HTMLInputElement>("#pattern");
const textInput = requireEl<HTMLTextAreaElement>("#text");
const errPattern = requireEl<HTMLParagraphElement>("#field-error-pattern");
const errFlags = requireEl<HTMLParagraphElement>("#field-error-flags");
const errText = requireEl<HTMLParagraphElement>("#field-error-text");
const flagG = requireEl<HTMLInputElement>("#flag-g");
const flagBoxes = Array.from(
  document.querySelectorAll<HTMLInputElement>('input[name="regex-flags"]'),
);
const resultCaption = requireEl<HTMLParagraphElement>("#result-caption");
const resultMain = requireEl<HTMLParagraphElement>("#result-main");
const resultDetail = requireEl<HTMLParagraphElement>("#result-detail");
const matchList = requireEl<HTMLUListElement>("#match-list");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");
const resetBtn = requireEl<HTMLButtonElement>("#reset-btn");

let lastCopy = "";

const { setState, goStaleIfComputed } = createResultState({
  resultEmpty: requireEl("#result-empty"),
  resultContent: requireEl("#result-content"),
  staleHint: requireEl("#result-stale-hint"),
  buttons: [copyBtn],
});

function currentFlags(): string {
  return flagBoxes
    .filter((b) => b.checked)
    .map((b) => b.value)
    .join("");
}

/** 全部用 createElement + textContent 渲染，禁止 innerHTML */
function renderMatches(matches: RegexMatchItem[]): void {
  matchList.replaceChildren();
  matches.forEach((m, i) => {
    const li = document.createElement("li");
    li.className = "match-item";

    const head = document.createElement("p");
    head.className = "match-head";
    head.textContent = `#${i + 1} · 位置 ${m.index} · 长度 ${m.length}`;
    li.appendChild(head);

    const body = document.createElement("p");
    body.className = "match-text";
    body.textContent = m.match === "" ? "（零宽匹配）" : m.match;
    li.appendChild(body);

    if (m.groups.length > 0) {
      const groups = document.createElement("p");
      groups.className = "match-groups";
      groups.textContent =
        "捕获组：" +
        m.groups
          .map((g, gi) => `${gi + 1}=${g === "" ? "（未匹配）" : `"${g}"`}`)
          .join("，");
      li.appendChild(groups);
    }
    matchList.appendChild(li);
  });
}

function buildSummary(
  pattern: string,
  flags: string,
  value: RegexMatchValue,
): string {
  const lines = [
    `正则：/${pattern}/${flags}`,
    `匹配数：${value.total}${value.truncated ? `（已达上限 ${MAX_MATCHES}，结果被截断）` : ""}`,
  ];
  value.matches.forEach((m, i) => {
    const groups =
      m.groups.length > 0
        ? ` 捕获组=[${m.groups.map((g) => `"${g}"`).join(", ")}]`
        : "";
    lines.push(
      `${i + 1}. 位置=${m.index} 长度=${m.length} 内容="${m.match}"${groups}`,
    );
  });
  return lines.join("\n");
}

function clearAllErrors(): void {
  clearFieldError(patternInput, errPattern);
  clearFieldError(flagG, errFlags);
  clearFieldError(textInput, errText);
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  clearAllErrors();
  const pattern = patternInput.value;
  const flags = currentFlags();
  const r = matchRegex(pattern, flags, textInput.value);
  if (!r.ok) {
    if (r.error.code === "INVALID_FLAGS") {
      setFieldError(flagG, errFlags, r.error.message);
    } else if (r.error.code === "INVALID_INPUT") {
      setFieldError(textInput, errText, r.error.message);
    } else {
      setFieldError(patternInput, errPattern, r.error.message);
    }
    setState("empty");
    return;
  }
  resultCaption.textContent = "匹配结果";
  resultMain.textContent =
    r.value.total === 0 ? "未找到匹配" : `共 ${r.value.total} 处匹配`;
  const detailParts = [`标志：${flags === "" ? "无" : flags}`];
  if (r.value.hasG === false) detailParts.push("未启用 g，仅返回首个匹配");
  if (r.value.truncated)
    detailParts.push(`匹配数超过上限 ${MAX_MATCHES}，已截断`);
  resultDetail.textContent = detailParts.join(" · ");
  renderMatches(r.value.matches);
  lastCopy = buildSummary(pattern, flags, r.value);
  setState("computed");
});

resetBtn.addEventListener("click", () => {
  patternInput.value = "";
  textInput.value = "";
  flagBoxes.forEach((b) => {
    b.checked = b.value === "g";
  });
  clearAllErrors();
  matchList.replaceChildren();
  setState("empty");
});

patternInput.addEventListener("input", goStaleIfComputed);
textInput.addEventListener("input", goStaleIfComputed);
flagBoxes.forEach((b) => b.addEventListener("change", goStaleIfComputed));

bindCopyButton(copyBtn, () => lastCopy);
setState("empty");
