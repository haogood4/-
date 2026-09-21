import { describe, expect, it } from "vitest";
import {
  charLength,
  checkDescLength,
  checkTitleLength,
  generateMeta,
} from "./seo-meta-cn";

describe("长度检查", () => {
  it("码点计数：emoji 计 1", () => {
    expect(charLength("👍a")).toBe(2);
    expect(charLength("你好")).toBe(2);
  });

  it("标题 30 字以内通过、31 字超限", () => {
    expect(checkTitleLength("好".repeat(30)).ok).toBe(true);
    expect(checkTitleLength("好".repeat(31)).ok).toBe(false);
    expect(checkTitleLength("好".repeat(31)).limit).toBe(30);
  });

  it("描述 78 字以内通过、79 字超限", () => {
    expect(checkDescLength("好".repeat(78)).ok).toBe(true);
    expect(checkDescLength("好".repeat(79)).ok).toBe(false);
  });

  it("首尾空白不计入长度", () => {
    expect(checkTitleLength("  你好  ").length).toBe(2);
  });
});

describe("generateMeta", () => {
  it("仅标题与描述：输出两行基础片段", () => {
    const r = generateMeta({ title: "工具站", description: "好用的工具" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.html).toBe(
      '<title>工具站</title>\n<meta name="description" content="好用的工具" />',
    );
  });

  it("全字段：keywords / robots / canonical 按需追加", () => {
    const r = generateMeta({
      title: "工具站",
      description: "好用的工具",
      keywords: "工具,计算器",
      robots: "index,follow",
      canonical: "https://example.com/tools/",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const html = r.html;
    expect(html).toContain('<meta name="keywords" content="工具,计算器" />');
    expect(html).toContain('<meta name="robots" content="index,follow" />');
    expect(html).toContain(
      '<link rel="canonical" href="https://example.com/tools/" />',
    );
  });

  it("属性值转义：引号与尖括号不破坏 HTML", () => {
    const r = generateMeta({
      title: 'A"bug<X>&Y',
      description: 'desc&<">',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.html).toContain("<title>A&quot;bug&lt;X&gt;&amp;Y</title>");
    expect(r.html).toContain('content="desc&amp;&lt;&quot;&gt;"');
  });

  it("标题 / 描述为空报错", () => {
    expect(generateMeta({ title: "", description: "d" }).ok).toBe(false);
    expect(generateMeta({ title: "t", description: "   " }).ok).toBe(false);
  });

  it("canonical 非绝对地址报错", () => {
    const r = generateMeta({
      title: "t",
      description: "d",
      canonical: "/relative-path",
    });
    expect(r.ok).toBe(false);
  });
});
