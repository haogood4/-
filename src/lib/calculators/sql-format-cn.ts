// SQL 格式化/压缩引擎 —— 纯函数。词法层面正确跳过字符串字面量（'' 转义）与
// 注释（-- 行注释、块注释），关键字大写化只作用于字符串外。
// 布局：主子句独占一行、SELECT 列表按逗号换行、WHERE 内 AND/OR 换行、
// JOIN 与 ON 换行、括号内子查询缩进（IN(1, 2) 等值列表保持内联）。
export interface SqlToken {
  kind: "word" | "string" | "punct";
  text: string;
}

const TWO_CHAR_PUNCT = new Set([">=", "<=", "<>", "!=", "||", ":="]);

export function tokenizeSql(src: string): SqlToken[] {
  const toks: SqlToken[] = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    const ch = src[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }
    if (ch === "-" && src[i + 1] === "-") {
      while (i < n && src[i] !== "\n") i++; // 行注释：丢弃
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i = Math.min(i + 2, n); // 块注释：丢弃
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === "'" && src[j + 1] === "'") {
          j += 2; // '' 转义
          continue;
        }
        if (src[j] === "'") {
          j++;
          break;
        }
        j++;
      }
      toks.push({ kind: "string", text: src.slice(i, Math.min(j, n)) });
      i = j;
      continue;
    }
    if (/[A-Za-z0-9_$]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$.]/.test(src[j])) j++;
      toks.push({ kind: "word", text: src.slice(i, j) });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO_CHAR_PUNCT.has(two)) {
      toks.push({ kind: "punct", text: two });
      i += 2;
      continue;
    }
    toks.push({ kind: "punct", text: ch });
    i++;
  }
  return toks;
}

/** 压缩：去注释、空白折叠为单空格（必要处），字符串原样保留 */
export function minifySql(sql: string): string {
  let out = "";
  for (const tok of tokenizeSql(sql)) {
    if (out === "") {
      out = tok.text;
      continue;
    }
    const pc = out[out.length - 1];
    const nc = tok.text[0];
    const word = /[A-Za-z0-9_$"']/;
    const needSpace = word.test(pc) && word.test(nc) && nc !== ",";
    out += needSpace ? " " : "";
    out += tok.text;
  }
  return out;
}

const KEYWORDS = new Set([
  "select",
  "from",
  "where",
  "and",
  "or",
  "not",
  "in",
  "is",
  "null",
  "like",
  "between",
  "group",
  "by",
  "order",
  "having",
  "limit",
  "offset",
  "union",
  "all",
  "distinct",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "create",
  "table",
  "drop",
  "alter",
  "index",
  "view",
  "primary",
  "key",
  "foreign",
  "references",
  "default",
  "unique",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "cross",
  "on",
  "as",
  "asc",
  "desc",
  "case",
  "when",
  "then",
  "else",
  "end",
  "exists",
  "if",
  "truncate",
]);

/** 换行独占一行的主子句（短语合并后） */
const MAJOR = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION ALL",
  "UNION",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "CREATE TABLE",
]);

const JOINS = new Set([
  "JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "FULL JOIN",
  "CROSS JOIN",
]);

function isKeywordWord(text: string): boolean {
  return KEYWORDS.has(text.toLowerCase());
}

/** 词/短语合并：GROUP BY、ORDER BY、UNION ALL、INSERT INTO、DELETE FROM、
 * [LEFT|RIGHT|FULL|INNER] [OUTER] JOIN → LEFT JOIN 等；非关键词条保持原样 */
function mergePhrases(toks: readonly SqlToken[]): SqlToken[] {
  const out: SqlToken[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.kind !== "word") {
      out.push(t);
      continue;
    }
    const next = toks[i + 1];
    const nextLow = next && next.kind === "word" ? next.text.toLowerCase() : "";
    const up = t.text.toUpperCase();
    if ((up === "GROUP" || up === "ORDER") && nextLow === "by") {
      out.push({ kind: "word", text: `${up} BY` });
      i++;
      continue;
    }
    if (up === "UNION" && nextLow === "all") {
      out.push({ kind: "word", text: "UNION ALL" });
      i++;
      continue;
    }
    if (
      (up === "INSERT" && nextLow === "into") ||
      (up === "DELETE" && nextLow === "from")
    ) {
      out.push({ kind: "word", text: `${up} ${nextLow.toUpperCase()}` });
      i++;
      continue;
    }
    if (["LEFT", "RIGHT", "FULL", "INNER"].includes(up)) {
      if (nextLow === "outer") {
        // LEFT OUTER JOIN → LEFT JOIN（吞掉 OUTER）
        out.push({ kind: "word", text: `${up} JOIN` });
        i += 2;
        continue;
      }
      if (nextLow === "join") {
        out.push({ kind: "word", text: `${up} JOIN` });
        i++;
        continue;
      }
    }
    if (up === "CROSS" && nextLow === "join") {
      out.push({ kind: "word", text: "CROSS JOIN" });
      i++;
      continue;
    }
    out.push({
      kind: "word",
      text: isKeywordWord(t.text) ? t.text.toUpperCase() : t.text,
    });
  }
  return out;
}

