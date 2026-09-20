// 面积单位换算 —— 基准：平方米。覆盖公制 / 市制（亩）/ 英制
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 公顷 = 10000 m²；1 亩 = 10000/15 m²（精确分数）
// 1 平方英寸 = 0.00064516 m²、1 平方英尺 = 0.09290304 m²（国际英寸精确定义）
export const AREA_UNITS: FactorUnit[] = [
  { code: "mm2", label: "平方毫米", symbol: "mm²", factor: 0.000001 },
  { code: "cm2", label: "平方厘米", symbol: "cm²", factor: 0.0001 },
  { code: "m2", label: "平方米", symbol: "m²", factor: 1 },
  { code: "mu", label: "亩", symbol: "亩", factor: 10000 / 15 },
  { code: "ha", label: "公顷", symbol: "公顷", factor: 10000 },
  { code: "km2", label: "平方公里", symbol: "km²", factor: 1000000 },
  { code: "in2", label: "平方英寸", symbol: "in²", factor: 0.00064516 },
  { code: "ft2", label: "平方英尺", symbol: "ft²", factor: 0.09290304 },
];

const converter: FactorConverter = createFactorConverter(AREA_UNITS);

export const convertArea = converter.convert;
export const areaUnit = converter.unit;
