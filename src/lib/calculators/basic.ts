// 四则运算计算器 —— 纯函数，无 DOM 依赖
// 表达式串以单行字符串承载（含 `+ - × ÷ . 0-9` 与一元负号），由 tokenize → shunting-yard → 求值

export type BasicOperator = "+" | "−" | "×" | "÷";

export type BasicErrorCode =
  | "EMPTY"
  | "INVALID_FORMAT"
  | "INCOMPLETE_EXPR"
  | "DIVIDE_BY_ZERO"
  | "OUT_OF_RANGE";

export type BasicResult =
  | { ok: true; value: number }
  | { ok: false; error: { code: BasicErrorCode; message: string } };

const MAX_ABS = 1e12;
const MAX_INPUT_LEN = 32;
const MAX_SIG_DIGITS = 16;

function fail(code: BasicErrorCode, message: string): BasicResult {
  return { ok: false, error: { code, message } };
}

// 应用一个二元运算符；调用方需保证 left / right 已通过合法性校验
export function applyOperator(
  left: number,
  op: BasicOperator,
  right: number,
): BasicResult {
  switch (op) {
    case "+":
      return { ok: true, value: left + right };
    case "−":
      return { ok: true, value: left - right };
    case "×":
      return { ok: true, value: left * right };
    case "÷":
      if (right === 0) {
        return fail("DIVIDE_BY_ZERO", "不能除以 0");
      }
      return { ok: true, value: left / right };
  }
}

type Token =
  | { type: "number"; value: number; raw: string }
  | { type: "op"; op: BasicOperator }
  | { type: "lp" }
  | { type: "rp" };

function isOperatorChar(ch: string): ch is BasicOperator {
  return ch === "+" || ch === "−" || ch === "×" || ch === "÷";
}

function countSigDigits(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  return cleaned.length;
}

// 拆分表达式；输入已通过总字符长度校验
function tokenize(input: string): BasicResult | { tokens: Token[] } {
  const tokens: Token[] = [];
  let i = 0;
  // 用于判断一元负号：位置 0 或前一个 token 是运算符/左括号
  let prevIsOpOrStart = true;

  while (i < input.length) {
    const ch = input[i] ?? "";
    // 跳过空白
    if (ch === " ") {
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lp" });
      i += 1;
      prevIsOpOrStart = true;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rp" });
      i += 1;
      prevIsOpOrStart = false;
      continue;
    }
    if (isOperatorChar(ch) || ch === "-") {
      // 一元负号：在表达式开头或前一个 token 是二元运算符时
      if ((ch === "−" || ch === "-") && prevIsOpOrStart) {
        // 必须紧跟数字
        const rest = input.slice(i + 1);
        const m = /^(\d+(\.\d+)?|\.\d+)/.exec(rest);
        if (!m) {
          return fail("INVALID_FORMAT", "表达式格式不正确");
        }
        const raw = `−${m[0]}`;
        if (countSigDigits(m[0]) > MAX_SIG_DIGITS) {
          return fail(
            "OUT_OF_RANGE",
            `单个数字有效位数不能超过 ${MAX_SIG_DIGITS}`,
          );
        }
        // Number() 不识别全角负号；显式用半角再转
        const value = Number(`-${m[0]}`);
        if (!Number.isFinite(value)) {
          return fail("INVALID_FORMAT", "表达式格式不正确");
        }
        tokens.push({ type: "number", value, raw });
        i += 1 + m[0].length;
        prevIsOpOrStart = false;
        continue;
      }
      // 拒绝一元正号（不允许）
      if (ch === "+" && prevIsOpOrStart) {
        return fail("INVALID_FORMAT", "表达式格式不正确");
      }
      // 拒绝连续二元运算符
      if (prevIsOpOrStart) {
        return fail("INVALID_FORMAT", "不能连续输入运算符");
      }
      // ch 此时一定是 + − × ÷（一元情况已在上方 return）
      tokens.push({ type: "op", op: ch as BasicOperator });
      i += 1;
      prevIsOpOrStart = true;
      continue;
    }
    // 数字（拒绝双小数点：必须在 number 字面量正则拒绝）
    const m = /^(\d+(\.\d+)?|\.\d+)/.exec(input.slice(i));
    if (!m) {
      return fail("INVALID_FORMAT", "表达式格式不正确");
    }
    const raw = m[0];
    if (countSigDigits(raw) > MAX_SIG_DIGITS) {
      return fail("OUT_OF_RANGE", `单个数字有效位数不能超过 ${MAX_SIG_DIGITS}`);
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return fail("INVALID_FORMAT", "表达式格式不正确");
    }
    // 数字后紧跟 '.': 视为双小数点（"1.2.3"）
    const next = input[i + m[0].length];
    if (next === ".") {
      return fail("INVALID_FORMAT", "表达式格式不正确");
    }
    tokens.push({ type: "number", value, raw });
    i += m[0].length;
    prevIsOpOrStart = false;
  }

  if (tokens.length === 0) {
    return fail("EMPTY", "请输入表达式");
  }
  return { tokens };
}

