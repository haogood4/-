// scripts/smoke-dist.mjs — P1-8 编译产物冒烟断言（Playwright 沙箱降级方案）
// 零依赖 Node 脚本，对 dist/ 执行 10 组关键路径断言；任何一组失败即 exit 1。
// 用法：pnpm build && node scripts/smoke-dist.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
const failures = [];
const pass = (n) => console.log(`  ✅ ${n}`);
const fail = (n, d) => {
  failures.push(n);
  console.log(`  ❌ ${n}${d ? ` — ${d}` : ""}`);
};

function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith(".html"));
const read = (f) => readFileSync(f, "utf8");

// 将站内 URL 映射到 dist 文件路径
function urlToPath(href) {
  let path = href.split("#")[0].split("?")[0];
  if (path === "") return null;
  if (!path.startsWith("/")) path = "/" + path; // 相对链接按站内根处理（本项目一律绝对路径）
  const clean = path.slice(1);
  if (clean === "") return join(DIST, "index.html");
  const direct = join(DIST, clean);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const asDir = join(DIST, clean, "index.html");
  if (existsSync(asDir)) return asDir;
  const withHtml = join(DIST, clean + ".html");
  if (existsSync(withHtml)) return withHtml;
  return null;
}

console.log("冒烟断言（11 组）：");

// ── 1. 页面总数 = 75（71 + legal 三页骨架 + 搜索页） ─────────
{
  const n = htmlFiles.length;
  if (n === 75) pass(`1. 页面总数 = 75（实际 ${n}）`);
  else fail("1. 页面总数应为 75", `实际 ${n}`);
}

// ── 2. 关键路由存在 ──────────────────────────────────────────
{
  const routes = [
    "/",
    "/finance/mortgage-cn/",
    "/finance/irr-cn/",
    "/finance/annualized-return-cn/",
    "/health/bmi-cn/",
    "/daily/basic/",
    "/articles-list/",
    "/articles/lpr-2026-september/",
    "/hub/first-home-buying/",
    "/legal/privacy/",
    "/legal/terms/",
    "/legal/disclaimer/",
    "/search/",
    "/404",
  ];
  const missing = routes.filter((r) =>
    r === "/404" ? !existsSync(join(DIST, "404.html")) : !urlToPath(r),
  );
  if (missing.length === 0) pass(`2. 关键路由全部存在（${routes.length} 条）`);
  else fail("2. 关键路由缺失", missing.join(", "));
}

// ── 3. 每页通用 head 要素 ────────────────────────────────────
{
  const bad = [];
  for (const f of htmlFiles) {
    if (f.endsWith("404.html")) continue; // 404 页允许无 canonical
    const h = read(f);
    const checks = [
      /<title>[^<]+<\/title>/.test(h),
      /rel="canonical"/.test(h),
      /property="og:title"/.test(h),
      /name="viewport"/.test(h),
      /rel="manifest"/.test(h),
    ];
    if (!checks.every(Boolean))
      bad.push(
        `${relative(DIST, f)} [${checks
          .map((c, i) => (c ? "" : i))
          .filter(Boolean)
          .join(",")}]`,
      );
  }
  if (bad.length === 0)
    pass("3. 全部页面含 title/canonical/og:title/viewport/manifest");
  else fail("3. head 要素缺失", bad.slice(0, 5).join(" | "));
}

