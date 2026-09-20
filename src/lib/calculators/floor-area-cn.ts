// 房屋面积计算器（按房型面积求和）
import { validateNumber, formatResult } from "./_shared";

export type AreaInput = {
  rooms: string; // 各房间面积，逗号/换行分隔 m²
};

export type AreaResult = { total: number; count: number };
export type AreaCalcResult =
  | { ok: true; value: AreaResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateFloorArea(input: AreaInput): AreaCalcResult {
  const trimmed = input.rooms.trim();
  if (!trimmed)
    return { ok: false, error: { code: "EMPTY", message: "请输入房间面积" } };
  const parts = trimmed.split(/[,\s\n]+/).filter(Boolean);
  if (parts.length === 0)
    return { ok: false, error: { code: "EMPTY", message: "请输入房间面积" } };
  let total = 0;
  for (const p of parts) {
    const v = validateNumber(p);
    if (!v.ok) return v;
    if (v.value <= 0)
      return {
        ok: false,
        error: { code: "OUT_OF_RANGE", message: "房间面积须大于 0" },
      };
    total += v.value;
  }
  return { ok: true, value: { total, count: parts.length } };
}

export function formatArea(value: AreaResult) {
  return {
    total: formatResult(value.total) + " m²",
    count: String(value.count) + " 个房间",
  };
}
