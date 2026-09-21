import { describe, expect, it } from "vitest";
import { calcGacha, GACHA_GAMES } from "./game-gacha-cn";

describe("calcGacha", () => {
  it("原神满垫 50/50：出金期望落在 65~75 区间", () => {
    const r = calcGacha("genshin", 0, false);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.remaining).toBe(90);
    expect(r.plan.eGold).toBeGreaterThan(65);
    expect(r.plan.eGold).toBeLessThan(75);
  });

  it("原神 50/50 综合期望为出金期望 × 1.5（向上取整）", () => {
    const r = calcGacha("genshin", 0, false);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const expected = Math.ceil(r.plan.eGold * 1.5);
    expect(r.plan.expectPulls).toBe(expected);
    expect(r.plan.expectPulls).toBeGreaterThanOrEqual(100);
    expect(r.plan.expectPulls).toBeLessThanOrEqual(110);
  });

  it("大保底状态：期望 = 出金期望向上取整", () => {
    const r = calcGacha("genshin", 0, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.expectPulls).toBe(Math.ceil(r.plan.eGold));
    expect(r.plan.note).toContain("大保底");
  });

  it("鸣潮 0.8% / 80 保底：期望约 55~65 抽", () => {
    const r = calcGacha("wuwa", 0, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.remaining).toBe(80);
    expect(r.plan.eGold).toBeGreaterThan(55);
    expect(r.plan.eGold).toBeLessThan(65);
    expect(r.plan.expectPulls).toBe(Math.ceil(r.plan.eGold));
  });

  it("垫抽数越多期望越低（剩余保底缩短）", () => {
    const r = calcGacha("genshin", 80, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.remaining).toBe(10);
    expect(r.plan.eGold).toBeGreaterThan(9);
    expect(r.plan.eGold).toBeLessThan(10);
  });

  it("仅剩最后一抽保底时期望恰为 1", () => {
    const r = calcGacha("hsr", 89, true);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.plan.remaining).toBe(1);
    expect(r.plan.eGold).toBe(1);
    expect(r.plan.expectPulls).toBe(1);
  });

  it("四款游戏配置符合公开概率", () => {
    const byId = new Map(GACHA_GAMES.map((g) => [g.id, g]));
    for (const id of ["genshin", "hsr", "zzz"]) {
      expect(byId.get(id)?.p).toBe(0.006);
      expect(byId.get(id)?.hardPity).toBe(90);
    }
    expect(byId.get("wuwa")?.p).toBe(0.008);
    expect(byId.get("wuwa")?.hardPity).toBe(80);
  });

  it("未知游戏 id 报错", () => {
    const r = calcGacha("unknown", 0, false);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain("未知游戏");
  });

  it("垫抽数越界 / 非整数报错", () => {
    expect(calcGacha("genshin", -1, false).ok).toBe(false);
    expect(calcGacha("genshin", 90, false).ok).toBe(false);
    expect(calcGacha("genshin", 5.5, false).ok).toBe(false);
    expect(calcGacha("wuwa", 80, false).ok).toBe(false);
  });
});
