import { describe, expect, it } from "vitest";
import { generateLongTail, parseLines } from "./seo-keywords-cn";

describe("generateLongTail", () => {
  it("前置词 × 核心词笛卡尔拼接", () => {
    const r = generateLongTail("下载站", { prefixes: ["免费", "绿色"] });
    expect(r).toContain("免费下载站");
    expect(r).toContain("绿色下载站");
  });

  it("后缀词拼接与疑问句模板替换", () => {
    const r = generateLongTail("下载站", {
      suffixes: ["推荐", "排行"],
      questions: ["{k}哪个好", "{k}安全吗"],
    });
    expect(r).toContain("下载站推荐");
    expect(r).toContain("下载站排行");
    expect(r).toContain("下载站哪个好");
    expect(r).toContain("下载站安全吗");
  });

  it("核心词本身也在结果首位", () => {
    const r = generateLongTail("下载站");
    expect(r[0]).toBe("下载站");
    expect(r.length).toBe(1);
  });

  it("全局去重且保序（核心词优先，组间不穿插）", () => {
    const r = generateLongTail("工具", {
      prefixes: ["免费", "免费"], // 前置词自身重复 → 免费工具只保留一个
      suffixes: ["免费", "排行"], // 工具免费 与 免费工具 是不同词，均保留
      questions: ["免费工具", "{k}好用吗"], // 免费工具与前置产物撞车 → 去重
    });
    expect(r).toEqual([
      "工具",
      "免费工具",
      "工具免费",
      "工具排行",
      "工具好用吗",
    ]);
  });

  it("首尾空白被裁剪", () => {
    const r = generateLongTail("  下载站  ", { prefixes: [" 免费 "] });
    expect(r[0]).toBe("下载站");
    expect(r[1]).toBe("免费下载站");
  });

  it("核心词为空抛错", () => {
    expect(() => generateLongTail("")).toThrow();
    expect(() => generateLongTail("   ")).toThrow();
  });

  it("产出数量 = 1 + 各组非重复产物之和", () => {
    const r = generateLongTail("seo", {
      prefixes: ["免费", "在线", "好用的"],
      suffixes: ["教程", "工具"],
      questions: ["{k}是什么", "{k}怎么做"],
    });
    expect(r.length).toBe(8);
  });
});

describe("parseLines", () => {
  it("去空行去重保序", () => {
    expect(parseLines("a\n\n b \nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("空文本返回空数组", () => {
    expect(parseLines("")).toEqual([]);
  });
});
