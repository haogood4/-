// src/lib/calculators/seo-meta-cn.ts — TDK 生成与长度检查（纯函数）
// 长度口径：按 Unicode 码点计数（1 个汉字 / 1 个字母 / 1 个 emoji 均计 1），
// 与主流中文搜索引擎摘要截断展示口径一致。

export const TITLE_LIMIT = 30;
export const DESC_LIMIT = 78;

/** 码点计数：1 个代理对（emoji 等）计 1 */
export function charLength(s: string): number {
  return [...s].length;
}

export interface LengthCheck {
  /** 码点长度 */
  length: number;
  limit: number;
  /** 是否在限长内 */
  ok: boolean;
}

export function checkTitleLength(title: string): LengthCheck {
  const length = charLength(title.trim());
  return { length, limit: TITLE_LIMIT, ok: length <= TITLE_LIMIT };
}

export function checkDescLength(desc: string): LengthCheck {
  const length = charLength(desc.trim());
  return { length, limit: DESC_LIMIT, ok: length <= DESC_LIMIT };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface MetaInput {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
}

export type MetaResult =
  { ok: true; html: string } | { ok: false; error: string };

/** 生成可直接粘贴进 <head> 的 meta 标签片段 */
export function generateMeta(input: MetaInput): MetaResult {
  const title = input.title.trim();
  const description = input.description.trim();
  if (title === "") {
    return { ok: false, error: "标题（title）不能为空" };
  }
  if (description === "") {
    return { ok: false, error: "描述（description）不能为空" };
  }
  const canonical = (input.canonical ?? "").trim();
  if (canonical !== "" && !/^https?:\/\//i.test(canonical)) {
    return { ok: false, error: "canonical 链接需以 http(s):// 开头" };
  }
  const lines = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  ];
  const keywords = (input.keywords ?? "").trim();
  if (keywords !== "") {
    lines.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  }
  const robots = (input.robots ?? "").trim();
  if (robots !== "") {
    lines.push(`<meta name="robots" content="${escapeHtml(robots)}" />`);
  }
  if (canonical !== "") {
    lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  }
  return { ok: true, html: lines.join("\n") };
}
