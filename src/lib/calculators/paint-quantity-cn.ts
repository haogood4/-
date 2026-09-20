// 乳胶漆用量计算器
import { validateNumber, formatResult } from "./_shared";

export type PaintInput = {
  wallArea: string; // 墙面面积 m²
  coats: string; // 涂刷遍数
  coveragePerLiter: string; // 1L 涂刷面积 m²（典型 10-12）
};

export type PaintResult = { liters: number; cans: number };
export type PaintCalcResult =
  | { ok: true; value: PaintResult }
  | { ok: false; error: { code: string; message: string } };

const CAN_VOLUME = 5; // 标准 5L 桶

export function calculatePaint(input: PaintInput): PaintCalcResult {
  const a = validateNumber(input.wallArea);
  if (!a.ok) return a;
  const c = validateNumber(input.coats);
  if (!c.ok) return c;
  const cv = validateNumber(input.coveragePerLiter);
  if (!cv.ok) return cv;
  if (a.value <= 0)
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "墙面面积须大于 0" },
    };
  if (!Number.isInteger(c.value) || c.value < 1 || c.value > 5) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "涂刷遍数须为 1-5 的整数" },
    };
  }
  if (cv.value <= 0 || cv.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "1L 涂刷面积须 0-30 m²" },
    };
  }
  const liters = (a.value * c.value) / cv.value;
  const cans = Math.ceil(liters / CAN_VOLUME);
  return { ok: true, value: { liters, cans } };
}

export function formatPaint(value: PaintResult) {
  return {
    liters: formatResult(value.liters) + " L",
    cans: String(value.cans) + " 桶（5L/桶）",
  };
}
