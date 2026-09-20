// 四则运算计算器页面交互（外部脚本）
// 复用 src/lib/calculators/basic.ts 的 evaluateExpression / applyOperator / formatBasic / toggleSign / applyPercent
import {
  evaluateExpression,
  formatBasic,
  toggleSign,
  applyPercent,
  type BasicOperator,
} from "../lib/calculators/basic";
import { copyText, flashButton, requireEl } from "./_page-kit";

type State = "building" | "computed" | "error";

// 按键定义：值表示追加到表达式串的字符（"=" "" 触发求值等）
type KeyDef =
  | { kind: "digit"; label: string; insert: string }
  | { kind: "dot"; label: string; insert: string }
  | { kind: "op"; label: string; op: BasicOperator }
  | {
      kind: "action";
      label: string;
      action:
        | "equals"
        | "clear-entry"
        | "clear-all"
        | "backspace"
        | "sign"
        | "percent";
    };

const KEYS: KeyDef[] = [
  { kind: "action", label: "AC", action: "clear-all" },
  { kind: "action", label: "C", action: "clear-entry" },
  { kind: "action", label: "⌫", action: "backspace" },
  { kind: "action", label: "±", action: "sign" },

  { kind: "action", label: "%", action: "percent" },
  { kind: "digit", label: "7", insert: "7" },
  { kind: "digit", label: "8", insert: "8" },
  { kind: "digit", label: "9", insert: "9" },

  { kind: "op", label: "÷", op: "÷" },
  { kind: "digit", label: "4", insert: "4" },
  { kind: "digit", label: "5", insert: "5" },
  { kind: "digit", label: "6", insert: "6" },

  { kind: "op", label: "×", op: "×" },
  { kind: "digit", label: "1", insert: "1" },
  { kind: "digit", label: "2", insert: "2" },
  { kind: "digit", label: "3", insert: "3" },

  { kind: "op", label: "−", op: "−" },
  { kind: "digit", label: "0", insert: "0" },
  { kind: "dot", label: ".", insert: "." },
  { kind: "action", label: "=", action: "equals" },

  { kind: "op", label: "+", op: "+" },
];

// 表达式串内部使用半角字符；展示层把 "−" 渲染为全角减号 "−"
const MAX_INPUT_LEN = 32;

const display = requireEl<HTMLOutputElement>("#calc-display");
const liveRegion = requireEl<HTMLDivElement>("#calc-live");
const errorBox = requireEl<HTMLParagraphElement>("#calc-error");
const keypad = requireEl<HTMLDivElement>("#calc-keypad");
const copyBtn = requireEl<HTMLButtonElement>("#copy-btn");

let state: State = "building";
let expression = "";
let lastBinaryOp: BasicOperator | null = null;
let lastOperand: number | null = null;
let lastResult: number | null = null;
let lastCopyText = "";

function isOpChar(ch: string): boolean {
  return ch === "+" || ch === "-" || ch === "×" || ch === "÷";
}

// 把内部半角表达式渲染为展示字符串：负号渲染为 "−"、乘为 "×"、除为 "÷"
function renderExpression(): string {
  return expression.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");
}

function setState(next: State, message = ""): void {
  state = next;
  if (next === "error") {
    errorBox.textContent = message;
    errorBox.hidden = false;
    display.classList.add("is-error");
  } else {
    errorBox.textContent = "";
    errorBox.hidden = true;
    display.classList.remove("is-error");
  }
  copyBtn.disabled = next !== "computed";
}

function paintDisplay(): void {
  display.textContent = renderExpression() === "" ? "0" : renderExpression();
}

function announce(message: string): void {
  liveRegion.textContent = "";
  // 强制刷新以让屏幕阅读器在结果变化时播报
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 16);
}

function pushDigit(d: string): void {
  if (state === "computed") {
    // 在 computed 后输入数字：开始新表达式
    expression = "";
    lastBinaryOp = null;
    lastOperand = null;
    lastResult = null;
    setState("building");
  } else if (state === "error") {
    expression = "";
    setState("building");
  }
  if (expression.length >= MAX_INPUT_LEN) return;
  expression += d;
  paintDisplay();
}

