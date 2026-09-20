// P2-12 RSS feed：知识库文章 + 政策资讯全量输出（按发布时间倒序）
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { ARTICLES } from "../data/articles";

export function GET(context: APIContext) {
  const site = context.site ?? context.url;
  return rss({
    title: "计算器大全 — 知识库与政策资讯",
    description: "计算工具使用指南、公式推导与金融/税务/健康政策解读",
    site,
    items: [...ARTICLES]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .map((a) => ({
        title: a.title,
        description: a.description,
        pubDate: a.updatedAt,
        link: `/articles/${a.slug}/`,
        categories: [a.type === "blog" ? "政策资讯" : a.category],
        author: a.author,
      })),
    trailingSlash: true,
  });
}
