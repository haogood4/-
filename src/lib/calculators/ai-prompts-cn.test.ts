import { describe, expect, it } from "vitest";
import { filterPrompts, type PromptItem } from "./ai-prompts-cn";
import library from "../../../public/data/ai-prompts.json";

const PROMPTS = library.prompts as PromptItem[];
const CATEGORIES = library.categories as string[];

describe("ai-prompts.json 数据完整性", () => {
  it("总量 ≥ 36 条，6 个分类各 ≥ 6 条", () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(36);
    expect(CATEGORIES.length).toBe(6);
    for (const cat of CATEGORIES) {
      const n = PROMPTS.filter((p) => p.category === cat).length;
      expect(n).toBeGreaterThanOrEqual(6);
    }
  });

  it("分类字段只包含声明的 6 类", () => {
    const seen = new Set(PROMPTS.map((p) => p.category));
    expect([...seen].sort()).toEqual([...CATEGORIES].sort());
  });

  it("id 唯一且标题 / 内容非空", () => {
    const ids = new Set(PROMPTS.map((p) => p.id));
    expect(ids.size).toBe(PROMPTS.length);
    for (const p of PROMPTS) {
      expect(p.title.trim().length).toBeGreaterThan(0);
      expect(p.content.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("filterPrompts", () => {
  it("按分类过滤：结果全部命中且数量正确", () => {
    const r = filterPrompts(PROMPTS, "编程开发");
    expect(r.length).toBe(6);
    for (const p of r) expect(p.category).toBe("编程开发");
  });

  it("「全部」与不传分类都返回全量", () => {
    expect(filterPrompts(PROMPTS, "全部").length).toBe(PROMPTS.length);
    expect(filterPrompts(PROMPTS).length).toBe(PROMPTS.length);
    expect(filterPrompts(PROMPTS, "").length).toBe(PROMPTS.length);
  });

  it("关键词命中标题（不区分大小写）", () => {
    const r = filterPrompts(PROMPTS, undefined, "sql");
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r.some((p) => p.id === "dev-4")).toBe(true);
  });

  it("关键词命中内容", () => {
    const r = filterPrompts(PROMPTS, undefined, "费曼");
    expect(r.length).toBe(1);
    expect(r[0]?.id).toBe("edu-1");
  });

  it("分类 + 关键词叠加过滤", () => {
    const r = filterPrompts(PROMPTS, "编程开发", "代码");
    expect(r.length).toBeGreaterThanOrEqual(1);
    for (const p of r) expect(p.category).toBe("编程开发");
  });

  it("无匹配时返回空数组", () => {
    expect(filterPrompts(PROMPTS, undefined, "不存在的关键词xyz")).toEqual([]);
  });
});
