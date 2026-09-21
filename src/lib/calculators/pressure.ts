// 压力单位换算 —— 基准：帕斯卡（Pa，SI 压强导出单位 N/m²）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 bar = 100000 Pa（CGS 制精确定义，= 10^5 Pa）
// 1 标准大气压（atm）= 101325 Pa（国际协议精确值）
// 1 psi = 6894.757293168 Pa（1 磅力/平方英寸，按国际磅 0.45359237 kg 与 9.80665 m/s² 精确导出）
// 1 毫米汞柱（mmHg）= 133.322387415 Pa（0 ℃ 标准重力下 1 mm 汞柱的压强）
// 1 千克力/平方厘米（kgf/cm²）= 98066.5 Pa（工程大气压 at，1 kgf = 9.80665 N 精确值）
export const PRESSURE_UNITS: FactorUnit[] = [
  { code: "kpa", label: "千帕", symbol: "kPa", factor: 1000 },
  { code: "mpa", label: "兆帕", symbol: "MPa", factor: 1000000 },
  { code: "bar", label: "巴", symbol: "bar", factor: 100000 },
  { code: "mbar", label: "毫巴", symbol: "mbar", factor: 100 },
  { code: "atm", label: "标准大气压", symbol: "atm", factor: 101325 },
  { code: "psi", label: "磅/平方英寸", symbol: "psi", factor: 6894.757293168 },
  { code: "mmhg", label: "毫米汞柱", symbol: "mmHg", factor: 133.322387415 },
  {
    code: "kgf_cm2",
    label: "千克力/平方厘米",
    symbol: "kgf/cm²",
    factor: 98066.5,
  },
];

const converter: FactorConverter = createFactorConverter(PRESSURE_UNITS);

export const convertPressure = converter.convert;
export const pressureUnit = converter.unit;