/** 格式化：关键字大写 + 主子句换行缩进（indentUnit 每层，默认 2 空格） */
export function formatSql(sql: string, indentUnit = "  "): string {
  const merged = mergePhrases(tokenizeSql(sql));
  const lines: string[] = [];
  let indent = 0; // 当前主子句行缩进层
  let contentIndent = 1; // 当前内容行缩进层
  let cur = "";
  let selectList = false; // 位于 SELECT 与 FROM 之间
  let inWhere = false;
  const subParen: boolean[] = []; // 括号栈：true = 子查询括号

  const flush = (): void => {
    const text = cur.trim();
    if (text !== "") lines.push(indentUnit.repeat(contentIndent) + text);
    cur = "";
  };
  const pushLine = (level: number, text: string): void => {
    flush();
    if (text !== "") lines.push(indentUnit.repeat(level) + text);
  };

  for (let i = 0; i < merged.length; i++) {
    const t = merged[i];
    const isWord = t.kind === "word";
    const up = isWord ? t.text.toUpperCase() : "";

    if (isWord && MAJOR.has(up)) {
      pushLine(indent, t.text);
      selectList = up === "SELECT";
      inWhere = up === "WHERE";
      contentIndent = indent + 1;
      continue;
    }
    if (isWord && JOINS.has(up)) {
      pushLine(contentIndent, "");
      lines.push(indentUnit.repeat(indent) + t.text);
      contentIndent = indent + 1;
      continue;
    }
    if (isWord && up === "ON") {
      pushLine(contentIndent, "");
      cur = "ON"; // 条件跟在同一行
      continue;
    }
    if (isWord && (up === "AND" || up === "OR") && inWhere) {
      pushLine(contentIndent, "");
      cur = t.text; // 条件跟在同一行
      continue;
    }
    if (t.kind === "punct") {
      if (t.text === ",") {
        if (selectList) {
          cur = `${cur.trim()},`;
          flush();
          continue;
        }
        cur = `${cur.trim()}, `;
        continue;
      }
      if (t.text === "(") {
        const next = merged[i + 1];
        const sub =
          next && next.kind === "word" && next.text.toUpperCase() === "SELECT";
        if (sub) {
          pushLine(contentIndent, "(");
          indent = contentIndent + 1;
          contentIndent = indent + 1;
          subParen.push(true);
          continue;
        }
        // 内联括号：函数调用/值列表；关键字后加空格（IN (1, 2)），函数名后不加（f(x)）
        const prev = merged[i - 1];
        const prevIsKw =
          prev && prev.kind === "word" && isKeywordWord(prev.text);
        cur = cur.trimEnd();
        if (cur !== "" && prevIsKw) cur += " ";
        cur += "(";
        subParen.push(false);
        continue;
      }
      if (t.text === ")") {
        const wasSub = subParen.pop() ?? false;
        if (wasSub) {
          pushLine(contentIndent, "");
          contentIndent = Math.max(1, contentIndent - 2);
          indent = Math.max(0, contentIndent - 1);
          cur = ")"; // 别名可跟在 ) 后
          continue;
        }
        cur = `${cur.trimEnd()})`;
        continue;
      }
      // 运算符前后留空格
      cur = `${cur.trimEnd()} ${t.text} `;
      continue;
    }
    // word / string：与前文词字符或 ) 之间补空格；运算符后已留的空格保持原样
    const trimmed = cur.trimEnd();
    const pc = trimmed[trimmed.length - 1] ?? "";
    if (cur === "") {
      cur = t.text;
    } else if (/[A-Za-z0-9_$"')]/.test(pc)) {
      cur = `${trimmed} ${t.text}`;
    } else {
      cur = cur + t.text;
    }
    if (up === "FROM") {
      selectList = false;
      inWhere = false;
    }
  }
  flush();
  return lines.join("\n");
}
