// 一次性 codemod：将 Astro 打包的页面脚本迁移到 src/scripts/_page-kit.ts 共享 kit。
// 原则：只做可精确验证的替换；任何偏差 → 跳过该文件并标记 MANUAL，绝不产出半成品。
// 用法：node scripts/migrate-pages-to-kit.mjs [--apply]（默认 dry-run）
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const APPLY = process.argv.includes("--apply");
const ALREADY_KIT = new Set([
  "age-page", "date-diff-page", "ovulation-cn-page", "due-date-cn-page",
  "temperature-page", "length-page", "base-converter-cn-page",
  "word-count-cn-page", "ip-subnet-cn-page",
]);
const SKIP = new Set([...ALREADY_KIT, "basic-page"]); // basic 状态机含 building/error+announce，人工

const norm = (s) => s.replace(/\s+/g, " ").trim();

// setState 规范形态（空白归一化后精确比对；主体部分）
const FORMS = [
  // A2: 三行直写
  `state = s; resultEmpty.hidden = s !== "empty"; resultContent.hidden = s === "empty"; staleHint.hidden = s !== "stale"; copyBtn.disabled = s !== "computed";`,
  // A: if/else 两分支
  `state = s; if (s === "empty") { resultEmpty.hidden = false; resultContent.hidden = true; } else { resultEmpty.hidden = true; resultContent.hidden = false; staleHint.hidden = s !== "stale"; } copyBtn.disabled = s !== "computed";`,
  // B: 带 resultBox aria-disabled + shareBtn
  `state = next; if (next === "empty") { resultEmpty.hidden = false; resultContent.hidden = true; resultBox.removeAttribute("aria-disabled"); } else { resultEmpty.hidden = true; resultContent.hidden = false; if (next === "stale") { staleHint.hidden = false; resultBox.setAttribute("aria-disabled", "true"); } else { staleHint.hidden = true; resultBox.removeAttribute("aria-disabled"); } } const actionsEnabled = next === "computed"; copyBtn.disabled = !actionsEnabled; shareBtn.disabled = !actionsEnabled;`,
];
const B_FORM = FORMS[2];

