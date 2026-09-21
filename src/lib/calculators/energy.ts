// 能量单位换算 —— 基准：焦耳（J，SI 能量导出单位 N·m）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 国际蒸汽表卡（cal）= 4.1868 J（1 cal(it) = 4.1868 J 精确定义）；1 大卡 = 1000 cal
// 1 瓦时（Wh）= 3600 J、1 千瓦时（kWh，即「1 度电」）= 3600000 J（1 W × 3600 s）
// 1 英热单位（BTU）= 1055.05585262 J（国际蒸汽表 BTU 精确定义）
// 1 英尺磅力 = 1.3558179483314004 J（0.45359237 kg × 9.80665 m/s² × 0.3048 m，按 IEEE 双精度最短表示书写，值等价）
export const ENERGY_UNITS: FactorUnit[] = [
  { code: "kj", label: "千焦", symbol: "kJ", factor: 1000 },
  { code: "j", label: "焦耳", symbol: "J", factor: 1 },
  { code: "cal", label: "卡", symbol: "cal", factor: 4.1868 },
  { code: "kcal", label: "大卡", symbol: "kcal", factor: 4186.8 },
  { code: "wh", label: "瓦时", symbol: "Wh", factor: 3600 },
  { code: "kwh", label: "千瓦时", symbol: "kWh", factor: 3600000 },
  { code: "btu", label: "英热单位", symbol: "BTU", factor: 1055.05585262 },
  {
    code: "ft_lbf",
    label: "英尺磅力",
    symbol: "ft·lbf",
    factor: 1.3558179483314003,
  },
];

const converter: FactorConverter = createFactorConverter(ENERGY_UNITS);

export const convertEnergy = converter.convert;
export const energyUnit = converter.unit;
