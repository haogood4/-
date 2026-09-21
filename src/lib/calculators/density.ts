// 密度单位换算 —— 基准：千克每立方米（kg/m³，SI 导出单位）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 g/cm³ = 0.001 kg / 0.000001 m³ = 1000 kg/m³；g/mL 与 kg/L 同值（1 mL = 1 cm³、1 L = 1000 mL）
// 1 lb = 0.45359237 kg、1 ft = 0.3048 m（均精确定义），
// 故 1 lb/ft³ = 0.45359237/0.3048³ ≈ 16.018463373960138 kg/m³，1 lb/in³ = 1 lb/ft³ × 1728 ≈ 27679.904710203125
export const DENSITY_UNITS: FactorUnit[] = [
  { code: "kgm3", label: "千克/立方米", symbol: "kg/m³", factor: 1 },
  { code: "gcm3", label: "克/立方厘米", symbol: "g/cm³", factor: 1000 },
  { code: "gml", label: "克/毫升", symbol: "g/mL", factor: 1000 },
  { code: "kgl", label: "千克/升", symbol: "kg/L", factor: 1000 },
  {
    code: "lbft3",
    label: "磅/立方英尺",
    symbol: "lb/ft³",
    factor: 16.018463373960138,
  },
  {
    code: "lbin3",
    label: "磅/立方英寸",
    symbol: "lb/in³",
    factor: 27679.904710203125,
  },
];

const converter: FactorConverter = createFactorConverter(DENSITY_UNITS);

export const convertDensity = converter.convert;
export const densityUnit = converter.unit;
