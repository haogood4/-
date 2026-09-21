// src/lib/calculators/seo-link-check-cn.ts — 外链有效性检查（纯函数部分）
// 实际 HTTP 探测在页面脚本用 fetch 完成（受 CORS 限制，见页面 FAQ 说明）；
// 本模块负责 URL 列表解析（去重 / 补协议 / 过滤）与状态码分类。

export interface UrlParseSummary {
  /** 校验通过（已补协议、已去重，保持原顺序） */
  valid: string[];
  /** 无法解析为合法 URL 的原始行 */
  invalid: string[];
  /** 重复条数 */
  duplicates: number;
}

const URL_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * 解析多行 URL 列表：空行与 # 注释跳过；无协议时补 https://；
 * 用 URL 构造器做合法性校验；按补全后的完整 URL 去重（保留首个）。
 */
export function parseUrlList(text: string): UrlParseSummary {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const raw = rawLine.trim();
    if (raw === "" || raw.startsWith("#")) continue;
    const candidate = URL_RE.test(raw) ? raw : `https://${raw}`;
    let ok = true;
    try {
      // 含空格或无 host 的输入会在构造时抛错
      new URL(candidate);
    } catch {
      ok = false;
    }
    if (!ok || /\s/.test(candidate)) {
      invalid.push(raw);
      continue;
    }
    if (seen.has(candidate)) {
      duplicates++;
      continue;
    }
    seen.add(candidate);
    valid.push(candidate);
  }
  return { valid, invalid, duplicates };
}

export type StatusGroup = "ok" | "redirect" | "client-error" | "server-error";

export interface StatusClass {
  group: StatusGroup;
  label: string;
}

/** HTTP 状态码 → 分组与中文标签（2xx 正常 / 3xx 重定向 / 4xx、5xx 异常） */
export function classifyStatus(status: number): StatusClass {
  if (status >= 200 && status < 300) {
    return { group: "ok", label: "正常" };
  }
  if (status >= 300 && status < 400) {
    return { group: "redirect", label: "重定向" };
  }
  if (status >= 400 && status < 500) {
    return { group: "client-error", label: "客户端错误" };
  }
  return { group: "server-error", label: "服务端错误" };
}