// shunting-yard：中缀 → 后缀；优先级 × ÷ > + −；同优先级左结合
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  const prec: Record<BasicOperator, number> = {
    "+": 1,
    "−": 1,
    "×": 2,
    "÷": 2,
  };
  for (const t of tokens) {
    if (t.type === "number") {
      output.push(t);
      continue;
    }
    if (t.type === "lp") {
      stack.push(t);
      continue;
    }
    if (t.type === "rp") {
      while (stack.length > 0) {
        const top = stack.pop();
        if (!top || top.type === "lp") break;
        output.push(top);
      }
      continue;
    }
    // op
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (top && top.type === "op" && prec[top.op] >= prec[t.op]) {
        const popped = stack.pop();
        if (popped) output.push(popped);
        continue;
      }
      break;
    }
    stack.push(t);
  }
  while (stack.length > 0) {
    const popped = stack.pop();
    if (popped && popped.type !== "lp") output.push(popped);
  }
  return output;
}

function evaluateRPN(rpn: Token[]): BasicResult {
  const stack: number[] = [];
  for (const t of rpn) {
    if (t.type === "number") {
      stack.push(t.value);
      continue;
    }
    if (t.type !== "op") {
      return fail("INCOMPLETE_EXPR", "表达式不完整");
    }
    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) {
      return fail("INCOMPLETE_EXPR", "表达式不完整");
    }
    const r = applyOperator(left, t.op, right);
    if (!r.ok) return r;
    stack.push(r.value);
  }
  if (stack.length !== 1) {
    return fail("INCOMPLETE_EXPR", "表达式不完整");
  }
  const value = stack[0];
  if (value === undefined || !Number.isFinite(value)) {
    return fail("OUT_OF_RANGE", "数值超出范围");
  }
  if (Math.abs(value) > MAX_ABS) {
    return fail("OUT_OF_RANGE", "数值超出范围（绝对值不能超过 1e12）");
  }
  return { ok: true, value };
}

export function evaluateExpression(input: string): BasicResult {
  const trimmed = input.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请输入表达式");
  }
  if (trimmed.length > MAX_INPUT_LEN) {
    return fail("OUT_OF_RANGE", `表达式长度不能超过 ${MAX_INPUT_LEN} 个字符`);
  }
  // 兼容面板输入的半角负号 "-"
  const normalized = trimmed.replace(/-/g, "−");
  const tk = tokenize(normalized);
  if ("ok" in tk) return tk;
  // 末尾是运算符 → 表达式不完整
  const last = tk.tokens[tk.tokens.length - 1];
  if (last && last.type === "op") {
    return fail("INCOMPLETE_EXPR", "表达式不完整");
  }
  const rpn = toRPN(tk.tokens);
  return evaluateRPN(rpn);
}

// 展示层格式化：复用 _shared.ts 既有规则（round-half-up 最多 6 位小数）
export function formatBasic(value: number): string {
  if (!Number.isFinite(value)) {
    return "数值超出范围";
  }
  const factor = 10 ** 6;
  const sign = value < 0 ? -1 : 1;
  const roundedValue = (Math.round(Math.abs(value) * factor) / factor) * sign;
  let text = roundedValue.toFixed(6);
  if (text.includes(".")) {
    text = text.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (text === "-0") {
    text = "0";
  }
  const rounded = Number(text) !== value;
  return (rounded ? "约 " : "") + text;
}

// ± 切换：作用于"当前正在输入的数字段"
export function toggleSign(currentTail: string): string {
  const trimmed = currentTail.trim();
  if (trimmed === "") return currentTail;
  if (trimmed.startsWith("−")) {
    return trimmed.slice(1);
  }
  if (trimmed.startsWith("-")) {
    return trimmed.slice(1);
  }
  return `−${trimmed}`;
}

// % 转换：把当前数字段除以 100 后并入表达式（即追加 "÷100"）
export function applyPercent(currentTail: string): string {
  const trimmed = currentTail.trim();
  if (trimmed === "") return currentTail;
  return `${trimmed}÷100`;
}
