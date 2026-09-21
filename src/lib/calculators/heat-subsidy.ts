// 高温津贴计算器 —— 依据《防暑降温措施管理办法》（安监总安健〔2012〕89 号）：
// 用人单位安排劳动者在 35℃ 以上高温天气从事室外露天作业，以及不能采取有效措施
// 将工作场所温度降低到 33℃ 以下的，应当向劳动者发放高温津贴，并纳入工资总额。
// 省级标准以当地人社部门最新通知为准；本页预设收录 2026 年公开报道口径。
// 注意：本工具按「标准 × 时长」线性计算，不做税率与地区系数调整。
// 省份预设已外置至 /data/heat-subsidy-presets.json（页面脚本运行时 fetch，
// .astro 与测试构建期 import 同一 JSON，本引擎保持纯计算）。

import { NUMBER_RE } from "./_shared";

export type HeatSubsidyMode = "monthly" | "daily";

export type HeatSubsidyErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "NOT_INTEGER"
  | "INVALID_MODE";

export type HeatSubsidyField = "mode" | "rate" | "duration";

export type HeatSubsidyResult =
  | {
      ok: true;
      mode: HeatSubsidyMode;
      rate: number;
      duration: number;
      total: number; // 总额 = 标准 × 时长（2 位小数）
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: HeatSubsidyErrorCode;
        message: string;
        field: HeatSubsidyField;
      };
    };

const RATE_RANGE: Record<HeatSubsidyMode, { min: number; max: number }> = {
  monthly: { min: 0.01, max: 1000 },
  daily: { min: 0.01, max: 200 },
};

const DURATION_RANGE: Record<HeatSubsidyMode, { min: number; max: number }> = {
  monthly: { min: 1, max: 12 },
  daily: { min: 1, max: 366 },
};

const MAX_DECIMALS = 2;

export interface HeatSubsidyInput {
  mode: string;
  rate: string;
  duration: string;
}

function fail(
  code: HeatSubsidyErrorCode,
  message: string,
  field: HeatSubsidyField,
): HeatSubsidyResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isMode(s: string): s is HeatSubsidyMode {
  return s === "monthly" || s === "daily";
}

function parseRate(
  raw: string,
  mode: HeatSubsidyMode,
): number | HeatSubsidyResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", "请填写发放标准", "rate");
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "rate");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", "rate");
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", "rate");
  }
  const range = RATE_RANGE[mode];
  if (n < range.min || n > range.max) {
    const hint =
      mode === "monthly"
        ? "按月标准需在 0.01 ~ 1000 元/月之间"
        : "按日标准需在 0.01 ~ 200 元/日之间";
    return fail("OUT_OF_RANGE", hint, "rate");
  }
  return n;
}

function parseDuration(
  raw: string,
  mode: HeatSubsidyMode,
): number | HeatSubsidyResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return fail(
      "EMPTY",
      mode === "monthly" ? "请填写发放月数" : "请填写发放天数",
      "duration",
    );
  }
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "duration");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return fail("INVALID_NUMBER", "请输入有效数字", "duration");
  }
  if (!Number.isInteger(n)) {
    return fail(
      "NOT_INTEGER",
      mode === "monthly" ? "发放月数需为整数" : "发放天数需为整数",
      "duration",
    );
  }
  const range = DURATION_RANGE[mode];
  if (n < range.min || n > range.max) {
    const hint =
      mode === "monthly"
        ? "发放月数需在 1 ~ 12 之间"
        : "发放天数需在 1 ~ 366 之间";
    return fail("OUT_OF_RANGE", hint, "duration");
  }
  return n;
}

export function calculateHeatSubsidy(
  input: HeatSubsidyInput,
): HeatSubsidyResult {
  if (!isMode(input.mode)) {
    return fail("INVALID_MODE", "请选择计发方式（按月或按日）", "mode");
  }
  const mode = input.mode;
  const rate = parseRate(input.rate, mode);
  if (typeof rate !== "number") return rate;
  const duration = parseDuration(input.duration, mode);
  if (typeof duration !== "number") return duration;

  const total = round2(rate * duration);
  const unit = mode === "monthly" ? "元/月" : "元/日";
  const span = mode === "monthly" ? `${duration} 个月` : `${duration} 日`;
  const formulaText =
    `高温津贴 = ${rate} ${unit} × ${span} = ¥${total.toFixed(2)}` +
    `（发放时长以当地规定与实际出勤为准）`;

  return { ok: true, mode, rate, duration, total, formulaText };
}
