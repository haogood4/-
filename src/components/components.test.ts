// P2-11 组件 container API 测试：真实渲染 .astro 组件并断言输出 HTML
import { describe, it, expect, beforeAll } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { ContainerRenderOptions } from "astro/container";

import CalcJsonLd from "./CalcJsonLd.astro";
import FaqSection from "./FaqSection.astro";
import Breadcrumb from "./Breadcrumb.astro";
import BreadcrumbJsonLd from "./BreadcrumbJsonLd.astro";
import SiteFooter from "./SiteFooter.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const render = (
  Component: Parameters<AstroContainer["renderToString"]>[0],
  options?: ContainerRenderOptions,
) => container.renderToString(Component, options);

describe("CalcJsonLd", () => {
  const faqItems = [
    { q: "问题一？", a: "答案一。" },
    { q: "问题二？", a: "答案二 <特殊> & 符号" },
  ];
  const props = { name: "测试计算器", description: "测试描述", faqItems };

  it("输出三块可解析 JSON-LD（含 BreadcrumbList）", async () => {
    const html = await render(CalcJsonLd, { props });
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => JSON.parse(m[1]));
    expect(blocks).toHaveLength(3);
    const crumb = blocks.find((b) => b["@type"] === "BreadcrumbList");
    expect(crumb).toBeDefined();
    expect(crumb.itemListElement).toHaveLength(2);
    expect(crumb.itemListElement[1].name).toBe("测试计算器");
    expect(crumb.itemListElement[1].item).toContain("/");
  });

  it("SoftwareApplication 字段正确且免费", async () => {
    const html = await render(CalcJsonLd, { props });
    const app = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )![1],
    );
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.name).toBe("测试计算器");
    expect(app.description).toBe("测试描述");
    expect(app.offers.price).toBe("0");
    expect(app.isAccessibleForFree).toBe(true);
    expect(app.url).toContain("/");
  });

  it("FAQPage mainEntity 与传入问答同源", async () => {
    const html = await render(CalcJsonLd, { props });
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => JSON.parse(m[1]));
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(2);
    expect(faq.mainEntity[0].name).toBe("问题一？");
    expect(faq.mainEntity[1].acceptedAnswer.text).toContain("答案二");
  });

  it("faqItems 为空时不输出 FAQPage 块", async () => {
    const html = await render(CalcJsonLd, {
      props: { ...props, faqItems: [] },
    });
    expect(html).toContain("SoftwareApplication");
    expect(html).not.toContain("FAQPage");
  });

  it("featureList 缺省时不渲染该字段", async () => {
    const html = await render(CalcJsonLd, { props });
    const app = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )![1],
    );
    expect("featureList" in app).toBe(false);
  });
});

describe("FaqSection", () => {
  it("渲染 details/summary 结构且数量匹配", async () => {
    const items = [
      { q: "Q1", a: "A1" },
      { q: "Q2", a: "A2" },
      { q: "Q3", a: "A3" },
    ];
    const html = await render(FaqSection, { props: { items } });
    expect((html.match(/<details/g) ?? []).length).toBe(3);
    expect(html).toContain("<summary>Q1</summary>");
    expect(html).toContain("A3");
    expect(html).toContain('aria-labelledby="faq-heading"');
  });

  it("空列表仍渲染标题区", async () => {
    const html = await render(FaqSection, { props: { items: [] } });
    expect(html).toContain("常见问题");
    expect(html).not.toContain("<details");
  });
});

describe("Breadcrumb", () => {
  it("末项无 href 渲染 aria-current 且带分隔点", async () => {
    const items = [{ label: "首页", href: "/" }, { label: "分类" }];
    const html = await render(Breadcrumb, { props: { items } });
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("breadcrumb__dot");
  });

  it("单项（无 href）不渲染多余分隔点", async () => {
    const html = await render(Breadcrumb, {
      props: { items: [{ label: "仅本页" }] },
    });
    expect(html).not.toContain("breadcrumb__dot");
    expect(html).toContain('aria-current="page"');
  });
});

describe("BreadcrumbJsonLd", () => {
  it("输出可解析 BreadcrumbList 且 position 连续", async () => {
    const html = await render(BreadcrumbJsonLd, {
      props: {
        items: [
          { name: "首页", href: "/" },
          { name: "场景指南", href: "/hub/" },
          { name: "当前页" },
        ],
      },
    });
    const block = JSON.parse(
      html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      )![1],
    );
    expect(block["@type"]).toBe("BreadcrumbList");
    expect(block.itemListElement).toHaveLength(3);
    expect(
      block.itemListElement.map((x: { position: number }) => x.position),
    ).toEqual([1, 2, 3]);
    expect(block.itemListElement[0].item).toMatch(/^https?:\/\//);
    expect(block.itemListElement[1].item).toContain("/hub/");
    // 末项无 href 时回退当前页 URL，仍为绝对地址
    expect(block.itemListElement[2].item).toMatch(/^https?:\/\//);
  });
});

describe("SiteFooter", () => {
  it("legal 三链接为真实路由而非死锚点", async () => {
    const html = await render(SiteFooter);
    expect(html).toContain('href="/legal/privacy/"');
    expect(html).toContain('href="/legal/terms/"');
    expect(html).toContain('href="/legal/disclaimer/"');
    expect(html).not.toContain('href="#privacy"');
    expect(html).toContain("仅供参考");
  });
});
