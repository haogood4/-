// 频率单位换算 —— 基准：赫兹（Hz，即 1/秒，SI 导出单位）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 公制千进位：1 kHz = 1e3 Hz、1 MHz = 1e6 Hz、1 GHz = 1e9 Hz
// 转/分（rpm，revolution per minute）：1 转 = 1/60 圈每秒，故 1 rpm = 1/60 Hz
export const FREQUENCY_UNITS: FactorUnit[] = [
  { code: "hz", label: "赫兹", symbol: "Hz", factor: 1 },
  { code: "khz", label: "千赫兹", symbol: "kHz", factor: 1000 },
  { code: "mhz", label: "兆赫兹", symbol: "MHz", factor: 1000000 },
  { code: "ghz", label: "吉赫兹", symbol: "GHz", factor: 1000000000 },
  { code: "rpm", label: "转/分", symbol: "rpm", factor: 1 / 60 },
];

const converter: FactorConverter = createFactorConverter(FREQUENCY_UNITS);

export const convertFrequency = converter.convert;
export const frequencyUnit = converter.unit;
