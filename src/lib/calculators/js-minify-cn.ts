// JS 压缩/美化引擎 —— 手写词法扫描器（纯函数，无依赖）。
// 正确处理：单双引号字符串（含转义）、模板字符串（整体原样保留，含 ${} 内嵌
// 表达式）、行/块注释、正则字面量边界（按前文 token 判定 / 是正则还是除号）。
// 已知简化：`) /regex/`（右括号后紧跟正则）会被判为除号——工程代码中极罕见；
// minify 不做变量重命名与语法级优化（仅去注释/空白），语义保持不变。
export interface Token {
  kind: "code" | "str" | "template" | "regex";
  text: string;
}

/** 这些关键字之后允许出现正则字面量（其余标识符/数字后 / 是除号） */
const REGEX_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "case",
  "do",
  "else",
  "yield",
  "await",
  "throw",
]);

/** 判定「当前位置」是否可开启正则字面量：last 为紧邻的前文文本（code 部分尾巴） */
function regexAllowedAt(lastCode: string): boolean {
  if (lastCode === "") return true; // 输入起始位置
  const lastCh = lastCode[lastCode.length - 1];
  if (lastCh === ")" || lastCh === "]" || lastCh === "}") return false;
  if (lastCh === '"' || lastCh === "'" || lastCh === "`") return false;
  if (/[A-Za-z0-9_$]/.test(lastCh)) {
    const m = lastCode.match(/[A-Za-z_$][A-Za-z0-9_$]*$/);
    return m !== null && REGEX_KEYWORDS.has(m[0]);
  }
  return true; // ( , = : [ ! & | ? { ; 等运算符之后
}

/** 词法扫描：注释直接丢弃（不产生 token） */
export function tokenizeJs(src: string): Token[] {
  const toks: Token[] = [];
  const n = src.length;
  let i = 0;
  const lastCodeText = (): string => {
    // 用于正则判定的前文：code token 尾部 + 字符串类 token 的引号收尾
    const last = toks[toks.length - 1];
    if (!last) return "";
    if (last.kind === "code") return last.text;
    return last.text.slice(-1);
  };
  while (i < n) {
    const ch = src[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i = Math.min(i + 2, n);
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === ch) {
          j++;
          break;
        }
        j++;
      }
      toks.push({ kind: "str", text: src.slice(i, Math.min(j, n)) });
      i = j;
      continue;
    }
    if (ch === "`") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === "`") {
          j++;
          break;
        }
        j++;
      }
      toks.push({ kind: "template", text: src.slice(i, Math.min(j, n)) });
      i = j;
      continue;
    }
    if (ch === "/" && regexAllowedAt(lastCodeText())) {
      // 尝试扫描正则字面量（支持 [class] 内的 / 与 \ 转义）
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < n) {
        const c = src[j];
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "\n") break;
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          j++;
          closed = true;
          break;
        }
        j++;
      }
      if (closed) {
        while (j < n && /[a-z]/.test(src[j])) j++; // flags
        toks.push({ kind: "regex", text: src.slice(i, j) });
        i = j;
        continue;
      }
      // 未闭合 → 退化为除号走 code 分支
    }
    // 普通 code：连续吞到空白/引号/反引号/注释起点/正则起点
    const start = i;
    while (i < n) {
      const c = src[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") break;
      if (c === '"' || c === "'" || c === "`") break;
      if (c === "/" && (src[i + 1] === "/" || src[i + 1] === "*")) break;
      if (c === "/" && regexAllowedAt(lastCodeText() + src.slice(start, i)))
        break;
      i++;
    }
    if (i === start) i++; // 单字符保底（如孤立的引号外符号）
    toks.push({ kind: "code", text: src.slice(start, i) });
  }
  return toks;
}

/** token 拼接：避免产生粘连改变语义（词字符相连 / ++ -- / // /*） */
function appendTok(out: string, text: string): string {
  if (out === "" || text === "") return out + text;
  const pc = out[out.length - 1];
  const nc = text[0];
  const word = /[A-Za-z0-9_$]/;
  if (word.test(pc) && word.test(nc)) return `${out} ${text}`;
  if ((pc === "+" && nc === "+") || (pc === "-" && nc === "-")) {
    return `${out} ${text}`;
  }
  if (pc === "/" && (nc === "/" || nc === "*")) return `${out} ${text}`;
  if (pc === "<" && nc === "!") return `${out} ${text}`;
  return out + text;
}

/** 压缩：去注释与空白，token 必要处加空格；不改变语义 */
export function minifyJs(src: string): string {
  let out = "";
  for (const tok of tokenizeJs(src)) out = appendTok(out, tok.text);
  return out;
}

/** 美化：{ 后换行缩进、} 独立、; 与行尾换行（for(;;) 头部除外） */
export function beautifyJs(src: string, indentUnit = "  "): string {
  const lines: string[] = [];
  let depth = 0; // {} 层级
  let paren = 0; // () 层级（用于 for(;;) 分号不换行）
  let line = "";
  const flush = (): void => {
    const trimmed = line.trim();
    if (trimmed !== "") lines.push(indentUnit.repeat(depth) + trimmed);
    line = "";
  };
  const addText = (text: string): void => {
    for (const ch of text) {
      switch (ch) {
        case "{": {
          if (line !== "" && !line.endsWith("(")) line += " ";
          line += "{";
          flush();
          depth++;
          break;
        }
        case "}": {
          flush();
          depth = Math.max(0, depth - 1);
          line = "}";
          flush();
          break;
        }
        case ";": {
          line += ";";
          if (paren === 0) flush();
          break;
        }
        case "(": {
          paren++;
          line += "(";
          break;
        }
        case ")": {
          paren = Math.max(0, paren - 1);
          line += ")";
          break;
        }
        default:
          line += ch;
      }
    }
  };
  for (const tok of tokenizeJs(src)) {
    if (tok.kind === "code") {
      // code token 逐字符走布局；词字符衔接保持一个空格由 appendTok 同规则处理
      let i = 0;
      const t = tok.text;
      // token 内部逐段处理：连续词字符/数字保留，标点逐个走 addText
      while (i < t.length) {
        const m = t.slice(i).match(/^[A-Za-z0-9_$]+/);
        if (m) {
          if (line !== "" && /[A-Za-z0-9_$]/.test(line[line.length - 1])) {
            line += " ";
          }
          line += m[0];
          i += m[0].length;
        } else {
          addText(t[i]);
          i++;
        }
      }
    } else {
      // 字符串/模板/正则整块原样拼接，内容不参与换行缩进布局
      line += tok.text;
    }
  }
  flush();
  return lines.join("\n");
}
