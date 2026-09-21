// 角度单位换算 —— 基准：度（deg，1 圈 = 360°）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 弧度（rad）= 180/π 度（半圆 π rad = 180° 的精确定义）
// 1 梯度（gon）= 0.9°（直角 = 100 gon 的精确定义）；1 角分 = 1/60°；1 角秒 = 1/3600°
// 1 圈（turn）= 360°
export const ANGLE_UNITS: FactorUnit[] = [
  { code: "deg", label: "度", symbol: "°", factor: 1 },
  { code: "rad", label: "弧度", symbol: "rad", factor: 180 / Math.PI },
  { code: "gon", label: "梯度", symbol: "gon", factor: 0.9 },
  { code: "arcmin", label: "角分", symbol: "′", factor: 1 / 60 },
  { code: "arcsec", label: "角秒", symbol: "″", factor: 1 / 3600 },
  { code: "turn", label: "圈", symbol: "turn", factor: 360 },
];

const converter: FactorConverter = createFactorConverter(ANGLE_UNITS);

export const convertAngle = converter.convert;
export const angleUnit = converter.unit;
