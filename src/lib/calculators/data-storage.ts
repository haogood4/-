// 存储容量换算 —— 基准：字节
// 十进制（SI）：1 KB = 1000 B；二进制（IEC）：1 KiB = 1024 B。
// 硬盘厂商标称用十进制、系统显示用二进制，两者差异即「硬盘容量缩水」之谜。
import {
  createFactorConverter,
  type FactorUnit,
  type FactorConverter,
} from "./factor-convert";

export const STORAGE_UNITS: FactorUnit[] = [
  { code: "bit", label: "比特（位）", symbol: "bit", factor: 0.125 },
  { code: "b", label: "字节", symbol: "B", factor: 1 },
  { code: "kb", label: "千字节 KB", symbol: "KB", factor: 1000 },
  { code: "mb", label: "兆字节 MB", symbol: "MB", factor: 1000000 },
  { code: "gb", label: "吉字节 GB", symbol: "GB", factor: 1000000000 },
  { code: "tb", label: "太字节 TB", symbol: "TB", factor: 1000000000000 },
  { code: "kib", label: "KiB（二进制）", symbol: "KiB", factor: 1024 },
  { code: "mib", label: "MiB（二进制）", symbol: "MiB", factor: 1048576 },
  { code: "gib", label: "GiB（二进制）", symbol: "GiB", factor: 1073741824 },
  { code: "tib", label: "TiB（二进制）", symbol: "TiB", factor: 1099511627776 },
];

const converter: FactorConverter = createFactorConverter(STORAGE_UNITS);

export const convertStorage = converter.convert;
export const storageUnit = converter.unit;
