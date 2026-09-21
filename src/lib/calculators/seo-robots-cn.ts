// src/lib/calculators/seo-robots-cn.ts — robots.txt 生成（纯函数）
// 三种策略：allow-all（全站允许）、disallow-all（全站禁止）、
// custom（自定义 UA + Disallow 列表）；Sitemap / Crawl-delay 按需附加。

export type RobotsPolicy = "allow-all" | "disallow-all" | "custom";

export const ROBOT_POLICY_LABELS: Record<RobotsPolicy, string> = {
  "allow-all": "允许全部抓取",
  "disallow-all": "禁止全部抓取",
  custom: "自定义规则",
};

export interface RobotsInput {
  policy: RobotsPolicy;
  /** custom：User-agent 列表，空时默认 ["*"] */
  userAgents?: string[];
  /** custom：Disallow 路径列表（自动去重） */
  disallows?: string[];
  sitemap?: string;
  /** custom：抓取延迟秒数，0~30 整数 */
  crawlDelay?: number;
}

export type RobotsResult =
  { ok: true; text: string } | { ok: false; error: string };

/** 生成 robots.txt 文本 */
export function generateRobots(input: RobotsInput): RobotsResult {
  const sitemap = (input.sitemap ?? "").trim();
  if (sitemap !== "" && !/^https?:\/\//i.test(sitemap)) {
    return { ok: false, error: "Sitemap 需为 http(s):// 开头的绝对地址" };
  }
  if (
    input.crawlDelay !== undefined &&
    (!Number.isInteger(input.crawlDelay) ||
      input.crawlDelay < 0 ||
      input.crawlDelay > 30)
  ) {
    return { ok: false, error: "Crawl-delay 需为 0~30 的整数（秒）" };
  }

  const lines: string[] = [];
  if (input.policy === "allow-all") {
    lines.push("User-agent: *", "Allow: /");
  } else if (input.policy === "disallow-all") {
    lines.push("User-agent: *", "Disallow: /");
  } else {
    const uas = (input.userAgents ?? [])
      .map((u) => u.trim())
      .filter((u) => u !== "");
    const uaList = uas.length > 0 ? uas : ["*"];
    const disallows = [
      ...new Set(
        (input.disallows ?? []).map((d) => d.trim()).filter((d) => d !== ""),
      ),
    ];
    for (const d of disallows) {
      if (!d.startsWith("/")) {
        return { ok: false, error: `Disallow 路径需以 / 开头：${d}` };
      }
    }
    for (const ua of uaList) {
      lines.push(`User-agent: ${ua}`);
      if (input.crawlDelay !== undefined) {
        lines.push(`Crawl-delay: ${input.crawlDelay}`);
      }
      if (disallows.length === 0) {
        // 空Disallow 值在协议中语义为「允许抓取全部」
        lines.push("Disallow:");
      } else {
        for (const d of disallows) lines.push(`Disallow: ${d}`);
      }
    }
  }
  if (sitemap !== "") {
    lines.push("", `Sitemap: ${sitemap}`);
  }
  return { ok: true, text: lines.join("\n") };
}
