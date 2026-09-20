// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// 站点正式域名：上线前必须替换（当前为占位符）。
// 部署时也可通过环境变量 PUBLIC_SITE_URL 覆盖（Cloudflare Pages 环境变量）。
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://example-calculator.cn";

// 静态输出；禁止内联样式，保证 CSP（style-src 'self'）下可正常加载
export default defineConfig({
  site: SITE_URL,
  output: "static",
  build: {
    inlineStylesheets: "never",
  },
  // legal 三页已通过法务审核（DS-202609-08），正常收录；/search/ 仍为 noindex 功能页；
  // /search/ 为 noindex 功能页（薄内容），同样排除
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/search/"),
    }),
  ],
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      // Astro 7 内置 Content Collections 默认会被 sitemap 自动枚举，
      // 此 hook 仅为补充断言：扫描 dist 确保文章与 hub 详情页均已构建。
      const distDir = dir.pathname.replace(/^\/+/, "");
      const summary = { articles: 0, hub: 0 };
      async function count(prefix) {
        try {
          const entries = await readdir(join(distDir, prefix), {
            withFileTypes: true,
          });
          for (const e of entries) {
            if (e.isDirectory()) {
              try {
                await readdir(join(distDir, prefix, e.name, "index.html"));
                summary[prefix]++;
              } catch {
                /* 目录无 index.html */
              }
            }
          }
        } catch (err) {
          logger.warn(`sitemap hook scan ${prefix} 失败: ${err.message}`);
        }
      }
      await count("articles");
      await count("hub");
      logger.info(
        `sitemap hook: articles 详情 ${summary.articles} / hub 详情 ${summary.hub}（均应被 sitemap 收录）`,
      );
    },
  },
});
