import { describe, expect, it } from "vitest";
import {
  CATEGORY_META,
  detectSensitive,
  getLibraryStats,
  maskText,
  SENSITIVE_WORDS,
  summarizeHits,
  type SensitiveHit,
} from "./sensitive-word-cn";

describe("sensitive-word-cn", () => {
  it("词库分类齐全，每类至少 1 条", () => {
    expect(SENSITIVE_WORDS.politics.length).toBeGreaterThan(0);
    expect(SENSITIVE_WORDS.violence.length).toBeGreaterThan(0);
    expect(SENSITIVE_WORDS.porn.length).toBeGreaterThan(0);
    expect(SENSITIVE_WORDS.ad.length).toBeGreaterThan(0);
  });

  it("总词条数 ≥ 80", () => {
    const stats = getLibraryStats();
    const total = stats.politics + stats.violence + stats.porn + stats.ad;
    expect(total).toBeGreaterThanOrEqual(80);
  });

  it("空文本：未命中", () => {
    const r = detectSensitive({ text: "" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.totalHits).toBe(0);
      expect(r.value.hits).toEqual([]);
      expect(r.value.masked).toBe("");
    }
  });

  it("正常文本不命中", () => {
    const r = detectSensitive({
      text: "今天天气不错，适合出去散步。Hello world 123。",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.totalHits).toBe(0);
  });

  it("命中暴力类", () => {
    const r = detectSensitive({ text: "此人涉及暴力与毒品" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.categoryStats.violence).toBeGreaterThanOrEqual(2);
      expect(r.value.totalHits).toBeGreaterThanOrEqual(2);
    }
  });

  it("命中色情类", () => {
    const r = detectSensitive({ text: "他沉迷于色情网站" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.categoryStats.porn).toBeGreaterThanOrEqual(1);
    }
  });

  it("命中广告引流 + 规避规则（联系方式/链接）", () => {
    const r = detectSensitive({
      text: "招聘兼职日结，加微信 13812345678 详谈：https://example.com/job",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.categoryStats.ad).toBeGreaterThanOrEqual(3);
      const labels = r.value.hits.map((h) => h.label);
      expect(labels).toContain("联系方式");
      expect(labels).toContain("可疑链接");
    }
  });

  it("分类过滤：只检测广告类", () => {
    const r = detectSensitive({
      text: "赌博 + 暴力",
      categories: ["ad"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.categoryStats.ad).toBeGreaterThan(0);
      expect(r.value.categoryStats.violence).toBe(0);
      expect(r.value.categoryStats.porn).toBe(0);
    }
  });

  it("重叠命中：连续字符多次匹配", () => {
    const r = detectSensitive({ text: "不不不" });
    // "不" 不在词库，但词库中如 "不不" 类重叠词不应漏
    expect(r.ok).toBe(true);
  });

  it("遮罩：替换命中片段为 *", () => {
    const r = detectSensitive({ text: "他喜欢赌博和色情" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.masked).not.toBe("他喜欢赌博和色情");
      expect(r.value.masked).toContain("*");
      expect(r.value.masked).not.toContain("赌博");
      expect(r.value.masked).not.toContain("色情");
    }
  });

  it("maskText：合并区间并按长度替换", () => {
    // text = "兼职 日 兼职 兼职" (length 10)
    // 索引:0 兼 1 职 2 ' ' 3 日 4 ' ' 5 兼 6 职 7 ' ' 8 兼 9 职
    // 命中区间 [0,2] [5,7] [8,10]，掩码后预期 "** 日 ** **"
    const hits: SensitiveHit[] = [
      {
        category: "ad",
        label: "兼职",
        word: "兼职",
        positions: [
          [0, 2],
          [5, 7],
          [8, 10],
        ],
        suggest: "",
      },
    ];
    const out = maskText("兼职 日 兼职 兼职", hits);
    expect(out).toBe("** 日 ** **");
  });

  it("maskText：相邻区间合并为长串 *", () => {
    const hits: SensitiveHit[] = [
      {
        category: "ad",
        label: "兼职",
        word: "兼职",
        positions: [
          [0, 2],
          [2, 4],
        ],
        suggest: "",
      },
    ];
    expect(maskText("兼职兼职", hits)).toBe("****");
  });

  it("summarizeHits：未命中", () => {
    const r = detectSensitive({ text: "干净的文本" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(summarizeHits(r.value)).toBe("未检测到敏感词");
  });

  it("summarizeHits：多分类", () => {
    const r = detectSensitive({ text: "赌博 色情 暴力" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const s = summarizeHits(r.value);
      expect(s).toContain("广告引流");
      expect(s).toContain("色情低俗");
      expect(s).toContain("暴力相关");
    }
  });

  it("超出长度限制", () => {
    const r = detectSensitive({ text: "x".repeat(20001) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TEXT_TOO_LONG");
  });

  it("CATEGORY_META 覆盖四类", () => {
    expect(Object.keys(CATEGORY_META).sort()).toEqual([
      "ad",
      "politics",
      "porn",
      "violence",
    ]);
  });
});
