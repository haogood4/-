/**
 * src/content.config.ts
 * Astro 7 Content Collections schema 定义（v1.0.0，Astro 7 升级后路径变更）
 *
 * 用途：约束 articles（知识库文章）frontmatter 字段，统一 SEO 元数据源。
 * 由 [slug].astro 与 index.astro 在构建期读取并生成静态 HTML。
 */
import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(10).max(80),
    description: z.string().min(50).max(200),
    category: z.enum([
      "finance",
      "health",
      "renovation",
      "investment",
      "efficiency",
      "daily",
    ]),
    /** 相关工具 URL 数组（≥3），用于详情页底部「相关工具」推荐 */
    tools: z.array(z.string()).min(3),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.string().default("计算器大全编辑团队"),
    keywords: z.array(z.string()).min(3).max(8),
    /** FAQ 列表（≥3）：q 问句，a 答句 */
    faq: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        }),
      )
      .min(3),
    /** 阅读时长估算（分钟） */
    readingTime: z.number().int().min(3).max(20),
  }),
});

export const collections = { articles };
