// 交通事故人身损害赔偿估算 —— 依据最高人民法院《关于审理人身损害赔偿案件适用法律若干问题的解释》
// （法释〔2020〕17 号 / 2022 修正 · 法释〔2022〕14 号）：
//   残疾/死亡赔偿金：受诉法院所在地上一年度城镇居民人均可支配收入 × 系数 × 年限
//     （系数：1 级 0.1，2 级 0.2，…，10 级 1.0；60+ 每多 1 岁减 1 年；75+ 按 5 年）
//   误工费：误工天数 × 日收入（无固定收入可参受诉地相同/相近行业职工平均工资）
//   护理费：护理天数 × 日护工报酬
//   住院伙食补助：参考 100 元/天（各地差异）
//   丧葬费：当地职工月平均工资 × 6
// 本工具按用户输入的收入、年龄、伤残等级、责任比例给出项目化估算，最终以受诉法院判决为准。

import { NUMBER_RE } from "./_shared";

export type TrafficErrorCode =
  | "EMPTY"
  | "INVALID_NUMBER"
  | "TOO_MANY_DECIMALS"
  | "OUT_OF_RANGE"
  | "INVALID_LEVEL";

export type TrafficField = "income" | "disposableIncome" | "age" | "disability";

export interface TrafficItem {
  label: string;
  amount: number;
  note: string;
}

export type TrafficResult =
  | {
      ok: true;
      items: TrafficItem[];
      subtotal: number;
      liabilityRatio: number;
      total: number;
      formulaText: string;
    }
  | {
      ok: false;
      error: {
        code: TrafficErrorCode;
        message: string;
        field: TrafficField;
      };
    };

const MAX_DECIMALS = 2;
const MONEY_MIN = 0;
const MONEY_MAX = 100_000_000;
const AGE_MIN = 0;
const AGE_MAX = 120;
const DAYS_MAX = 3650;
const LEVEL_MIN = 1;
const LEVEL_MAX = 10;
const DEFAULT_LIABILITY_RATIO = 1; // 全责
const HOSPITAL_MEAL_PER_DAY = 100; // 参考口径
const AGE_CAP_REDUCE = 60; // ≥60 每多 1 岁减 1 年
const AGE_FLOOR = 5; // 75+ 按 5 年

function fail(
  code: TrafficErrorCode,
  message: string,
  field: TrafficField,
): TrafficResult {
  return { ok: false, error: { code, message, field } };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseMoney(
  raw: string,
  field: TrafficField,
  label: string,
  options: { min?: number; max?: number } = {},
): number | TrafficResult {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return options.min === 0 ? 0 : fail("EMPTY", `请填写${label}`, field);
  }
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入有效数字", field);
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n))
    return fail("INVALID_NUMBER", "请输入有效数字", field);
  const dot = trimmed.indexOf(".");
  if (dot !== -1 && trimmed.length - dot - 1 > MAX_DECIMALS) {
    return fail("TOO_MANY_DECIMALS", "小数位数不能超过 2 位", field);
  }
  const min = options.min ?? MONEY_MIN;
  const max = options.max ?? MONEY_MAX;
  if (n < min || n > max) {
    return fail("OUT_OF_RANGE", `${label}需在 ${min} ~ ${max} 之间`, field);
  }
  return n;
}

function parseAge(raw: string): number | TrafficResult {
  const trimmed = raw.trim();
  if (trimmed === "") return 0; // 留空默认 0（伤残系数年龄扣减不触发）
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入 0~120 整数", "age");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return fail("INVALID_NUMBER", "请输入数字", "age");
  if (n < AGE_MIN || n > AGE_MAX) {
    return fail("OUT_OF_RANGE", "年龄需在 0 ~ 120 之间", "age");
  }
  return n;
}

function parseDisability(raw: string): number | TrafficResult {
  const trimmed = raw.trim();
  if (trimmed === "") return 0; // 留空 = 无残疾
  if (!/^\d+$/.test(trimmed)) {
    return fail("INVALID_NUMBER", "请输入 1~10 整数", "disability");
  }
  const n = Number(trimmed);
  if (!Number.isInteger(n))
    return fail("INVALID_NUMBER", "请输入整数", "disability");
  if (n < LEVEL_MIN || n > LEVEL_MAX) {
    return fail("OUT_OF_RANGE", "伤残等级需在 1~10 之间", "disability");
  }
  return n;
}

// 系数：1 级 0.1 ... 10 级 1.0（《最高法关于审理人身损害赔偿案件适用法律若干问题的解释》第十二条）
function disabilityRatio(level: number): number {
  return level / 10;
}

function disabilityYears(age: number): number {
  if (age === 0) return 20; // 未填年龄，按 20 年
  if (age >= 75) return AGE_FLOOR;
  if (age >= AGE_CAP_REDUCE) {
    // 60+ 每多 1 岁减 1 年：61→19, 65→15, ..., 74→6（≥75 走 AGE_FLOOR 分支）
    const years = 20 - (age - AGE_CAP_REDUCE);
    return Math.max(AGE_FLOOR, years);
  }
  return 20;
}

export interface TrafficInput {
  income: string; // 日收入（误工费）
  liability: string; // 0~1，本工具按用户输入百分比（如 0.6 表示 60%）
  medical: string;
  missDays: string;
  careDays: string;
  dailyCare: string;
  hospitalDays: string;
  nutrition: string;
  transport: string;
  disability: string; // 0/1~10
  age: string;
  death: string; // "true"/"false" 死亡则按 1 级系数计死亡赔偿金 + 丧葬费
  disposableIncome: string; // 受诉法院所在地上一年度城镇居民人均可支配收入（元）
  funeralBase: string; // 当地职工月平均工资，用于丧葬费（可选，留空=income×21.75×? → 默认按 income/30 × 6）
}

