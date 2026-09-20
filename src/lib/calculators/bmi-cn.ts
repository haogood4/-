// BMI 计算器（中国标准 + WHO 标准双分类）
// BMI = 体重(kg) / 身高(m)²
import { validateNumber, type SharedErrorCode } from "./_shared";

export type BmiInput = {
  height: string; // 身高 cm
  weight: string; // 体重 kg
};

export type BmiResult = {
  bmi: number; // 保留 1 位小数
  categoryCn: string; // 中国标准分类
  categoryWho: string; // WHO 标准分类
  categorySimple: string; // 简化 4 分类（外部实现口径：偏瘦/正常/超重/肥胖）
  healthyMinCn: number; // 中国标准健康体重下限 kg（BMI 18.5）
  healthyMaxCn: number; // 中国标准健康体重上限 kg（BMI 23.9）
  healthyMinWho: number; // WHO 标准健康体重下限 kg（BMI 18.5）
  healthyMaxWho: number; // WHO 标准健康体重上限 kg（BMI 24.9）
};

export type BmiError = {
  code: SharedErrorCode | "OVER_LIMIT";
  message: string;
};
export type BmiResult2 =
  { ok: true; value: BmiResult } | { ok: false; error: BmiError };

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

// 按保留 1 位小数后的 BMI 分类，保证展示数值与分类一致
function classify(bmi: number, who: boolean): string {
  if (bmi < 18.5) return "偏瘦";
  if (who) {
    if (bmi < 25) return "正常";
    if (bmi < 30) return "偏胖";
    return "肥胖";
  }
  if (bmi < 24) return "正常";
  if (bmi < 28) return "偏胖";
  return "肥胖";
}

// 外部实现口径：偏瘦/正常/超重/肥胖（阈值 18.5/24/28，与中国标准一致）
function classifySimple(bmi: number): string {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "超重";
  return "肥胖";
}

export function calculateBmi(input: BmiInput): BmiResult2 {
  const h = validateNumber(input.height);
  if (!h.ok) return h;
  const w = validateNumber(input.weight);
  if (!w.ok) return w;
  if (h.value < 50 || h.value > 250) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "身高须在 50-250 厘米之间" },
    };
  }
  if (w.value < 2 || w.value > 500) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "体重须在 2-500 千克之间" },
    };
  }
  const meters = h.value / 100;
  const bmi = round1(w.value / (meters * meters));
  return {
    ok: true,
    value: {
      bmi,
      categoryCn: classify(bmi, false),
      categoryWho: classify(bmi, true),
      categorySimple: classifySimple(bmi),
      healthyMinCn: round1(18.5 * meters * meters),
      healthyMaxCn: round1(23.9 * meters * meters),
      healthyMinWho: round1(18.5 * meters * meters),
      healthyMaxWho: round1(24.9 * meters * meters),
    },
  };
}

export function formatBmi(value: BmiResult): {
  bmi: string;
  categoryCn: string;
  categoryWho: string;
  categorySimple: string;
  healthyRangeCn: string;
  healthyRangeWho: string;
  healthyWeightSimple: string; // 外部实现口径：18.5 ~ 24
} {
  // 外部实现：minW = 18.5*h*h, maxW = 24*h*h（保留 1 位）
  const m = value.healthyMinCn / 18.5; // meters² from healthyMinCn = 18.5*m²
  const simpleMin = (18.5 * m).toFixed(1);
  const simpleMax = (24 * m).toFixed(1);
  return {
    bmi: value.bmi.toFixed(1),
    categoryCn: value.categoryCn,
    categoryWho: value.categoryWho,
    categorySimple: value.categorySimple,
    healthyRangeCn: `${value.healthyMinCn.toFixed(1)} – ${value.healthyMaxCn.toFixed(1)} kg`,
    healthyRangeWho: `${value.healthyMinWho.toFixed(1)} – ${value.healthyMaxWho.toFixed(1)} kg`,
    healthyWeightSimple: `${simpleMin} – ${simpleMax} kg`,
  };
}
