// P2-9 站内搜索索引（构建期生成 /search-index.json，运行时仅 fetch + 子串匹配）
// 数据源与首页/文章/Hub 完全同源（nav.ts / articles.ts / hubs.ts），新增工具自动进索引。
import type { APIRoute } from "astro";
import { NAV_CATEGORIES } from "../data/nav";
import { ARTICLES } from "../data/articles";
import { HUBS } from "../data/hubs";

interface SearchDoc {
  /** 标题 */
  t: string;
  /** 站内 URL */
  u: string;
  /** 类型标签：工具 / 文章 / 指南 */
  c: string;
  /** 描述（用于次级匹配与结果摘要） */
  d: string;
  /** 关键词（空格分隔，用于扩展匹配） */
  k: string;
}

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const cat of NAV_CATEGORIES) {
    for (const tool of cat.tools) {
      docs.push({
        t: tool.label,
        u: tool.href,
        c: "工具",
        d: `${cat.name}分类下的在线计算工具`,
        k: `${cat.name} ${tool.label} 计算器 在线 免费`,
      });
    }
  }
  for (const a of ARTICLES) {
    docs.push({
      t: a.title,
      u: `/articles/${a.slug}/`,
      c: a.type === "blog" ? "资讯" : "文章",
      d: a.description,
      k: a.keywords.join(" "),
    });
  }
  for (const h of HUBS) {
    docs.push({
      t: h.title,
      u: `/hub/${h.slug}/`,
      c: "指南",
      d: h.scenario,
      k: `${h.category} 场景指南 ${h.title}`,
    });
  }
  return docs;
}

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildIndex()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
