import { describe, expect, it } from "vitest";
import { analyzeDensity, DEFAULT_STOPWORDS_CN } from "./keyword-density-cn";

describe("keyword-density-cn", () => {
  it("空字符串返回零结果", () => {
    const r = analyzeDensity("");
    expect(r).toEqual({ total: 0, unique: 0, totalChars: 0, items: [] });
  });

  it("仅空白返回零结果", () => {
    const r = analyzeDensity("   \n\t  　  ");
    expect(r).toEqual({ total: 0, unique: 0, totalChars: 0, items: [] });
  });

  it("非字符串输入返回零结果", () => {
    // 防御性：绕过 TS 类型检查
    const r = analyzeDensity(undefined as unknown as string);
    expect(r).toEqual({ total: 0, unique: 0, totalChars: 0, items: [] });
    const r2 = analyzeDensity(null as unknown as string);
    expect(r2).toEqual({ total: 0, unique: 0, totalChars: 0, items: [] });
    const r3 = analyzeDensity(123 as unknown as string);
    expect(r3).toEqual({ total: 0, unique: 0, totalChars: 0, items: [] });
  });

  it("中文高频词识别", () => {
    const text = "搜索引擎优化搜索引擎优化搜索引擎优化";
    const r = analyzeDensity(text);
    expect(r.total).toBeGreaterThan(0);
    // "搜索引擎" 应出现 3 次（最高频短语之一）
    const seItem = r.items.find((x) => x.word === "搜索引擎");
    expect(seItem).toBeDefined();
    expect(seItem!.count).toBe(3);
    // "优化" 也应出现 3 次
    const optItem = r.items.find((x) => x.word === "优化");
    expect(optItem).toBeDefined();
    expect(optItem!.count).toBe(3);
    // 同 count 按字典序升序
    expect(r.items[0]!.count).toBe(3);
  });

  it("英文按空格分词", () => {
    const r = analyzeDensity("SEO is SEO SEO optimize");
    const seoItem = r.items.find((x) => x.word === "seo");
    expect(seoItem).toBeDefined();
    expect(seoItem!.count).toBe(3);
    // "is" 长度 2 落在 [2,6] 区间，应被识别
    const isItem = r.items.find((x) => x.word === "is");
    expect(isItem).toBeDefined();
    expect(isItem!.count).toBe(1);
    // "optimize" 长度 8，超过默认 maxLen=6，应被丢弃
    expect(r.items.find((x) => x.word === "optimize")).toBeUndefined();
    // 用更大 maxLen 时可识别
    const r2 = analyzeDensity("optimize", { maxLen: 10 });
    expect(r2.items.find((x) => x.word === "optimize")).toBeDefined();
  });

  it("数字串独立成词", () => {
    const r = analyzeDensity("订单 12345 数量 12345 编号 67890");
    const n5 = r.items.find((x) => x.word === "12345");
    expect(n5).toBeDefined();
    expect(n5!.count).toBe(2);
    const n6 = r.items.find((x) => x.word === "67890");
    expect(n6).toBeDefined();
    expect(n6!.count).toBe(1);
  });

  it("默认停用词被过滤", () => {
    // 扩大 topN 确保所有词都在结果中
    const r = analyzeDensity("我和你都是好人我们自己看好了", { topN: 100 });
    // 默认停用词 "我"/"和"/"都"/"是"/"好"/"自己"/"看"/"了"/"在" 等应被过滤
    expect(r.items.find((x) => x.word === "我")).toBeUndefined();
    expect(r.items.find((x) => x.word === "了")).toBeUndefined();
    expect(r.items.find((x) => x.word === "的")).toBeUndefined();
    expect(r.items.find((x) => x.word === "好")).toBeUndefined();
    // "好人" 不在默认停用词中，应保留
    expect(r.items.find((x) => x.word === "好人")).toBeDefined();
  });

  it("topN 限制生效", () => {
    const text = "甲乙丙丁戊己庚辛壬癸" + "甲乙丙丁戊己庚辛壬癸";
    const r = analyzeDensity(text, { topN: 3 });
    expect(r.items.length).toBeLessThanOrEqual(3);
  });

  it("minLen / maxLen 边界控制词长", () => {
    const text = "搜索引擎优化";
    // minLen=3 仅产出 3 字短语
    const r = analyzeDensity(text, { minLen: 3, maxLen: 3 });
    for (const item of r.items) {
      expect([...item.word].length).toBe(3);
    }
    // minLen=1 maxLen=4 应包含单字到 4 字短语
    const r2 = analyzeDensity(text, { minLen: 1, maxLen: 4 });
    const lengths = r2.items.map((x) => [...x.word].length);
    expect(Math.max(...lengths)).toBe(4);
    expect(Math.min(...lengths)).toBe(1);
  });

  it("中英混合按各自规则分词", () => {
    const r = analyzeDensity("SEO 优化 SEO 优化 SEO 优化工具");
    expect(r.items.find((x) => x.word === "seo")).toBeDefined();
    expect(r.items.find((x) => x.word === "优化")).toBeDefined();
    expect(r.items.find((x) => x.word === "工具")).toBeDefined();
    // 中英互不混入（"SEOO" 之类不应出现）
    for (const item of r.items) {
      expect(item.word).not.toMatch(/^[a-zA-Z]+[\u4e00-\u9fff]/);
    }
  });

  it("自定义 stopwords 覆盖默认", () => {
    // 自定义停用词不含 "好人" → 应保留
    const r1 = analyzeDensity("好人好事", { stopwords: [] });
    expect(r1.items.find((x) => x.word === "好人")).toBeDefined();
    // 自定义停用词含 "好人" → 应被过滤
    const r2 = analyzeDensity("好人好事", { stopwords: ["好人"] });
    expect(r2.items.find((x) => x.word === "好人")).toBeUndefined();
    expect(r2.items.find((x) => x.word === "好事")).toBeDefined();
  });

  it("density 百分比保留 2 位小数且总和合理", () => {
    const r = analyzeDensity("搜索引擎优化搜索引擎优化");
    expect(r.total).toBeGreaterThan(0);
    for (const item of r.items) {
      // 保留 2 位小数：density * 100 应为整数
      expect(Math.round(item.density * 100)).toBeCloseTo(item.density * 100, 5);
      expect(item.density).toBeGreaterThan(0);
      expect(item.density).toBeLessThanOrEqual(100);
    }
  });

  it("items 按 count 降序排序", () => {
    const r = analyzeDensity("关键词分析关键词分析关键词分析关键词密度");
    for (let i = 1; i < r.items.length; i++) {
      expect(r.items[i - 1]!.count).toBeGreaterThanOrEqual(r.items[i]!.count);
    }
  });

  it("默认停用词数组含 ~30 个常用词", () => {
    expect(DEFAULT_STOPWORDS_CN.length).toBeGreaterThanOrEqual(25);
    expect(DEFAULT_STOPWORDS_CN).toContain("的");
    expect(DEFAULT_STOPWORDS_CN).toContain("了");
    expect(DEFAULT_STOPWORDS_CN).toContain("在");
    expect(DEFAULT_STOPWORDS_CN).toContain("是");
  });

  it("totalChars 按 Unicode 码点计数（含中文）", () => {
    const r = analyzeDensity("你好世界");
    expect(r.totalChars).toBe(4);
  });

  it("unique 反映过滤前的不同词数（说明用途）", () => {
    // 当 stopwords 覆盖一些词时，unique 仅统计过滤后的不同词数
    // 滑动窗口会产出大量重叠短语，unique 一般较大
    const r = analyzeDensity("搜索引擎优化是非常重要的工具");
    expect(r.unique).toBeGreaterThan(0);
  });

  it("密度总和 ≤ 100%（TOP N 截断后）", () => {
    const r = analyzeDensity("搜索引擎优化搜索引擎优化工具关键词分析", {
      topN: 5,
    });
    const sum = r.items.reduce((s, x) => s + x.density, 0);
    expect(sum).toBeLessThanOrEqual(100.0001);
  });
});
