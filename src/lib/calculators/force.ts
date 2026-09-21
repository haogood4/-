// 力单位换算 —— 基准：牛顿（N，SI 导出单位 kg·m/s²）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 千克力（kgf）按国际标准重力加速度 g0 = 9.80665 m/s² 精确定义：
// 1 kgf = 1 kg × 9.80665 m/s² = 9.80665 N，gf / tf 随之按千进位推得
// 1 磅力（lbf）= 1 lb（0.45359237 kg，精确定义）× 9.80665 = 4.4482216152605 N
// 1 达因（dyn）= 1 g·cm/s² = 1e-5 N（CGS 制）
export const FORCE_UNITS: FactorUnit[] = [
  { code: "mn", label: "毫牛顿", symbol: "mN", factor: 0.001 },
  { code: "n", label: "牛顿", symbol: "N", factor: 1 },
  { code: "kn", label: "千牛顿", symbol: "kN", factor: 1000 },
  { code: "kgf", label: "千克力", symbol: "kgf", factor: 9.80665 },
  { code: "gf", label: "克力", symbol: "gf", factor: 0.00980665 },
  { code: "tf", label: "吨力", symbol: "tf", factor: 9806.65 },
  { code: "lbf", label: "磅力", symbol: "lbf", factor: 4.4482216152605 },
  { code: "dyn", label: "达因", symbol: "dyn", factor: 0.00001 },
];

const converter: FactorConverter = createFactorConverter(FORCE_UNITS);

export const convertForce = converter.convert;
export const forceUnit = converter.unit;
