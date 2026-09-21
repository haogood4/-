import { describe, expect, it } from "vitest";
import { generateRobots } from "./seo-robots-cn";

describe("generateRobots", () => {
  it("allow-all：全站允许", () => {
    const r = generateRobots({ policy: "allow-all" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe("User-agent: *\nAllow: /");
  });

  it("disallow-all：全站禁止", () => {
    const r = generateRobots({ policy: "disallow-all" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe("User-agent: *\nDisallow: /");
  });

  it("custom：多 UA + 多路径，路径去重", () => {
    const r = generateRobots({
      policy: "custom",
      userAgents: ["Baiduspider", "Googlebot"],
      disallows: ["/admin/", "/tmp/", "/admin/"],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe(
      [
        "User-agent: Baiduspider",
        "Disallow: /admin/",
        "Disallow: /tmp/",
        "User-agent: Googlebot",
        "Disallow: /admin/",
        "Disallow: /tmp/",
      ].join("\n"),
    );
  });

  it("custom 无 UA 时默认 *，无路径时输出空 Disallow", () => {
    const r = generateRobots({ policy: "custom" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe("User-agent: *\nDisallow:");
  });

  it("Crawl-delay 输出在每个 UA 组内", () => {
    const r = generateRobots({
      policy: "custom",
      userAgents: ["Baiduspider"],
      disallows: ["/private/"],
      crawlDelay: 10,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toContain("Crawl-delay: 10");
    expect(r.text.indexOf("Crawl-delay")).toBeGreaterThan(
      r.text.indexOf("User-agent"),
    );
  });

  it("Sitemap 附加在末尾（空行分隔）", () => {
    const r = generateRobots({
      policy: "allow-all",
      sitemap: "https://example.com/sitemap.xml",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(
      r.text.endsWith("\n\nSitemap: https://example.com/sitemap.xml"),
    ).toBe(true);
  });

  it("Crawl-delay 越界 / 非整数报错", () => {
    expect(generateRobots({ policy: "custom", crawlDelay: 31 }).ok).toBe(false);
    expect(generateRobots({ policy: "custom", crawlDelay: -1 }).ok).toBe(false);
    expect(generateRobots({ policy: "custom", crawlDelay: 1.5 }).ok).toBe(
      false,
    );
    expect(generateRobots({ policy: "custom", crawlDelay: 30 }).ok).toBe(true);
  });

  it("Sitemap 非绝对地址报错", () => {
    const r = generateRobots({
      policy: "allow-all",
      sitemap: "/sitemap.xml",
    });
    expect(r.ok).toBe(false);
  });

  it("Disallow 路径不以 / 开头报错", () => {
    const r = generateRobots({
      policy: "custom",
      disallows: ["admin"],
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toContain("/ 开头");
  });
});
