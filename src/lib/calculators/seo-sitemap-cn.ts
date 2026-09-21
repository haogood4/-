// src/lib/calculators/seo-sitemap-cn.ts — sitemap.xml 生成（纯函数）
// 遵循 sitemaps.org 0.9 协议：loc 必须为绝对地址；changefreq / priority /
// lastmod 校验后按协议元素输出，XML 特殊字符一律转义。

export const CHANGEFREQS: readonly string[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

export interface SitemapEntry {
  loc: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export type SitemapResult =
  { ok: true; xml: string } | { ok: false; error: string };

function validateEntry(entry: SitemapEntry): string | null {
  const loc = entry.loc.trim();
  if (loc === "") return "存在空的 URL";
  if (!/^https?:\/\//i.test(loc)) {
    return `URL 需为 http(s):// 开头的绝对地址：${loc}`;
  }
  if (
    entry.changefreq !== undefined &&
    !CHANGEFREQS.includes(entry.changefreq)
  ) {
    return `changefreq 非法（应为 always/hourly/daily/weekly/monthly/yearly/never）：${entry.changefreq}`;
  }
  if (
    entry.priority !== undefined &&
    (!Number.isFinite(entry.priority) ||
      entry.priority < 0 ||
      entry.priority > 1)
  ) {
    return "priority 需为 0~1 之间的数字";
  }
  const lastmod = (entry.lastmod ?? "").trim();
  if (lastmod !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
    return `lastmod 需为 YYYY-MM-DD 格式：${lastmod}`;
  }
  return null;
}

/** 生成完整 sitemap.xml 文本 */
export function generateSitemap(entries: SitemapEntry[]): SitemapResult {
  if (entries.length === 0) {
    return { ok: false, error: "请至少提供一条 URL" };
  }
  const blocks: string[] = [];
  for (const entry of entries) {
    const err = validateEntry(entry);
    if (err) return { ok: false, error: err };
    const lines = [`    <loc>${escapeXml(entry.loc.trim())}</loc>`];
    const lastmod = (entry.lastmod ?? "").trim();
    if (lastmod !== "") {
      lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
    }
    if (entry.changefreq !== undefined) {
      lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
    }
    if (entry.priority !== undefined) {
      lines.push(`    <priority>${entry.priority}</priority>`);
    }
    blocks.push(`  <url>\n${lines.join("\n")}\n  </url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.join(
    "\n",
  )}\n</urlset>`;
  return { ok: true, xml };
}

export type ParseResult =
  { ok: true; entries: SitemapEntry[] } | { ok: false; error: string };

/**
 * 解析多行输入：每行「URL [changefreq] [priority]」，# 开头为注释；
 * 自动跳过空行并按 URL 去重（保留首个）。
 */
export function parseSitemapInput(text: string): ParseResult {
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const tokens = line.split(/\s+/);
    const loc = tokens[0] ?? "";
    if (seen.has(loc)) continue;
    seen.add(loc);
    const entry: SitemapEntry = { loc };
    const freq = tokens[1];
    if (freq !== undefined) {
      if (!CHANGEFREQS.includes(freq)) {
        return {
          ok: false,
          error: `第 ${entries.length + 1} 行 changefreq 非法：${freq}`,
        };
      }
      entry.changefreq = freq;
    }
    const priorityRaw = tokens[2];
    if (priorityRaw !== undefined) {
      const priority = Number(priorityRaw);
      if (!Number.isFinite(priority) || priority < 0 || priority > 1) {
        return {
          ok: false,
          error: `第 ${entries.length + 1} 行 priority 需为 0~1：${priorityRaw}`,
        };
      }
      entry.priority = priority;
    }
    entries.push(entry);
  }
  if (entries.length === 0) {
    return { ok: false, error: "请至少提供一条 URL" };
  }
  return { ok: true, entries };
}
