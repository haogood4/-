// 时间单位换算 —— 基准：秒
// 月 / 年按格里高利历平均值：1 年 = 365.2425 天 = 31556952 秒；1 月 = 1/12 年 = 2629746 秒
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

export const TIME_UNITS: FactorUnit[] = [
  { code: "ms", label: "毫秒", symbol: "ms", factor: 0.001 },
  { code: "s", label: "秒", symbol: "s", factor: 1 },
  { code: "min", label: "分钟", symbol: "min", factor: 60 },
  { code: "h", label: "小时", symbol: "h", factor: 3600 },
  { code: "d", label: "天", symbol: "天", factor: 86400 },
  { code: "wk", label: "周", symbol: "周", factor: 604800 },
  { code: "month", label: "月（平均）", symbol: "月", factor: 2629746 },
  { code: "yr", label: "年（平均）", symbol: "年", factor: 31556952 },
];

const converter: FactorConverter = createFactorConverter(TIME_UNITS);

export const convertTime = converter.convert;
export const timeUnit = converter.unit;
