// 体积流量单位换算 —— 基准：升每秒（L/s）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 公制：1 m³ = 1000 L，故 1 m³/s = 1000 L/s；1 m³/h = 1000 L / 3600 s = 1/3.6 L/s；1 L/min = 1/60 L/s
// 美制：1 加仑(US) = 3.785411784 L（精确定义），1 gal/min = 3.785411784/60 ≈ 0.0630901964 L/s
// 1 立方英尺 = 28.316846592 L（精确定义），1 CFM（ft³/min）= 28.316846592/60 ≈ 0.4719474432 L/s
export const FLOW_UNITS: FactorUnit[] = [
  { code: "mls", label: "毫升/秒", symbol: "mL/s", factor: 0.001 },
  { code: "ls", label: "升/秒", symbol: "L/s", factor: 1 },
  { code: "lmin", label: "升/分", symbol: "L/min", factor: 1 / 60 },
  { code: "m3h", label: "立方米/小时", symbol: "m³/h", factor: 1 / 3.6 },
  { code: "m3s", label: "立方米/秒", symbol: "m³/s", factor: 1000 },
  {
    code: "gpm",
    label: "美制加仑/分",
    symbol: "gal/min",
    factor: 0.0630901964,
  },
  { code: "cfm", label: "立方英尺/分", symbol: "CFM", factor: 0.4719474432 },
];

const converter: FactorConverter = createFactorConverter(FLOW_UNITS);

export const convertFlow = converter.convert;
export const flowUnit = converter.unit;
