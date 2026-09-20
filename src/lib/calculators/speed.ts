// 速度单位换算 —— 基准：千米每小时。1 英里 = 1609.344 m、1 海里 = 1852 m、1 英尺 = 0.3048 m（精确定义）
// 马赫按标准大气 15°C 声速 1234.8 km/h 近似，页面 FAQ 中注明
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

export const SPEED_UNITS: FactorUnit[] = [
  { code: "kmh", label: "千米每小时", symbol: "km/h", factor: 1 },
  { code: "ms", label: "米每秒", symbol: "m/s", factor: 3.6 },
  { code: "fts", label: "英尺每秒", symbol: "ft/s", factor: 1.09728 },
  { code: "kn", label: "节（海里每小时）", symbol: "kn", factor: 1.852 },
  { code: "mph", label: "英里每小时", symbol: "mph", factor: 1.609344 },
  { code: "mach", label: "马赫（约）", symbol: "Ma", factor: 1234.8 },
];

const converter: FactorConverter = createFactorConverter(SPEED_UNITS);

export const convertSpeed = converter.convert;
export const speedUnit = converter.unit;
