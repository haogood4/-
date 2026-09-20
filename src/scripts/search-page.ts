// 站内搜索页交互（外部脚本，无内联事件；索引为构建期生成的 /search-index.json）
// 匹配策略：查询按空白分词，全部词命中（AND）；标题 3 分 / 关键词 2 分 / 描述 1 分排序。
import { requireEl } from "./_page-kit";

interface SearchDoc {
  t: string;
  u: string;
  c: string;
  d: string;
  k: string;
}

const input = requireEl<HTMLInputElement>("#search-input");
const status = requireEl<HTMLParagraphElement>("#search-status");
const list = requireEl<HTMLUListElement>("#search-results");

let docs: SearchDoc[] | null = null;
let loadFailed = false;

void fetch("/search-index.json")
  .then((res) => {
    if (!res.ok) throw new Error(String(res.status));
    return res.json() as Promise<SearchDoc[]>;
  })
  .then((data) => {
    docs = data;
    render();
  })
  .catch(() => {
    loadFailed = true;
    status.textContent = "索引加载失败，请刷新页面重试。";
  });

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** 返回 {score, matched}；AND 语义由调用方判定（matched === tokens.length） */
function scoreDoc(doc: SearchDoc, tokens: string[]): [number, number] {
  const title = normalize(doc.t);
  const keywords = normalize(doc.k);
  const desc = normalize(doc.d);
  let score = 0;
  let matched = 0;
  for (const tk of tokens) {
    let hit = 0;
    if (title.includes(tk)) hit += 3;
    if (keywords.includes(tk)) hit += 2;
    if (desc.includes(tk)) hit += 1;
    if (hit > 0) {
      matched++;
      score += hit;
    }
  }
  return [score, matched];
}

function render(): void {
  const query = normalize(input.value);
  list.textContent = "";
  if (!docs) {
    if (!loadFailed) status.textContent = "索引加载中…";
    return;
  }
  if (query === "") {
    status.textContent = `索引共 ${docs.length} 条，输入关键词开始搜索。`;
    return;
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  const scored = docs.map((doc) => {
    const [score, matched] = scoreDoc(doc, tokens);
    return { doc, score, matched };
  });
  // 优先 AND（全词命中）；无结果时回退 OR（部分命中），提示语区分
  let hits = scored.filter((h) => h.matched === tokens.length);
  let partial = false;
  if (hits.length === 0) {
    hits = scored.filter((h) => h.matched > 0);
    partial = hits.length > 0;
  }
  hits.sort(
    (a, b) =>
      b.matched - a.matched ||
      b.score - a.score ||
      a.doc.t.length - b.doc.t.length,
  );
  hits = hits.slice(0, 20);

  status.textContent =
    hits.length === 0
      ? `没有找到与「${input.value.trim()}」匹配的内容，试试更短的关键词。`
      : partial
        ? `未找到完全匹配，以下为部分关键词命中的 ${hits.length} 条结果：`
        : `找到 ${hits.length} 条结果：`;

  for (const { doc } of hits) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = doc.u;
    link.textContent = doc.t;
    const tag = document.createElement("span");
    tag.textContent = `［${doc.c}］`;
    const desc = document.createElement("p");
    desc.className = "calc-hint";
    desc.textContent = doc.d;
    li.append(tag, link, desc);
    list.appendChild(li);
  }

  const url = new URL(window.location.href);
  if (query === "") url.searchParams.delete("q");
  else url.searchParams.set("q", input.value.trim());
  window.history.replaceState(null, "", url);
}

let debounceTimer = 0;
input.addEventListener("input", () => {
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(render, 120);
});

const initial = new URLSearchParams(window.location.search).get("q");
if (initial) input.value = initial;
render();
