// 体积/容积换算 —— 基准：升。覆盖公制 / 英制（美加仑、英加仑）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 立方米 = 1000 L；1 立方英寸 = 0.016387064 L、1 立方英尺 = 28.316846592 L（精确）
// 1 美制加仑 = 3.785411784 L、1 英制加仑 = 4.54609 L（精确定义）
export const VOLUME_UNITS: FactorUnit[] = [
  { code: "ml", label: "毫升", symbol: "mL", factor: 0.001 },
  { code: "l", label: "升", symbol: "L", factor: 1 },
  { code: "m3", label: "立方米", symbol: "m³", factor: 1000 },
  { code: "cm3", label: "立方厘米", symbol: "cm³", factor: 0.001 },
  { code: "in3", label: "立方英寸", symbol: "in³", factor: 0.016387064 },
  { code: "ft3", label: "立方英尺", symbol: "ft³", factor: 28.316846592 },
  { code: "usgal", label: "美制加仑", symbol: "gal(US)", factor: 3.785411784 },
  { code: "ukgal", label: "英制加仑", symbol: "gal(UK)", factor: 4.54609 },
];

const converter: FactorConverter = createFactorConverter(VOLUME_UNITS);

export const convertVolume = converter.convert;
export const volumeUnit = converter.unit;
