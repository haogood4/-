// 年终奖计税方式对比计算器 —— 纯函数，无 DOM 依赖
// 政策依据：财政部 税务总局公告 2023 年第 30 号——全年一次性奖金单独计税政策延续至 2027-12-31。
// 单独计税：年终奖 ÷ 12 按月度税率表定税率，速算扣除数只减一次（不乘 12）；
// 并入综合：合并后应纳税所得额按年度综合所得税率表全额计税，
//   incrementalMerge = 合并后税额 − 无奖金时综合所得税额（并入方式下年终奖实际多缴）。
// 税率表口径与 bonus-tax-cn / income-tax-cn 一致；两表均未导出，故在本引擎内自建（月度表 + 年度表）。

export type BonusCompareErrorCode =
  "EMPTY" | "INVALID_NUMBER" | "TOO_MANY_DECIMALS" | "OUT_OF_RANGE";

export type BonusCompareField = "bonus" | "taxable";

export type BonusCompareResult =
  | {
      ok: true;
      bonus: number;
      taxableIncome: number;
      taxSeparate: number; // 单独计税税额
      separateRate: number; // 月度表税率（小数，如 0.1）
      separateQuick: number; // 速算扣除数（只减一次，不乘 12）
      taxWithoutBonus: number; // 综合所得单独按年度表计税税额
      taxWithBonus: number; // 合并后全额税额
      incrementalMerge: number; // 并入方式下年终奖实际多缴
      recommended: "separate" | "merge";
      recommendedText: string;
      saving: number; // 推荐方式可省金额（绝对值）
      breakdownText: string;
    }
  | {
      ok: false;
      error: {
        code: BonusCompareErrorCode;
        message: string;
        field: BonusCompareField;
      };
    };

interface BonusCompareInput {
  bonus: string;
  taxableIncome: string;
}

interface Bracket {
  upTo: number;
  rate: number;
  quick: number;
}

// 全月一次性奖金税率表（按 bonus ÷ 12 查档，月度级距）
const MONTHLY_BRACKETS: Bracket[] = [
  { upTo: 3000, rate: 0.03, quick: 0 },
  { upTo: 12000, rate: 0.1, quick: 210 },
  { upTo: 25000, rate: 0.2, quick: 1410 },
  { upTo: 35000, rate: 0.25, quick: 2660 },
  { upTo: 55000, rate: 0.3, quick: 4410 },
  { upTo: 80000, rate: 0.35, quick: 7160 },
  { upTo: Infinity, rate: 0.45, quick: 15160 },
];

// 综合所得年度税率表
const ANNUAL_BRACKETS: Bracket[] = [
  { upTo: 36000, rate: 0.03, quick: 0 },
  { upTo: 144000, rate: 0.1, quick: 2520 },
  { upTo: 300000, rate: 0.2, quick: 16920 },
  { upTo: 420000, rate: 0.25, quick: 31920 },
  { upTo: 660000, rate: 0.3, quick: 52920 },
  { upTo: 960000, rate: 0.35, quick: 85920 },
  { upTo: Infinity, rate: 0.45, quick: 181920 },
];

const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)$/;
const MAX_DECIMALS = 2;
const MONEY_MAX = 10_000_000;

