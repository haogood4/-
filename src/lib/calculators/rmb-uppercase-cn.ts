// 人民币金额中文大写转换 —— 纯函数，无 DOM 依赖，绝不 throw
// 规则参照《正确填写票据和结算凭证的基本规定》（中国人民银行）：
// 数字中文大写（零壹贰叁肆伍陆柒捌玖）、拾佰仟万亿进位、连续零只写一个「零」、
// 角位为 0 而分位非 0 时「元」后写「零」、无角无分结尾写「整」、负数以「负」开头。
// 全程字符串运算完成四舍五入（到分），不使用浮点乘法，避免 0.005 类精度陷阱。

export type RmbErrorCode = "EMPTY" | "INVALID_NUMBER" | "OUT_OF_RANGE";

export type RmbUppercaseResult =
  | {
      ok: true;
      /** 中文大写全文（含「负」前缀，不含「人民币」字样） */
      text: string;
      /** 是否为负数（四舍五入后为 0 时视为非负） */
      negative: boolean;
      /** 四舍五入到分后的绝对金额（单位：分） */
      cents: number;
    }
  | { ok: false; error: { code: RmbErrorCode; message: string } };

const DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const IN_GROUP_UNITS = ["", "拾", "佰", "仟"];
const GROUP_UNITS = ["", "万", "亿"];

/** 仅接受十进制字面量：可选符号 + 整数部分（必须存在）+ 可选小数部分 */
const DECIMAL_RE = /^[+-]?\d+(\.\d+)?$/;

/** 整数部分最大位数：12 位（万亿级），即上限 999999999999.99 */
const MAX_INT_DIGITS = 12;

function fail(code: RmbErrorCode, message: string): RmbUppercaseResult {
  return { ok: false, error: { code, message } };
}

/** 数字字符串 +1（仅处理进位链，输入为非空纯数字串） */
function addOne(digits: string): string {
  const arr = digits.split("");
  let i = arr.length - 1;
  while (i >= 0) {
    if (arr[i] === "9") {
      arr[i] = "0";
      i--;
    } else {
      arr[i] = String.fromCharCode(arr[i].charCodeAt(0) + 1);
      return arr.join("");
    }
  }
  return "1" + arr.join("");
}

/**
 * 整数部分转中文大写（输入为无符号数字串，可含前导零）。
 * 逐位处理 + 组（万/亿）标记：组内连续零只记一个待写「零」；
 * 组末若该组有非零数字则补「万/亿」并清除待写零（避免 贰拾万零叁仟 类多余零）。
 */
function integerToChinese(intStr: string): string {
  const s = intStr.replace(/^0+/, "");
  if (s === "") return "零";
  const n = s.length;
  let out = "";
  let zeroPending = false;
  for (let i = 0; i < n; i++) {
    const pos = n - 1 - i;
    const groupIdx = Math.floor(pos / 4);
    const inGroup = pos % 4;
    const d = s.charCodeAt(i) - 48;
    if (d === 0) {
      zeroPending = true;
    } else {
      if (zeroPending) out += "零";
      zeroPending = false;
      out += DIGITS[d] + IN_GROUP_UNITS[inGroup];
    }
    if (inGroup === 0 && groupIdx > 0) {
      let groupNonZero = false;
      for (let j = Math.max(0, i - 3); j <= i; j++) {
        if (s[j] !== "0") {
          groupNonZero = true;
          break;
        }
      }
      if (groupNonZero) {
        out += GROUP_UNITS[groupIdx];
        zeroPending = false;
      }
    }
  }
  return out;
}

/**
 * 将十进制金额字符串转为人民币中文大写。
 * 四舍五入到分（半进上，字符串运算）；支持负数；整数部分最多 12 位。
 */
export function convertRmbUppercase(input: {
  value: string;
}): RmbUppercaseResult {
  const trimmed = input.value.trim();
  if (trimmed === "") {
    return fail("EMPTY", "请输入金额");
  }
  if (!DECIMAL_RE.test(trimmed)) {
    return fail(
      "INVALID_NUMBER",
      "请输入有效的十进制金额（不支持科学计数法、千分位逗号或货币符号）",
    );
  }

  const negative = trimmed.startsWith("-");
  const unsigned = trimmed.replace(/^[+-]/, "");
  const dot = unsigned.indexOf(".");
  let intDigits = dot === -1 ? unsigned : unsigned.slice(0, dot);
  const frac = dot === -1 ? "" : unsigned.slice(dot + 1);

  // 四舍五入到分：仅看第 3 位小数即可精确判定（≥5 进位，<5 舍去），纯字符串比较
  let cents = Number((frac + "00").slice(0, 2));
  const third = frac[2] ?? "0";
  if (third >= "5") {
    cents += 1;
    if (cents === 100) {
      cents = 0;
      intDigits = addOne(intDigits);
    }
  }

  intDigits = intDigits.replace(/^0+/, "") || "0";
  if (intDigits.length > MAX_INT_DIGITS) {
    return fail(
      "OUT_OF_RANGE",
      `金额超出范围：整数部分最多 ${MAX_INT_DIGITS} 位（上限 999999999999.99 元）`,
    );
  }

  const isZero = intDigits === "0" && cents === 0;
  const prefix = negative && !isZero ? "负" : "";
  const jiao = Math.floor(cents / 10);
  const fen = cents % 10;

  let text = prefix + integerToChinese(intDigits) + "元";
  if (cents === 0) {
    text += "整";
  } else {
    if (jiao > 0) {
      text += DIGITS[jiao] + "角";
      if (fen > 0) text += DIGITS[fen] + "分";
    } else {
      text += "零" + DIGITS[fen] + "分";
    }
  }

  return {
    ok: true,
    text,
    negative: negative && !isZero,
    cents: Number(intDigits) * 100 + cents,
  };
}
