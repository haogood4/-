// 功率单位换算 —— 基准：瓦特（W，SI 功率导出单位）
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

// 1 公制马力（PS）= 735.49875 W（米制马力精确定义：75 千克力·米/秒）
// 1 英制马力（hp）= 745.699872 W（550 英尺磅力/秒，按国际英尺换算）
// 1 国际蒸汽表卡/秒 = 4.1868 W；1 英尺磅力/秒 = 1.3558179483314004 W
// （0.45359237 kg × 9.80665 m/s² × 0.3048 m，按 IEEE 双精度最短表示书写，值等价）
// 1 英热单位/小时（BTU/h）= 0.2930710701722222 W（国际蒸汽表 BTU = 1055.05585262 J，除以 3600 秒）
export const POWER_UNITS: FactorUnit[] = [
  { code: "mw", label: "毫瓦", symbol: "mW", factor: 0.001 },
  { code: "w", label: "瓦特", symbol: "W", factor: 1 },
  { code: "kw", label: "千瓦", symbol: "kW", factor: 1000 },
  { code: "megawatt", label: "兆瓦", symbol: "MW", factor: 1000000 },
  { code: "ps", label: "公制马力", symbol: "PS", factor: 735.49875 },
  { code: "hp", label: "英制马力", symbol: "hp", factor: 745.699872 },
  {
    code: "cal_per_s",
    label: "卡/秒",
    symbol: "cal/s",
    factor: 4.1868,
  },
  {
    code: "ft_lbf_per_s",
    label: "英尺磅力/秒",
    symbol: "ft·lbf/s",
    factor: 1.3558179483314003,
  },
  {
    code: "btu_per_h",
    label: "英热单位/小时",
    symbol: "BTU/h",
    factor: 0.2930710701722222,
  },
];

const converter: FactorConverter = createFactorConverter(POWER_UNITS);

export const convertPower = converter.convert;
export const powerUnit = converter.unit;