function pushDot(): void {
  if (state === "computed") {
    expression = "";
    lastBinaryOp = null;
    lastOperand = null;
    lastResult = null;
    setState("building");
  } else if (state === "error") {
    expression = "";
    setState("building");
  }
  if (expression.length >= MAX_INPUT_LEN) return;
  // 当前数字段已含 "."
  const tail = expression.split(/[+\-×÷()]/).pop() ?? "";
  if (tail.includes(".")) return;
  // 表达式为空或末尾是运算符 → 自动补 "0"
  if (expression === "" || /[+\-×÷(]$/.test(expression)) {
    expression += "0";
  }
  expression += ".";
  paintDisplay();
}

function pushOp(op: BasicOperator): void {
  if (state === "error") {
    setState("building");
  }
  if (expression === "") {
    // 允许在空表达式里直接输入负号 → 一元
    if (op === "−") {
      expression += "-";
      paintDisplay();
      return;
    }
    return;
  }
  const lastCh = expression[expression.length - 1] ?? "";
  // 末尾是运算符 → 替换
  if (isOpChar(lastCh)) {
    // 末尾是一元负号（紧跟在 op/lp 之后的 "-"）→ 不替换，避免吃掉符号
    const prev = expression[expression.length - 2] ?? "";
    const prevIsOpOrLp = prev === "" || isOpChar(prev) || prev === "(";
    if (lastCh === "-" && prevIsOpOrLp) {
      // 一元负号位置：忽略重复 −
      return;
    }
    // 否则替换末尾运算符
    expression = expression.slice(0, -1) + op;
    paintDisplay();
    return;
  }
  // 末尾是数字或括号 → 直接追加
  expression += op;
  paintDisplay();
}

function equals(): void {
  if (
    state === "computed" &&
    lastBinaryOp !== null &&
    lastOperand !== null &&
    lastResult !== null
  ) {
    // 续算：result op operand
    const expr = `${formatBasic(lastResult)}${lastBinaryOp}${formatBasic(lastOperand)}`;
    const r = evaluateExpression(expr);
    if (!r.ok) {
      setState("error", r.error.message);
      announce(`计算错误：${r.error.message}`);
      return;
    }
    lastResult = r.value;
    expression =
      `${renderExpression() ? renderExpression() + "=" : ""}${formatBasic(r.value)}`.replace(
        /^=/,
        "",
      );
    paintDisplay();
    lastCopyText = `${expr.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−")} = ${formatBasic(r.value)}`;
    setState("computed");
    announce(`等于 ${formatBasic(r.value)}`);
    return;
  }
  if (expression === "") return;
  const r = evaluateExpression(expression);
  if (!r.ok) {
    setState("error", r.error.message);
    announce(`计算错误：${r.error.message}`);
    return;
  }
  // 记录最后一次二元运算符与右侧操作数（用于续算）
  const m = expression.match(/([+\-×÷])([+-]?\d+(\.\d+)?)$/);
  if (m && m[1] && m[2] !== undefined) {
    lastBinaryOp = m[1] as BasicOperator;
    lastOperand = Number(m[2]);
  } else {
    lastBinaryOp = null;
    lastOperand = null;
  }
  lastResult = r.value;
  const exprText = renderExpression();
  lastCopyText = `${exprText} = ${formatBasic(r.value)}`;
  setState("computed");
  display.textContent = formatBasic(r.value);
  announce(`等于 ${formatBasic(r.value)}`);
}

function clearEntry(): void {
  // 清当前输入：去掉最后一个数字段
  const m = expression.match(/^(.*?)([+\-×÷(])?([+-]?\d*\.?\d*)$/);
  if (m && m[3] !== undefined && m[3] !== "") {
    expression = (m[1] ?? "") + (m[2] ?? "");
    paintDisplay();
  } else {
    expression = "";
    paintDisplay();
  }
  setState("building");
}

function clearAll(): void {
  expression = "";
  lastBinaryOp = null;
  lastOperand = null;
  lastResult = null;
  paintDisplay();
  setState("building");
}

function backspace(): void {
  if (state === "computed") {
    // 在 computed 状态下按 ⌫：回到 building 状态、清空
    expression = "";
    lastBinaryOp = null;
    lastOperand = null;
    setState("building");
    paintDisplay();
    return;
  }
  if (state === "error") {
    setState("building");
  }
  if (expression.length > 0) {
    expression = expression.slice(0, -1);
    paintDisplay();
  }
}

function sign(): void {
  if (state === "error") return;
  if (expression === "") return;
  // 找到最后一个运算符/左括号后的一元前缀位置
  const tail = expression;
  if (/[0-9.]$/.test(tail)) {
    // 末位是数字 → 给尾段加 "−"
    const m = tail.match(/([+\-×÷(])([+-]?\d*\.?\d*)$/);
    if (m && m[2] !== undefined && m[2] !== "") {
      const num = m[2];
      const replaced = toggleSign(num);
      expression = tail.slice(0, tail.length - num.length) + replaced;
      paintDisplay();
      return;
    }
    // 表达式只有一个数字段
    expression = toggleSign(tail);
    paintDisplay();
    return;
  }
  if (tail.endsWith("-")) {
    // 末尾是一元负号 → 去掉
    expression = tail.slice(0, -1);
    paintDisplay();
  } else if (tail.endsWith("(")) {
    // 末尾是左括号 → 在后插入 "−"
    expression = tail + "-";
    paintDisplay();
  }
}

function percent(): void {
  if (state === "error") return;
  if (expression === "") return;
  // 找到最后一个数字段，替换为该数字 ÷100
  const tail = expression;
  const m = tail.match(/([+\-×÷(])([+-]?\d*\.?\d*)$/);
  if (m && m[2] !== undefined && m[2] !== "") {
    const num = m[2];
    const replaced = applyPercent(num);
    expression = tail.slice(0, tail.length - num.length) + replaced;
    paintDisplay();
    return;
  }
  // 表达式只有一个数字段
  expression = applyPercent(tail);
  paintDisplay();
}

function handleKey(def: KeyDef): void {
  switch (def.kind) {
    case "digit":
      pushDigit(def.insert);
      return;
    case "dot":
      pushDot();
      return;
    case "op":
      pushOp(def.op);
      return;
    case "action":
      switch (def.action) {
        case "equals":
          equals();
          return;
        case "clear-entry":
          clearEntry();
          return;
        case "clear-all":
          clearAll();
          return;
        case "backspace":
          backspace();
          return;
        case "sign":
          sign();
          return;
        case "percent":
          percent();
          return;
      }
  }
}

// 构造按钮 DOM（按钮在 Astro 模板中静态生成，脚本只挂事件）
function wireKeys(): void {
  const buttons =
    keypad.querySelectorAll<HTMLButtonElement>("button[data-key]");
  buttons.forEach((btn) => {
    const id = btn.dataset.key;
    if (!id) return;
    const def = KEYS.find((k) => "label" in k && k.label === id);
    if (!def) return;
    btn.addEventListener("click", () => {
      handleKey(def);
      btn.blur();
    });
  });
}

// 物理键盘映射
function wireKeyboard(): void {
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
        return;
    }
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      handleKey({ kind: "digit", label: k, insert: k });
      return;
    }
    if (k === ".") {
      e.preventDefault();
      handleKey({ kind: "dot", label: ".", insert: "." });
      return;
    }
    if (k === "+") {
      e.preventDefault();
      handleKey({ kind: "op", label: "+", op: "+" });
      return;
    }
    if (k === "-") {
      e.preventDefault();
      handleKey({ kind: "op", label: "−", op: "−" });
      return;
    }
    if (k === "*") {
      e.preventDefault();
      handleKey({ kind: "op", label: "×", op: "×" });
      return;
    }
    if (k === "/") {
      e.preventDefault();
      handleKey({ kind: "op", label: "÷", op: "÷" });
      return;
    }
    if (k === "Enter" || k === "=") {
      e.preventDefault();
      handleKey({ kind: "action", label: "=", action: "equals" });
      return;
    }
    if (k === "Backspace") {
      e.preventDefault();
      handleKey({ kind: "action", label: "⌫", action: "backspace" });
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      handleKey({ kind: "action", label: "AC", action: "clear-all" });
      return;
    }
    if (k === "%") {
      e.preventDefault();
      handleKey({ kind: "action", label: "%", action: "percent" });
      return;
    }
  });
}

function wireCopy(): void {
  copyBtn.addEventListener("click", () => {
    void copyText(lastCopyText).then((ok) => {
      flashButton(copyBtn, ok ? "已复制" : "复制失败");
    });
  });
}

wireKeys();
wireKeyboard();
wireCopy();
paintDisplay();
setState("building");