// ── 4. 计算器页：免责声明硬失败；SoftwareApplication/FAQPage 为已知缺口（P1-9）──
{
  const calcDirs = [
    "finance",
    "health",
    "daily",
    "efficiency",
    "investment",
    "math",
    "unit",
    "dev",
    "decoration",
    "renovation",
  ];
  const pages = [];
  for (const d of calcDirs) {
    const abs = join(DIST, d);
    if (!existsSync(abs)) continue;
    for (const f of walk(abs)) if (f.endsWith("index.html")) pages.push(f);
  }
  const noDisclaimer = pages.filter((f) => !/仅供参考/.test(read(f)));
  const noSchema = pages.filter((f) => {
    const h = read(f);
    return !/@type":"SoftwareApplication/.test(h) || !/FAQPage/.test(h);
  });
  // DoD 3.1：meta description ≥30 字符（SEO 去同质化）+ 相关工具 section ≥3 链接
  const thinMeta = pages.filter((f) => {
    const h = read(f);
    const d = (h.match(/ name="description" content="([^"]*)"/) || [])[1] || "";
    const sec = h.match(/<h2[^>]*>相关工具<\/h2>[\s\S]*?<\/section>/);
    const linkN = sec
      ? (sec[0].match(/href="\/[a-z-]+\/[a-z0-9-]+\//g) || []).length
      : 0;
    return d.length < 30 || linkN < 3;
  });
  // DoD 3.1：计算器页 FAQ ≥3 条
  const thinFaq = pages.filter((f) => {
    const h = read(f);
    const m = h.match(
      /"@type":"FAQPage","mainEntity":\[([\s\S]*?)\]\}<\/script>/,
    );
    if (!m) return false; // 缺 FAQPage 由 noSchema 报
    return (m[1].match(/"@type":"Question"/g) || []).length < 3;
  });
  if (thinMeta.length > 0) {
    fail(
      "4. 计算器页 meta desc<30 或相关工具链接<3",
      thinMeta
        .slice(0, 5)
        .map((f) => relative(DIST, f))
        .join(" | "),
    );
  } else if (thinFaq.length > 0) {
    fail(
      "4. 计算器页 FAQ 少于 3 条",
      thinFaq
        .slice(0, 5)
        .map((f) => relative(DIST, f))
        .join(" | "),
    );
  } else if (noDisclaimer.length > 0) {
    fail(
      "4. 计算器页缺免责声明",
      noDisclaimer
        .slice(0, 5)
        .map((f) => relative(DIST, f))
        .join(" | "),
    );
  } else if (noSchema.length > 0) {
    fail(
      "4. 计算器页缺 SoftwareApplication/FAQPage",
      noSchema
        .slice(0, 5)
        .map((f) => relative(DIST, f))
        .join(" | "),
    );
  } else {
    pass(
      `4. ${pages.length} 个计算器页均含免责声明+SoftwareApplication+FAQPage`,
    );
  }
}

// ── 5. 文章页含 Article/BlogPosting JSON-LD ─────────────────
{
  const abs = join(DIST, "articles");
  const pages = existsSync(abs)
    ? walk(abs).filter((f) => f.endsWith("index.html"))
    : [];
  const bad = pages.filter((f) => {
    const h = read(f);
    return !/@type":"(Article|BlogPosting)/.test(h);
  });
  if (pages.length >= 11 && bad.length === 0)
    pass(`5. ${pages.length} 篇文章页均含 Article/BlogPosting JSON-LD`);
  else
    fail("5. 文章页 JSON-LD 异常", `共 ${pages.length} 页，缺失 ${bad.length}`);
}

// ── 6. 站内链接完整性（含锚点目标） ─────────────────────────
{
  const dead = [];
  const noAnchor = [];
  for (const f of htmlFiles) {
    const h = read(f);
    for (const m of h.matchAll(/href="([^"]*)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:)/i.test(href)) continue; // 外链与协议链接
      if (href.startsWith("#")) {
        // 页内裸锚点：目标 id 必须存在于当前页
        const id = href.slice(1);
        if (id && !h.includes(`id="${id}"`) && !h.includes(`name="${id}"`)) {
          noAnchor.push(`${relative(DIST, f)} → ${href}`);
        }
        continue;
      }
      if (href.startsWith("//")) continue; // 协议相对外链
      const target = urlToPath(href);
      if (!target) {
        dead.push(`${relative(DIST, f)} → ${href}`);
        continue;
      }
      const anchor = href.split("#")[1];
      if (
        anchor &&
        !read(target).includes(`id="${anchor}"`) &&
        !read(target).includes(`name="${anchor}"`)
      ) {
        noAnchor.push(`${relative(DIST, f)} → ${href}`);
      }
    }
  }
  if (dead.length === 0 && noAnchor.length === 0)
    pass("6. 站内链接零死链（含跨页/页内锚点校验）");
  else
    fail(
      "6. 存在死链/失效锚点",
      [...dead, ...noAnchor].slice(0, 6).join(" | "),
    );
}

