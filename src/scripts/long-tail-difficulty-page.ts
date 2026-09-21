// 长尾词排名难度评估页面交互：批量评估每行长尾词的难度分
import {
  scoreLongTailDifficulty,
  scoreLongTailBatch,
} from "../lib/calculators/long-tail-difficulty";
import { parseLines } from "../lib/calculators/seo-keywords-cn";
import {
  requireEl,
  setFieldError,
  clearFieldError,
  createResultState,
  bindCopyButton,
  bindShareButton,
} from "./_page-kit";

const form = requireEl<HTMLFormElement>("#calc-form");
const wordsInput = requireEl<HTMLTextAreaElement>("#kw-words");
const wordsError = requireEl<HTMLParagraphElement>("#field-error-words");
const coreInput = requireEl<HTMLInputElement>("#kw-core");
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

let lastText = "";

const BAND_RANK: Record<string, number> = {
  极易: 1,
  较易: 2,
  中等: 3,
  较难: 4,
  极难: 5,
};

function formatRow(
  word: string,
  breakdown: ReturnType<typeof scoreLongTailDifficulty>,
): string {
  const flags: string[] = [];
  if (breakdown.hasQuestion) flags.push("疑问");
  if (breakdown.hasCommercial) flags.push("商业");
  if (breakdown.hasHighCompetition) flags.push("高竞争");
  const flagText = flags.length > 0 ? ` [${flags.join("/")}]` : "";
  return `${word}\t${breakdown.score}\t${breakdown.band}${flagText}\t${breakdown.confidence}\t${breakdown.hint}`;
}

function buildSummary(
  rows: Array<{
    word: string;
    breakdown: ReturnType<typeof scoreLongTailDifficulty>;
  }>,
): string {
  if (rows.length === 0) return "";
  const bandCounts: Record<string, number> = {
    极易: 0,
    较易: 0,
    中等: 0,
    较难: 0,
    极难: 0,
  };
  let recommendCount = 0;
  for (const r of rows) {
    bandCounts[r.breakdown.band] += 1;
    if (BAND_RANK[r.breakdown.band] <= 2) recommendCount += 1;
  }
  const lines: string[] = [];
  lines.push(`共评估 ${rows.length} 个长尾词，分布：`);
  lines.push(
    `  极易 ${bandCounts.极易} · 较易 ${bandCounts.较易} · 中等 ${bandCounts.中等} · 较难 ${bandCounts.较难} · 极难 ${bandCounts.极难}`,
  );
  lines.push(
    `建议优先攻坚 ${recommendCount} 个极易/较易词，剩余作为长尾补充。`,
  );
  return lines.join("\n");
}

function handleSubmit(event: Event): void {
  event.preventDefault();
  clearFieldError(wordsInput, wordsError);
  const lines = parseLines(wordsInput.value);
  if (lines.length === 0) {
    setFieldError(wordsInput, wordsError, "请至少输入一个长尾词（每行一个）");
    wordsInput.focus();
    goStaleIfComputed();
    return;
  }
  const core = coreInput.value.trim();
  const breakdowns = scoreLongTailBatch(lines, core === "" ? undefined : core);
  const rows = lines
    .map((w, i) => ({ word: w, breakdown: breakdowns[i] }))
    .filter(
      (
        r,
      ): r is {
        word: string;
        breakdown: ReturnType<typeof scoreLongTailDifficulty>;
      } => Boolean(r.breakdown),
    );
  // 按难度分升序（越易越在前）
  rows.sort((a, b) => a.breakdown.score - b.breakdown.score);

  const tableLines = [
    "长尾词\t分数\t分档\t置信度\t提示",
    ...rows.map((r) => formatRow(r.word, r.breakdown)),
  ];
  const summary = buildSummary(rows);
  lastText = `${tableLines.join("\n")}\n\n${summary}`;
  resultCaption.textContent = `评估 ${rows.length} 个长尾词（已按难度升序）`;
  resultMain.textContent = rows
    .map((r) => formatRow(r.word, r.breakdown))
    .join("\n");
  resultProcess.textContent = summary;
  setState("computed");
}

function handleReset(): void {
  wordsInput.value = "";
  coreInput.value = "";
  clearFieldError(wordsInput, wordsError);
  lastText = "";
  setState("empty");
}

function onFieldInput(): void {
  if (!wordsError.hidden && wordsInput.value !== "") {
    clearFieldError(wordsInput, wordsError);
  }
  goStaleIfComputed();
}

form.addEventListener("submit", handleSubmit);
resetBtn.addEventListener("click", handleReset);
for (const el of [wordsInput, coreInput]) {
  el.addEventListener("input", onFieldInput);
}

bindCopyButton(copyBtn, () => lastText);
bindShareButton(shareBtn);

setState("empty");