/** 大括号配对：openIdx 指向 `{`，返回 `}` 后一位下标 */
function matchBraces(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** 删除 `function NAME(...) {...}`（含 async 前缀、前导注释行与尾随分号/换行），返回签名与 body */
function cutFunction(src, name) {
  const re = new RegExp(
    `^(?:(?://[^\\n]*|\\s)\\n)*(?:async\\s+)?function ${name}\\s*[(<]`,
    "m",
  );
  const m = re.exec(src);
  if (!m) return { src, removed: false, body: "", sig: "" };
  const parenIdx = src.indexOf("(", m.index + m[0].length - 1);
  const braceIdx = src.indexOf("{", parenIdx);
  const end = matchBraces(src, braceIdx);
  let e = end;
  if (src[e] === ";") e++;
  while (src[e] === "\n") e++;
  return {
    src: src.slice(0, m.index) + src.slice(e),
    removed: true,
    sig: src.slice(parenIdx, braceIdx),
    body: src.slice(braceIdx + 1, end - 1),
  };
}

/** 删除 `btn.addEventListener("click", () => {...});` 块 */
function cutListener(src, btn) {
  const re = new RegExp(`^${btn}\\.addEventListener\\("click", \\(\\) => \\{`, "m");
  const m = re.exec(src);
  if (!m) return { src, removed: false };
  const braceIdx = m.index + m[0].length - 1;
  const end = matchBraces(src, braceIdx);
  let e = end;
  const semi = src.indexOf(";", end);
  if (semi !== -1 && semi - end < 5) e = semi + 1;
  while (src[e] === "\n") e++;
  return { src: src.slice(0, m.index) + src.slice(e), removed: true };
}

const DIR = "src/scripts";
const files = readdirSync(DIR)
  .filter((f) => f.endsWith("-page.ts") && !SKIP.has(f.replace(/\.ts$/, "")))
  .map((f) => join(DIR, f));

let ok = 0;
const manual = [];
for (const file of files) {
  const orig = readFileSync(file, "utf8");
  let src = orig;
  const fail = (why) => { manual.push(`${file}: ${why}`); };

  // --- 1. setState 必须命中规范形态 ---
  const st = cutFunction(src, "setState");
  if (!st.removed) { fail("no setState"); continue; }
  const isB = norm(st.body) === B_FORM;
  if (!isB && !FORMS.slice(0, 2).includes(norm(st.body))) {
    fail(`setState mismatch: ${norm(st.body).slice(0, 80)}`);
    continue;
  }
  src = st.src;

  // --- 2. 删除本地 helper（逐个尝试，存在才删；签名必须与 kit 版兼容） ---
  for (const fn of ["el", "requireEl", "copyText", "flash", "flashButton",
    "toolUrl", "goStaleIfComputed"]) {
    src = cutFunction(src, fn).src;
  }
  for (const fn of ["setError", "setFieldError", "clearError", "clearFieldError"]) {
    const c = cutFunction(src, fn);
    // kit 版签名要求首参为 input（自定义单参错误助手 → 人工）
    if (c.removed && !/input/i.test(c.sig)) { fail(`${fn} custom sig`); src = orig; break; }
    src = c.src;
  }
  if (manual.length && manual[manual.length - 1].startsWith(file)) continue;

  // --- 3. let state → createResultState ---
  const hasShare = /#share-btn/.test(orig);
  const hasBox = /\bresultBox\b/.test(orig);
  const copyVar = /lastCopyText/.test(orig) ? "lastCopyText" : "lastCopy";
  const elName = /\brequireEl[<(]/.test(orig) ? "requireEl" : "el";
  const stateLine = src.match(/^let state: [^\n]*\n/m);
  if (!stateLine) { fail("no let state"); continue; }
  const els = [
    `  resultEmpty: ${elName}("#result-empty"),`,
    `  resultContent: ${elName}("#result-content"),`,
    `  staleHint: ${elName}("#result-stale-hint"),`,
    hasBox ? `  resultBox: ${elName}("#result"),` : null,
    `  buttons: [copyBtn${hasShare ? ", shareBtn" : ""}],`,
  ].filter(Boolean).join("\n");
  src = src.replace(stateLine[0],
    `const { setState, goStaleIfComputed } = createResultState({\n${els}\n});\n`);

  // --- 4. 单行 stale 检查 ---
  src = src.replace(/if \(state === "computed"\) setState\("stale"\);/g, "goStaleIfComputed();");
  // forEach 箭头块形态
  src = src.replace(
    /\(\) => \{\n(\s+)if \(state === "computed"\) setState\("stale"\);\n\s+\}\)/g,
    "goStaleIfComputed)");
  src = src.replace(
    /\(i\) => \{\n\s+if \(state === "computed"\) setState\("stale"\);\n\s+\},/g,
    "goStaleIfComputed(),");

  // --- 5. 复制/分享监听 → bind 调用（尾部） ---
  const copy = cutListener(src, "copyBtn"); src = copy.src;
  const share = cutListener(src, "shareBtn"); src = share.src;
  const binds = [
    copy.removed ? `bindCopyButton(copyBtn, () => ${copyVar});` : null,
    share.removed ? "bindShareButton(shareBtn);" : null,
  ].filter(Boolean);
  if (binds.length) {
    const tail = /\nsetState\("empty"\);\s*$/;
    if (!tail.test(src)) { fail("tail setState(empty) missing"); continue; }
    src = src.replace(tail, `\nsetState("empty");\n${binds.join("\n")}\n`);
  }

  // --- 6. type State 声明删除 ---
  src = src.replace(/^type (State|ResultState) = "empty" \| "computed" \| "stale";\n\n?/m, "");

  // --- 7. 残留 state 引用检查（排除合法词） ---
  const residue = src.replace(/goStaleIfComputed|createResultState|setState\(|"stale"|ResultState|type State/g, "");
  if (/\bstate\b/.test(residue)) {
    if (process.env.DUMP) writeFileSync("/tmp/residue.ts", src);
    fail("stray state refs");
    continue;
  }
  // lastCopy 声明必须仍在（bind getter 引用）
  if (copy.removed && !new RegExp(`let ${copyVar}`).test(src)) { fail("copyVar decl lost"); continue; }

  // --- 8. 注入 kit import（A 方言用 as 别名保持调用点） ---
  const usesSetErrA = /\bsetError\(/.test(src);
  const names = [
    elName === "requireEl" ? "requireEl" : "requireEl as el",
    usesSetErrA ? "setFieldError as setError" : "setFieldError",
    /\bclearError\(/.test(src) ? "clearFieldError as clearError" : "clearFieldError",
    "createResultState",
  ];
  if (copy.removed) names.push("bindCopyButton");
  if (share.removed) names.push("bindShareButton");
  names.sort();
  const importBlock = `import {\n  ${names.join(",\n  ")},\n} from "./_page-kit";`;
  const lastImport = [...src.matchAll(/^import[^;]+;/gm)].pop();
  if (!lastImport) { fail("no import anchor"); continue; }
  const at = lastImport.index + lastImport[0].length;
  src = src.slice(0, at) + "\n" + importBlock + src.slice(at);

  if (src === orig) { fail("no change"); continue; }
  if (APPLY) writeFileSync(file, src);
  ok++;
}

console.log(`${APPLY ? "APPLIED" : "DRY-RUN"}: ok=${ok} manual=${manual.length}`);
for (const m of manual) console.log(`  MANUAL ${m}`);
