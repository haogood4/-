// src/lib/calculators/game-gacha-cn.ts — 抽卡保底期望计算（纯函数）
//
// 数学模型：把软保底简化为硬保底——在保底抽数之前出金概率恒为 p，
// 到保底第 r 抽必出金（简化会略微高估期望，原神的 74 抽递增软保底未建模）。
// 期望抽数 E = Σ_{n=1..r-1} n·p·q^(n-1) + r·q^(r-1)，其中 q = 1-p，
// 该级数有闭式 E = (1 - q^r) / p（r=1 时退化为 1）。
// 「歪了」机制按 50/50 简化：非大保底状态下综合期望 = 1.5 × E。

export interface GachaSpec {
  id: string;
  name: string;
  /** 基础出金概率 */
  p: number;
  /** 硬保底抽数 */
  hardPity: number;
}

export const GACHA_GAMES: readonly GachaSpec[] = [
  { id: "genshin", name: "原神", p: 0.006, hardPity: 90 },
  { id: "hsr", name: "崩坏：星穹铁道", p: 0.006, hardPity: 90 },
  { id: "zzz", name: "绝区零", p: 0.006, hardPity: 90 },
  { id: "wuwa", name: "鸣潮", p: 0.008, hardPity: 80 },
];

export interface GachaPlan {
  game: string;
  /** 距离硬保底的剩余抽数 */
  remaining: number;
  /** 出金期望抽数（含小数） */
  eGold: number;
  /** 到 UP 角色的综合期望抽数（向上取整） */
  expectPulls: number;
  note: string;
}

export type GachaResult =
  { ok: true; plan: GachaPlan } | { ok: false; error: string };

/**
 * 计算从当前垫抽数到拿到 UP 角色的期望抽数。
 * @param gameId    游戏 id（见 GACHA_GAMES）
 * @param pity      已垫抽数（0 ~ 保底-1）
 * @param guaranteed 是否处于大保底（上一金已歪，下一金必 UP）
 */
export function calcGacha(
  gameId: string,
  pity: number,
  guaranteed: boolean,
): GachaResult {
  const spec = GACHA_GAMES.find((g) => g.id === gameId);
  if (!spec) {
    return { ok: false, error: "未知游戏，请重新选择" };
  }
  if (!Number.isInteger(pity) || pity < 0 || pity >= spec.hardPity) {
    return {
      ok: false,
      error: `已垫抽数需为 0~${spec.hardPity - 1} 的整数`,
    };
  }
  const remaining = spec.hardPity - pity;
  const q = 1 - spec.p;
  // r=1 时闭式公式受浮点误差影响（1.0000000000000009），保底必出金直接取 1
  const eGold = remaining === 1 ? 1 : (1 - Math.pow(q, remaining)) / spec.p;
  const expectPulls = Math.ceil(guaranteed ? eGold : 1.5 * eGold);
  const note = guaranteed
    ? "当前处于大保底，下一金必为 UP 角色"
    : "按 50/50 综合（歪了再吃一次大保底）估算";
  return {
    ok: true,
    plan: { game: spec.name, remaining, eGold, expectPulls, note },
  };
}
