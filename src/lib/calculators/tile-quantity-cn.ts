// 瓷砖数量计算器
import { validateNumber, formatResult } from "./_shared";

export type TileInput = {
  area: string; // 铺设面积 m²
  tileLength: string; // 瓷砖长 mm
  tileWidth: string; // 瓷砖宽 mm
  waste: string; // 损耗率 %
};

export type TileResult = { count: number; tilesArea: number };
export type TileCalcResult =
  | { ok: true; value: TileResult }
  | { ok: false; error: { code: string; message: string } };

export function calculateTile(input: TileInput): TileCalcResult {
  const a = validateNumber(input.area);
  if (!a.ok) return a;
  const l = validateNumber(input.tileLength);
  if (!l.ok) return l;
  const w = validateNumber(input.tileWidth);
  if (!w.ok) return w;
  const wa = validateNumber(input.waste);
  if (!wa.ok) return wa;
  if (a.value <= 0 || l.value <= 0 || w.value <= 0) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "面积与尺寸须大于 0" },
    };
  }
  if (wa.value < 0 || wa.value > 30) {
    return {
      ok: false,
      error: { code: "OUT_OF_RANGE", message: "损耗率须 0-30%" },
    };
  }
  const tileArea = (l.value / 1000) * (w.value / 1000);
  const baseCount = a.value / tileArea;
  const count = Math.ceil(baseCount * (1 + wa.value / 100));
  return { ok: true, value: { count, tilesArea: count * tileArea } };
}

export function formatTile(value: TileResult) {
  return {
    count: String(value.count) + " 片",
    tilesArea: formatResult(value.tilesArea) + " m²",
  };
}