function fail(
  code: BonusCompareErrorCode,
  message: string,
  field: BonusCompareField,
): BonusCompareResult {
  return { ok: false, error: { code, message, field } };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function fmt2(v: number): string {
  return v.toFixed(2);
}

function pct(rate: number): number {
  return Math.round(rate * 100);
}

function lookup(brackets: Bracket[], value: number): Bracket {
  return brackets.find((b) => value <= b.upTo)!;
}

/** 综合所得按年度表计税；应纳税所得额 ≤ 0 时无税 */
function annualTax(taxable: number): number {
  if (taxable <= 0) return 0;
  const b = lookup(ANNUAL_BRACKETS, taxable);
  return taxable * b.rate - b.quick;
}

/** 解析金额文本；空 → EMPTY，非法 → INVALID_NUMBER，超 2 位小数 → TOO_MANY_DECIMALS */
function parseMoney(
  raw: string,
  field: BonusCompareField,
  label: string,
): number | BonusCompareResult {
  const trimmed = raw.trim();
  if (trimmed === "") return fail("EMPTY", `请填写${label}`, field);
  if (!NUMBER_RE.test(trimmed)) {
    return fail("INVALID_NUMBER", `${label}请输入有效数字`, field);
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return fail("INVALID_NUMBER", `${label}请输入有效数字`, field);
  }
  const dot = trimmed.indexOf(".");
  const decimals = dot === -1 ? 0 : trimmed.length - dot - 1;
  if (decimals > MAX_DECIMALS) {
    return fail(
      "TOO_MANY_DECIMALS",
      `${label}最多保留 ${MAX_DECIMALS} 位小数`,
      field,
    );
  }
  return value;
}

export function calculateBonusTaxCompare(
  input: BonusCompareInput,
): BonusCompareResult {
  const bonusR = parseMoney(input.bonus, "bonus", "年终奖");
  if (typeof bonusR !== "number") return bonusR;
  const bonus = bonusR;
  if (bonus <= 0) {
    return fail("OUT_OF_RANGE", "年终奖须大于 0（最低 0.01 元）", "bonus");
  }
  if (bonus > MONEY_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `年终奖超出范围（不能超过 ${MONEY_MAX} 元）`,
      "bonus",
    );
  }
  const taxableR = parseMoney(
    input.taxableIncome,
    "taxable",
    "综合所得应纳税所得额",
  );
  if (typeof taxableR !== "number") return taxableR;
  const taxable = taxableR;
  if (taxable < 0) {
    return fail(
      "OUT_OF_RANGE",
      "综合所得应纳税所得额不能为负（填 0 表示综合所得无需缴税）",
      "taxable",
    );
  }
  if (taxable > MONEY_MAX) {
    return fail(
      "OUT_OF_RANGE",
      `综合所得应纳税所得额超出范围（不能超过 ${MONEY_MAX} 元）`,
      "taxable",
    );
  }

  // 方式一：单独计税（bonus ÷ 12 定档，速算扣除数只减一次）
  const monthlyTaxable = bonus / 12;
  const mBracket = lookup(MONTHLY_BRACKETS, monthlyTaxable);
  const taxSeparate = round2(bonus * mBracket.rate - mBracket.quick);
  // 方式二：并入综合所得
  const mergedTaxable = taxable + bonus;
  const aBracket = lookup(ANNUAL_BRACKETS, mergedTaxable);
  const taxWithoutBonus = round2(annualTax(taxable));
  const taxWithBonus = round2(annualTax(mergedTaxable));
  const incrementalMerge = round2(taxWithBonus - taxWithoutBonus);

  // 推荐：比较单独计税税额与并入增量税额（按分取整后再比较，规避浮点噪声）
  const recommended: "separate" | "merge" =
    taxSeparate <= incrementalMerge ? "separate" : "merge";
  const saving = round2(Math.abs(taxSeparate - incrementalMerge));
  const chosenLabel = recommended === "separate" ? "单独计税" : "并入综合所得";
  const recommendedText =
    saving > 0
      ? `建议选择${chosenLabel}，可省 ¥${fmt2(saving)}`
      : `两种计税方式税额相同（¥${fmt2(taxSeparate)}），任选其一即可`;

  const breakdownText =
    `单独计税：${fmt2(bonus)} ÷ 12 = ${fmt2(monthlyTaxable)}，适用月度表税率 ${pct(mBracket.rate)}%（速算扣除数 ${mBracket.quick}），税额 = ${fmt2(bonus)} × ${pct(mBracket.rate)}% − ${mBracket.quick} = ¥${fmt2(taxSeparate)}；` +
    `并入综合：合并后应纳税所得额 = ${fmt2(taxable)} + ${fmt2(bonus)} = ¥${fmt2(mergedTaxable)}，适用年度表税率 ${pct(aBracket.rate)}%（速算扣除数 ${aBracket.quick}），全额税额 = ¥${fmt2(taxWithBonus)}；` +
    `综合所得单独计税 = ¥${fmt2(taxWithoutBonus)}，并入方式下年终奖实际多缴 = ¥${fmt2(incrementalMerge)}；` +
    (saving > 0
      ? `${chosenLabel}较少缴 ¥${fmt2(saving)}。`
      : `两种方式税额相同。`);

  return {
    ok: true,
    bonus,
    taxableIncome: taxable,
    taxSeparate,
    separateRate: mBracket.rate,
    separateQuick: mBracket.quick,
    taxWithoutBonus,
    taxWithBonus,
    incrementalMerge,
    recommended,
    recommendedText,
    saving,
    breakdownText,
  };
}
