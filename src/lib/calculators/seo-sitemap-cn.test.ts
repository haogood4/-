import { describe, expect, it } from "vitest";
import { generateSitemap, parseSitemapInput } from "./seo-sitemap-cn";

describe("generateSitemap", () => {
  it("单条最简 URL 生成合法 XML", () => {
    const r = generateSitemap([{ loc: "https://example.com/" }]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(r.xml).toContain(
      'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    );
    expect(r.xml).toContain("<loc>https://example.com/</loc>");
    expect(r.xml).not.toContain("<changefreq>");
  });

  it("全字段按协议元素输出", () => {
    const r = generateSitemap([
      {
        loc: "https://example.com/post/",
        changefreq: "weekly",
        priority: 0.8,
        lastmod: "2026-09-21",
      },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.xml).toContain("<lastmod>2026-09-21</lastmod>");
    expect(r.xml).toContain("<changefreq>weekly</changefreq>");
    expect(r.xml).toContain("<priority>0.8</priority>");
  });

  it("loc 中 XML 特殊字符被转义", () => {
    const r = generateSitemap([{ loc: "https://example.com/?a=1&b=<2>" }]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.xml).toContain(
      "<loc>https://example.com/?a=1&amp;b=&lt;2&gt;</loc>",
    );
  });

  it("多条 URL 生成多个 <url> 块", () => {
    const r = generateSitemap([
      { loc: "https://a.com/" },
      { loc: "https://b.com/" },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.xml.match(/<url>/g)?.length).toBe(2);
  });

  it("空列表 / 空 loc / 相对地址报错", () => {
    expect(generateSitemap([]).ok).toBe(false);
    expect(generateSitemap([{ loc: "  " }]).ok).toBe(false);
    const r = generateSitemap([{ loc: "/relative/path" }]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain("绝对地址");
  });

  it("changefreq / priority / lastmod 非法报错", () => {
    expect(
      generateSitemap([{ loc: "https://a.com/", changefreq: "someday" }]).ok,
    ).toBe(false);
    expect(generateSitemap([{ loc: "https://a.com/", priority: 1.5 }]).ok).toBe(
      false,
    );
    expect(
      generateSitemap([{ loc: "https://a.com/", priority: -0.1 }]).ok,
    ).toBe(false);
    expect(
      generateSitemap([{ loc: "https://a.com/", lastmod: "2026/09/21" }]).ok,
    ).toBe(false);
  });
});

describe("parseSitemapInput", () => {
  it("解析「URL 频率 优先级」三段式", () => {
    const r = parseSitemapInput(
      "https://a.com/ daily 0.9\nhttps://b.com/ weekly 0.5",
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entries.length).toBe(2);
    expect(r.entries[0]).toEqual({
      loc: "https://a.com/",
      changefreq: "daily",
      priority: 0.9,
    });
    expect(r.entries[1]?.changefreq).toBe("weekly");
  });

  it("仅 URL 与仅 URL+频率也支持", () => {
    const r = parseSitemapInput("https://a.com/\nhttps://b.com/ monthly");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entries[0]).toEqual({ loc: "https://a.com/" });
    expect(r.entries[1]?.changefreq).toBe("monthly");
  });

  it("空行与 # 注释跳过，重复 URL 去重保序", () => {
    const r = parseSitemapInput(
      "# comment\nhttps://a.com/\n\nhttps://a.com/\nhttps://b.com/",
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entries.map((e) => e.loc)).toEqual([
      "https://a.com/",
      "https://b.com/",
    ]);
  });

  it("非法频率 / 优先级报错，空输入报错", () => {
    expect(parseSitemapInput("https://a.com/ someday").ok).toBe(false);
    expect(parseSitemapInput("https://a.com/ daily 2").ok).toBe(false);
    expect(parseSitemapInput("# 只有注释\n").ok).toBe(false);
  });

  it("与 generateSitemap 配合：解析结果可直接生成", () => {
    const p = parseSitemapInput("https://a.com/ daily 0.9");
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    const g = generateSitemap(p.entries);
    expect(g.ok).toBe(true);
  });
});
