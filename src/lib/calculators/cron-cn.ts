// cron 表达式解析引擎 —— 支持五字段（分 时 日 月 周），每个字段支持
// `*`、`*/n`、`n`、`n-m`、`n,m,k`、`n-m/k` 及其组合（逗号列表内各项可任选）。
// 周字段 0 与 7 均表示周日（输出 values 时 7 归一化为 0）。纯函数、无 DOM 依赖。
export interface CronField {
  /** 原始字段文本 */
  raw: string;
  /** 该字段可取的枚举值（升序去重） */
  values: number[];
}

export interface CronParseOk {
  valid: true;
  /** [分, 时, 日, 月, 周] */
  fields: [CronField, CronField, CronField, CronField, CronField];
  /** 中文人话描述 */
  desc: string;
}

export interface CronParseErr {
  valid: false;
  error: string;
}

export type CronParseResult = CronParseOk | CronParseErr;

/** 五字段的（min, max, 中文名） */
const FIELD_SPECS: readonly (readonly [number, number, string])[] = [
  [0, 59, "分钟"],
  [0, 23, "小时"],
  [1, 31, "日"],
  [1, 12, "月"],
  [0, 7, "星期"],
];

const WEEK_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

/** 解析单个字段（逗号列表），失败抛 Error（内部用，parseCron 捕获转错误对象） */
function parseField(raw: string, idx: number): number[] {
  const [min, max, label] = FIELD_SPECS[idx];
  if (raw === "") throw new Error(`${label}字段为空`);
  const values = new Set<number>();
  for (const part of raw.split(",")) {
    if (part === "") throw new Error(`${label}字段含空项`);
    // [主体][/步长]
    const stepSplit = part.split("/");
    if (stepSplit.length > 2)
      throw new Error(`${label}字段步进写法非法：${part}`);
    const [body, stepStr] = stepSplit;
    let step = 1;
    if (stepStr !== undefined) {
      if (!/^\d+$/.test(stepStr) || Number(stepStr) === 0) {
        throw new Error(`${label}字段步进非法：/${stepStr}`);
      }
      step = Number(stepStr);
    }
    let lo: number;
    let hi: number;
    if (body === "*") {
      lo = min;
      hi = max;
    } else if (/^\d+$/.test(body)) {
      lo = Number(body);
      hi = stepStr !== undefined ? max : lo;
    } else {
      const range = body.match(/^(\d+)-(\d+)$/);
      if (!range) throw new Error(`${label}字段写法不支持：${part}`);
      lo = Number(range[1]);
      hi = Number(range[2]);
    }
    if (lo < min || hi > max || lo > hi) {
      throw new Error(`${label}字段超出范围 ${min}-${max}：${part}`);
    }
    for (let v = lo; v <= hi; v += step)
      values.add(idx === 4 && v === 7 ? 0 : v);
  }
  return [...values].sort((a, b) => a - b);
}

/** 由五个字段值生成中文描述（够读即可，不追求穷尽自然语言） */
function describeCron(fields: readonly CronField[]): string {
  const [min, hour, dom, mon, dow] = fields;
  const isEvery = (f: CronField, min0: number, max0: number): boolean =>
    f.values.length === max0 - min0 + 1;
  if (
    isEvery(min, 0, 59) &&
    isEvery(hour, 0, 23) &&
    isEvery(dom, 1, 31) &&
    isEvery(mon, 1, 12) &&
    isEvery(dow, 0, 6)
  ) {
    return "每分钟执行一次";
  }
  const parts: string[] = [];
  const domEvery = dom.values.length === 31;
  const dowEvery = dow.values.length === 7;
  if (mon.values.length !== 12) parts.push(`${mon.values.join("、")} 月`);
  if (domEvery) {
    parts.push(
      dowEvery
        ? "每天"
        : `每周${dow.values.map((v) => WEEK_NAMES[v] ?? v).join("、")}`,
    );
  } else {
    parts.push(`${dom.values.join("、")} 日`);
    if (!dowEvery) {
      parts.push(
        `（星期${dow.values.map((v) => WEEK_NAMES[v] ?? v).join("、")}）`,
      );
    }
  }
  const hourDesc =
    hour.values.length === 24 ? "每小时" : `${hour.values.join("、")} 时`;
  const minDesc =
    min.values.length === 60 ? "每分钟" : `${min.values.join("、")} 分`;
  parts.push(`${hourDesc}${minDesc}执行`);
  return parts.join(" ");
}

export function parseCron(expr: string): CronParseResult {
  const trimmed = expr.trim().replace(/\s+/g, " ");
  const parts = trimmed === "" ? [] : trimmed.split(" ");
  if (parts.length !== 5) {
    return {
      valid: false,
      error: `应为 5 个字段（分 时 日 月 周），当前 ${parts.length} 个`,
    };
  }
  try {
    const values = parts.map((p, i) => parseField(p, i));
    const fields = values.map((vals, i) => ({ raw: parts[i], values: vals }));
    return {
      valid: true,
      fields: fields as unknown as CronParseOk["fields"],
      desc: describeCron(fields),
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "表达式解析失败",
    };
  }
}
