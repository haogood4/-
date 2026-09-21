import { describe, expect, it } from "vitest";
import { NICK_CATEGORIES, NICK_NAMES, pickNames } from "./game-nickname-cn";

describe("词库完整性", () => {
  it("4 个分类各 ≥ 15 个昵称", () => {
    expect(NICK_CATEGORIES.length).toBe(4);
    for (const cat of NICK_CATEGORIES) {
      expect(NICK_NAMES[cat].length).toBeGreaterThanOrEqual(15);
    }
  });

  it("全库 ≥ 60 个且跨分类无重复", () => {
    const all = Object.values(NICK_NAMES).flat();
    expect(all.length).toBeGreaterThanOrEqual(60);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("pickNames", () => {
  it("按分类抽取：数量正确、不重复、全部来自词库", () => {
    const pool = NICK_NAMES["古风雅致"];
    const r = pickNames("古风雅致", 5);
    expect(r.length).toBe(5);
    expect(new Set(r).size).toBe(5);
    for (const name of r) expect(pool).toContain(name);
  });

  it("n 超过词库大小时返回全库（随机排序）", () => {
    const r = pickNames("可爱软萌", 999);
    expect(r.length).toBe(NICK_NAMES["可爱软萌"].length);
  });

  it("「随机」分类混合全库抽取", () => {
    const all = Object.values(NICK_NAMES).flat();
    const r = pickNames("随机", 10);
    for (const name of r) expect(all).toContain(name);
  });

  it("相同随机序列结果可复现（rand 注入）", () => {
    const makeRand = (): (() => number) => {
      let i = 0;
      const seq = [0.1, 0.9, 0.5, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 0.15, 0.85];
      return () => seq[i++ % seq.length];
    };
    const a = pickNames("炫酷霸气", 8, makeRand());
    const b = pickNames("炫酷霸气", 8, makeRand());
    expect(a).toEqual(b);
  });

  it("非法分类抛错", () => {
    expect(() => pickNames("不存在的分类", 3)).toThrow();
  });

  it("数量非法抛错", () => {
    expect(() => pickNames("沙雕搞笑", 0)).toThrow();
    expect(() => pickNames("沙雕搞笑", -2)).toThrow();
    expect(() => pickNames("沙雕搞笑", 2.5)).toThrow();
  });
});