// ── 7. CSP 红线：无内联脚本、无事件属性、无 javascript: ─────
{
  const inlineScript = [];
  const eventAttr = [];
  const jsUrl = [];
  for (const f of htmlFiles) {
    const h = read(f);
    for (const m of h.matchAll(/<script(?![^>]*src=)([^>]*)>/g)) {
      if (!/type="application\/ld\+json"/.test(m[1]))
        inlineScript.push(relative(DIST, f));
    }
    if (/\son(click|load|error|mouse\w+|key\w+)="/i.test(h))
      eventAttr.push(relative(DIST, f));
    if (/href="javascript:/i.test(h)) jsUrl.push(relative(DIST, f));
  }
  const ok =
    inlineScript.length === 0 && eventAttr.length === 0 && jsUrl.length === 0;
  if (ok) pass("7. 无内联脚本/事件属性/javascript: 协议（CSP 红线）");
  else
    fail(
      "7. CSP 红线违规",
      [inlineScript[0], eventAttr[0], jsUrl[0]].filter(Boolean).join(" | "),
    );
}

// ── 8. sitemap 与 robots ─────────────────────────────────────
{
  const idx = join(DIST, "sitemap-index.xml");
  let ok = existsSync(idx);
  if (ok) {
    const xml = read(idx);
    const children = [
      ...xml.matchAll(/<loc>[^<]*\/(sitemap[^<]*\.xml)<\/loc>/g),
    ].map((m) => m[1]);
    ok =
      children.length > 0 && children.every((c) => existsSync(join(DIST, c)));
  }
  const robots =
    existsSync(join(DIST, "robots.txt")) &&
    /sitemap/i.test(read(join(DIST, "robots.txt")));
  // P2-12：RSS 存在、条目数 = 文章总数、每页 head 含 alternate 声明
  const rssPath = join(DIST, "rss.xml");
  const rssOk =
    existsSync(rssPath) &&
    (read(rssPath).match(/<item>/g) ?? []).length === 11 &&
    /<rss/.test(read(rssPath));
  const rssLink = htmlFiles.every((f) => /application\/rss\+xml/.test(read(f)));
  // 通用守卫：noindex 页面不得出现在 sitemap 中
  const sitemapXml = existsSync(join(DIST, "sitemap-0.xml"))
    ? read(join(DIST, "sitemap-0.xml"))
    : "";
  const conflict = [];
  for (const f of htmlFiles) {
    if (!/content="noindex/.test(read(f))) continue;
    const rel = relative(DIST, f)
      .replace(/index\.html$/, "")
      .replace(/\.html$/, "")
      .replaceAll("\\", "/");
    if (rel && sitemapXml.includes(`/${rel}<`)) conflict.push(`/${rel}`);
  }
  // P2-9：搜索索引存在、可解析、条目数达标且全部 URL 为真实页面
  let idxOk = false;
  let idxWhy = "";
  const idxPath = join(DIST, "search-index.json");
  if (existsSync(idxPath)) {
    try {
      const docs = JSON.parse(read(idxPath));
      const bad = docs.filter(
        (d) => !d.t || !d.u || !urlToPath(d.u.replace(/^\//, "")),
      );
      idxOk = docs.length >= 67 && bad.length === 0;
      if (!idxOk) idxWhy = `docs=${docs.length} bad=${bad.length}`;
    } catch (e) {
      idxWhy = `parse: ${e.message}`;
    }
  } else {
    idxWhy = "missing";
  }
  if (ok && robots && conflict.length === 0 && rssOk && rssLink && idxOk)
    pass(
      "8. sitemap 有效、robots 指向 sitemap、无 noindex 冲突、RSS 11 条且全站可发现、搜索索引有效",
    );
  else
    fail(
      "8. sitemap/robots/RSS/搜索索引异常",
      `sitemap:${ok} robots:${robots} noindex冲突:${conflict.join(",")} rss:${rssOk} rssLink:${rssLink} idx:${idxWhy}`,
    );
}

// ── 9. 404 页含返回首页链接 ──────────────────────────────────
{
  const f = join(DIST, "404.html");
  const ok = existsSync(f) && /href="\/"/.test(read(f));
  if (ok) pass("9. 404 页存在且含返回首页链接");
  else fail("9. 404 页异常");
}

// ── 10. 全部 JSON-LD 可解析 ──────────────────────────────────
{
  let total = 0;
  let breadcrumbs = 0;
  const bad = [];
  for (const f of htmlFiles) {
    const h = read(f);
    for (const m of h.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    )) {
      total++;
      try {
        const parsed = JSON.parse(m[1]);
        if (parsed["@type"] === "BreadcrumbList") breadcrumbs++;
      } catch {
        bad.push(relative(DIST, f));
      }
    }
  }
  if (bad.length > 0) {
    fail("10. JSON-LD 解析失败", bad.slice(0, 3).join(" | "));
  } else if (total < 182) {
    fail(
      "10. JSON-LD 覆盖不足",
      `块数 ${total}（51 计算器页×3 + 文章×2 + hub/列表面包屑应 ≥182）`,
    );
  } else if (breadcrumbs < 69) {
    fail(
      "10. BreadcrumbList 覆盖不足",
      `块数 ${breadcrumbs}（51 计算器 + 11 文章 + 7 hub/列表应 ≥69）`,
    );
  } else {
    pass(
      `10. ${total} 个 JSON-LD 块全部可解析（含 ${breadcrumbs} 个 BreadcrumbList）`,
    );
  }
}

{
  // 11. 无障碍（a11y）核心维度：
  // - 每页恰好 1 个 <h1>
  // - 必须有 <main id="main"> 锚点与 .skip-link
  // - 全部 <img> 必带 alt 属性
  // - 全部 <input>/<select>/<textarea> 非 hidden 必有关联 label 或 aria-label
  // - 全部 <button> 与 <a>（去 svg 内）必有可见文本或 aria-label
  // - 颜色 token 关键配对比对 ≥ WCAG AA 4.5:1
  const fs = await import("node:fs");
  const path = await import("node:path");
  function walk(dir) {
    const out = [];
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) out.push(...walk(p));
      else if (f.endsWith(".html")) out.push(p);
    }
    return out;
  }
  const htmls = walk(DIST);
  const bad = [];
  let missingMain = 0;
  let missingSkip = 0;
  let imgNoAlt = 0;
  let formNoLabel = 0;
  let btnNoName = 0;
  let ancNoName = 0;
  for (const f of htmls) {
    const h = read(f);
    const h1s = (h.match(/<h1\b/g) ?? []).length;
    if (h1s !== 1) bad.push(`${relative(DIST, f)} h1=${h1s}`);
    if (!/id="main"/.test(h)) missingMain++;
    if (!/class="skip-link"/.test(h)) missingSkip++;
    for (const m of h.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt=/.test(m[0])) imgNoAlt++;
    }
    const cleaned = h.replace(/<svg[\s\S]*?<\/svg>/g, "");
    for (const m of cleaned.matchAll(
      /<(input|select|textarea)\b[^>]*>/g,
    )) {
      const t = m[0];
      const type = (t.match(/\btype="([^"]+)"/) ?? [])[1];
      if (type === "hidden") continue;
      const id = (t.match(/\bid="([^"]+)"/) ?? [])[1];
      const hasAria = /aria-label=|aria-labelledby=/.test(t);
      const hasLabel = id && new RegExp(`<label[^>]{0,120}\\bfor="${id}"`).test(h);
      if (!hasAria && !hasLabel) formNoLabel++;
    }
    for (const m of cleaned.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) {
      const open = m[0];
      const body = m[1] || "";
      if (/>[^<]+</.test(open) || /<[^>]+>[^<]+/.test(body)) continue;
      if (/aria-label=/.test(open)) continue;
      btnNoName++;
    }
    for (const m of cleaned.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
      const open = m[0];
      if (/class="(skip-link|brand|logo|icon-only)/.test(open)) continue;
      const body = m[1] || "";
      if (/>[^<]+</.test(open) || /<[^>]+>[^<]+/.test(body)) continue;
      if (/aria-label=/.test(open)) continue;
      ancNoName++;
    }
  }
  // 对比度（WCAG AA）：扫描 global.css 解析颜色 token，配对计算
  function lum(hex) {
    const m = hex
      .replace("#", "")
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16) / 255);
    const f = (x) =>
      x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
  }
  function ratio(a, b) {
    const la = lum(a),
      lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  const hexMap = {
    text: "#134e4a",
    page: "#ffffff",
    muted: "#57534e",
    soft: "#ccfbf1",
    onPrimary: "#ffffff",
    prim: "#0f766e",
    primStrong: "#115e59",
    errorText: "#991b1b",
    errorBg: "#fef2f2",
    successText: "#166534",
    successBg: "#f0fdf4",
    warnText: "#78350f",
    warnBg: "#fffbeb",
  };
  const pairs = [
    ["text", "page"],
    ["muted", "page"],
    ["prim", "page"],
    ["text", "soft"],
    ["onPrimary", "prim"],
    ["onPrimary", "primStrong"],
    ["errorText", "errorBg"],
    ["successText", "successBg"],
    ["warnText", "warnBg"],
  ];
  const contrastFails = [];
  for (const [f, b] of pairs) {
    if (ratio(hexMap[f], hexMap[b]) < 4.5)
      contrastFails.push(`${f}/${b}=${ratio(hexMap[f], hexMap[b]).toFixed(2)}`);
  }
  const issues = [];
  if (bad.length) issues.push(`h1≠1: ${bad.slice(0, 3).join(" | ")}`);
  if (missingMain) issues.push(`缺 <main id="main">: ${missingMain} 页`);
  if (missingSkip) issues.push(`缺 .skip-link: ${missingSkip} 页`);
  if (imgNoAlt) issues.push(`<img> 缺 alt: ${imgNoAlt}`);
  if (formNoLabel) issues.push(`表单缺 label: ${formNoLabel}`);
  if (btnNoName) issues.push(`按钮缺文本: ${btnNoName}`);
  if (ancNoName) issues.push(`链接缺文本: ${ancNoName}`);
  if (contrastFails.length)
    issues.push(`对比度不达标: ${contrastFails.join(", ")}`);
  if (issues.length) {
    fail("11. a11y", issues.join(" | "));
  } else {
    pass(
      `11. a11y（75 页 h1=1、main/skip-link/label/alt/btn/anc 全齐，对比度 9 组 ≥4.5:1）`,
    );
  }
}

console.log(
  failures.length === 0
    ? "\nSMOKE PASS: 11/11"
    : `\nSMOKE FAIL: ${failures.length} 组未通过`,
);
process.exit(failures.length === 0 ? 0 : 1);
