import { describe, expect, it } from "vitest";
import { convertPinyin, type PinyinDict } from "./pinyin-cn";

// 手写小字典（不读 public/data，保证单测与数据文件解耦）
const DICT: PinyinDict = {
  你: ["nǐ"],
  好: ["hǎo", "hào"],
  中: ["zhōng", "zhòng"],
  国: ["guó"],
  人: ["rén"],
  长: ["cháng", "zhǎng"],
  单: ["dān", "shàn", "chán"],
};

const run = (text: string, showAll = false) =>
  convertPinyin({ text, dict: DICT, showAllPolyphones: showAll });

describe("convertPinyin / 基本转换", () => {
  it("纯汉字取首读音，逐字分段", () => {
    const r = run("你好");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.segments).toEqual([
        { han: true, pinyin: "nǐ", src: "你" },
        { han: true, pinyin: "hǎo", src: "好" },
      ]);
      expect(r.value.hasNonHan).toBe(false);
    }
  });

  it("多音字默认只取首读音", () => {
    const r = run("中国");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.segments.map((s) => s.pinyin)).toEqual(["zhōng", "guó"]);
    }
  });

  it("showAllPolyphones=true 时全部读音以 / 连接", () => {
    const r = run("单", true);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.segments[0].pinyin).toBe("dān/shàn/chán");
    }
  });

  it("非多音字在 showAllPolyphones=true 下仍为单读音", () => {
    const r = run("你", true);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.segments[0].pinyin).toBe("nǐ");
  });
});

describe("convertPinyin / 混合文本", () => {
  it("中文段落混合标点：标点与空格标记 han:false 并原样保留", () => {
    const r = run("中国人，你好！");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.hasNonHan).toBe(true);
      expect(r.value.segments.length).toBe(7);
      const punct = r.value.segments[3];
      expect(punct).toEqual({ han: false, pinyin: "", src: "，" });
      expect(r.value.segments[6].src).toBe("！");
    }
  });

  it("中英混合：英文字母逐字标记非汉字", () => {
    const r = run("中A国");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.segments).toEqual([
        { han: true, pinyin: "zhōng", src: "中" },
        { han: false, pinyin: "", src: "A" },
        { han: true, pinyin: "guó", src: "国" },
      ]);
      expect(r.value.hasNonHan).toBe(true);
    }
  });

  it("emoji（代理对）按单个码点保留，不拆坏", () => {
    const r = run("好😀");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.segments.length).toBe(2);
      expect(r.value.segments[1]).toEqual({
        han: false,
        pinyin: "",
        src: "😀",
      });
    }
  });

  it("字典未收录的汉字按非汉字原样输出", () => {
    const r = run("你好鑫");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.hasNonHan).toBe(true);
      expect(r.value.segments[2]).toEqual({
        han: false,
        pinyin: "",
        src: "鑫",
      });
    }
  });
});

describe("convertPinyin / 错误处理", () => {
  it("空字符串 → EMPTY", () => {
    const r = run("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白（含全角空格）→ EMPTY", () => {
    expect(run("   ").ok).toBe(false);
    const r = run(" 　 ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });
});
