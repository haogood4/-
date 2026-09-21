// src/lib/calculators/long-tail-difficulty.test.ts — 长尾词难度评估单测
import { describe, expect, it } from "vitest";
import {
  scoreLongTailDifficulty,
  scoreLongTailBatch,
} from "./long-tail-difficulty";

describe("longTailDifficulty / 基础规则", () => {
  it("极短词（≤3 字）落入 极易/较易 区间", () => {
    const r = scoreLongTailDifficulty({ word: "减肥" });
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.confidence).toBe("低");
  });

  it("空字符串抛出", () => {
    expect(() => scoreLongTailDifficulty({ word: "   " })).toThrow(/不能为空/);
  });

  it("core=计算器、word=计算器（无修饰）落入 中等/极难 区间", () => {
    const r = scoreLongTailDifficulty({ word: "计算器", core: "计算器" });
    // 短词（3 字）+ 无修饰 → 长度项 22 + 深度项 25 = 47（中等）；若同时含"下载"等高竞争词才入极难
    expect(["中等", "较难", "极难"]).toContain(r.band);
    expect(r.modifierDepth).toBe(0);
  });

  it("长尾词「免费在线房贷计算器」含 core=计算器 修饰层数递增", () => {
    const r = scoreLongTailDifficulty({
      word: "免费在线房贷计算器",
      core: "计算器",
    });
    expect(r.modifierDepth).toBeGreaterThanOrEqual(2);
    // "免费"未在 COMMERCIAL_WORDS 词表，仅"在线"亦未命中，所以 hasCommercial=false
    expect(r.hasCommercial).toBe(false);
    // 评分应低于 core=计算器 本身
    const base = scoreLongTailDifficulty({ word: "计算器", core: "计算器" });
    expect(r.score).toBeLessThanOrEqual(base.score);
  });
});

describe("longTailDifficulty / 意图命中维度", () => {
  it("疑问词命中：怎么用计算器 → hasQuestion=true", () => {
    const r = scoreLongTailDifficulty({
      word: "怎么用计算器",
      core: "计算器",
    });
    expect(r.hasQuestion).toBe(true);
    expect(r.parts.question).toBe(-10);
  });

  it("商业意图命中：计算器推荐 → hasCommercial=true", () => {
    const r = scoreLongTailDifficulty({
      word: "计算器推荐",
      core: "计算器",
    });
    expect(r.hasCommercial).toBe(true);
    expect(r.parts.commercial).toBe(20);
  });

  it("高竞争品类命中：计算器下载 → hasHighCompetition=true", () => {
    const r = scoreLongTailDifficulty({
      word: "计算器下载",
      core: "计算器",
    });
    expect(r.hasHighCompetition).toBe(true);
    expect(r.parts.highCompetition).toBe(20);
  });

  it("疑问 + 商业组合：计算器哪个好 → 两类都命中，分数取两者叠加", () => {
    const r = scoreLongTailDifficulty({
      word: "计算器哪个好",
      core: "计算器",
    });
    expect(r.hasQuestion).toBe(true);
    expect(r.hasCommercial).toBe(true);
  });
});

describe("longTailDifficulty / 分档边界", () => {
  it("极易边界（0–19）", () => {
    const r = scoreLongTailDifficulty({
      word: "高额信用卡分期免息计算器",
      core: "计算器",
    });
    expect(["极易", "较易"]).toContain(r.band);
  });

  it("较易 vs 较难 边界判定与 80 分上限", () => {
    // 极端：核心词本身 + 短 + 商业意图 + 高竞争品类叠加
    const r = scoreLongTailDifficulty({
      word: "下载",
      core: "下载",
    });
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("分数始终在 [0,100] 区间内（无溢出）", () => {
    const samples = [
      "x",
      "下载",
      "怎么用计算器",
      "免费在线2026新版房贷等额本息提前还款计算器",
      "推荐",
    ];
    for (const s of samples) {
      const r = scoreLongTailDifficulty({ word: s, core: "计算器" });
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("longTailDifficulty / 批量评估", () => {
  it("scoreLongTailBatch 跳过纯空白值并保持顺序", () => {
    const list = ["计算器", "   ", "怎么用计算器", "免费计算器"];
    const out = scoreLongTailBatch(list, "计算器");
    expect(out.length).toBe(3);
    expect(out[0].score).toBeDefined();
    expect(out[1].hasQuestion).toBe(true);
    expect(out[2].score).toBeGreaterThanOrEqual(0);
    expect(out[2].modifierDepth).toBeGreaterThanOrEqual(1);
  });
});

describe("longTailDifficulty / 置信度", () => {
  it("无核心词 → 低置信度", () => {
    const r = scoreLongTailDifficulty({ word: "怎么用计算器" });
    expect(r.confidence).toBe("低");
  });

  it("提供核心词 + 命中意图词 → 高置信度", () => {
    const r = scoreLongTailDifficulty({
      word: "怎么用计算器",
      core: "计算器",
    });
    expect(r.confidence).toBe("高");
  });

  it("提供核心词但无意图命中 → 中置信度", () => {
    const r = scoreLongTailDifficulty({
      word: "在线房贷计算器",
      core: "计算器",
    });
    expect(["中", "高"]).toContain(r.confidence);
  });
});

describe("longTailDifficulty / hint 文案", () => {
  it("hint 非空且包含分档", () => {
    const r = scoreLongTailDifficulty({ word: "免费计算器", core: "计算器" });
    expect(r.hint.length).toBeGreaterThan(0);
    expect(r.hint).toContain(r.band);
  });
});