export function calculateTraffic(input: TrafficInput): TrafficResult {
  const income = parseMoney(input.income, "income", "日收入", { min: 0 });
  if (typeof income !== "number") return income;
  const liabilityRaw = parseMoney(input.liability, "income", "责任比例", {
    min: 0,
    max: 1,
  });
  if (typeof liabilityRaw !== "number") return liabilityRaw;
  const liability = liabilityRaw === 0 ? DEFAULT_LIABILITY_RATIO : liabilityRaw;

  const medical = parseMoney(input.medical, "income", "医疗费");
  if (typeof medical !== "number") return medical;
  const missDays = parseMoney(input.missDays, "income", "误工天数", {
    min: 0,
    max: DAYS_MAX,
  });
  if (typeof missDays !== "number") return missDays;
  const careDays = parseMoney(input.careDays, "income", "护理天数", {
    min: 0,
    max: DAYS_MAX,
  });
  if (typeof careDays !== "number") return careDays;
  const dailyCare = parseMoney(input.dailyCare, "income", "日护工报酬");
  if (typeof dailyCare !== "number") return dailyCare;
  const hospitalDays = parseMoney(input.hospitalDays, "income", "住院天数", {
    min: 0,
    max: DAYS_MAX,
  });
  if (typeof hospitalDays !== "number") return hospitalDays;
  const nutrition = parseMoney(input.nutrition, "income", "营养费");
  if (typeof nutrition !== "number") return nutrition;
  const transport = parseMoney(input.transport, "income", "交通费");
  if (typeof transport !== "number") return transport;

  const disabilityLevel = parseDisability(input.disability);
  if (typeof disabilityLevel !== "number") return disabilityLevel;
  const age = parseAge(input.age);
  if (typeof age !== "number") return age;
  const death = input.death === "true";
  const disposableIncome = parseMoney(
    input.disposableIncome,
    "disposableIncome",
    "人均可支配收入",
  );
  if (typeof disposableIncome !== "number") return disposableIncome;

  const funeralBaseRaw = parseMoney(
    input.funeralBase,
    "income",
    "当地职工月平均工资（丧葬费基数）",
  );
  if (typeof funeralBaseRaw !== "number") return funeralBaseRaw;
  const funeralBase = funeralBaseRaw > 0 ? funeralBaseRaw : income * 30;

  const items: TrafficItem[] = [];
  if (medical > 0) {
    items.push({
      label: "医疗费",
      amount: medical,
      note: "按医疗机构收款凭证实报实销（解释第六条）",
    });
  }
  const missPay = round2(income * missDays);
  if (missPay > 0) {
    items.push({
      label: "误工费",
      amount: missPay,
      note: `${missDays} 天 × 日收入 ¥${income}（解释第七条）`,
    });
  }
  const carePay = round2(dailyCare * careDays);
  if (carePay > 0) {
    items.push({
      label: "护理费",
      amount: carePay,
      note: `${careDays} 天 × 日护工报酬 ¥${dailyCare}（解释第八条）`,
    });
  }
  const hospitalMeal = round2(hospitalDays * HOSPITAL_MEAL_PER_DAY);
  if (hospitalMeal > 0) {
    items.push({
      label: "住院伙食补助",
      amount: hospitalMeal,
      note: `${hospitalDays} 天 × 参考 ¥${HOSPITAL_MEAL_PER_DAY}/天（各地差异）`,
    });
  }
  if (nutrition > 0) {
    items.push({
      label: "营养费",
      amount: nutrition,
      note: "参照医嘱实报",
    });
  }
  if (transport > 0) {
    items.push({
      label: "交通费",
      amount: transport,
      note: "以正式票据为准（解释第九条）",
    });
  }

  if (death) {
    const ratio = disabilityRatio(1); // 1 级 0.1（死亡按 1 级系数）
    const years = disabilityYears(age);
    const deathPay = round2(disposableIncome * ratio * years);
    if (deathPay > 0) {
      items.push({
        label: "死亡赔偿金",
        amount: deathPay,
        note: `人均可支配收入 ¥${disposableIncome} × ${ratio}（1 级系数）× ${years} 年`,
      });
    }
    const funeral = round2((funeralBase * 6) / 1); // 6 个月
    items.push({
      label: "丧葬费",
      amount: funeral,
      note: `当地职工月平均工资 ¥${funeralBase} × 6（解释第十三条）`,
    });
  } else if (disabilityLevel > 0) {
    const ratio = disabilityRatio(disabilityLevel);
    const years = disabilityYears(age);
    const disabilityPay = round2(disposableIncome * ratio * years);
    if (disabilityPay > 0) {
      items.push({
        label: "残疾赔偿金",
        amount: disabilityPay,
        note: `人均可支配收入 ¥${disposableIncome} × ${ratio}（${disabilityLevel} 级系数） × ${years} 年（解释第十二条）`,
      });
    }
  }

  const subtotal = round2(items.reduce((sum, it) => sum + it.amount, 0));
  const total = round2(subtotal * liability);

  const formulaParts = items.length
    ? items.map((it) => `${it.label} ¥${it.amount.toFixed(2)}`).join("；")
    : "未填写任何赔偿项目";
  const formulaText = `项目小计 ¥${subtotal.toFixed(2)}；责任比例 ${(liability * 100).toFixed(0)}% → 估算赔付 ¥${total.toFixed(2)}（${formulaParts}）`;

  return {
    ok: true,
    items,
    subtotal,
    liabilityRatio: liability,
    total,
    formulaText,
  };
}
