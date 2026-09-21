// HTML 实体编码/解码引擎 —— 编码固定转义 5 个 XML 核心字符（& < > " '）；
// 解码支持十进制/十六进制数值实体，命名实体通过外部传入的映射表
//（public/data/html-entities.json，页面脚本 lazy fetch）扩展，未收录的实体原样保留。
export type EntityMap = Record<string, string>;

/** 引擎内置的 5 个 XML 核心命名实体（解码兜底，无需外部表） */
const CORE_NAMED: EntityMap = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** 编码：固定转义 & &lt; &gt; &quot; &#39;（& 必须最先处理避免二次转义） */
export function encodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeNumeric(body: string): string | null {
  if (body === "") return null;
  let code: number;
  if (body[0] === "x" || body[0] === "X") {
    if (!/^[xX][0-9a-fA-F]+$/.test(body)) return null;
    code = parseInt(body.slice(1), 16);
  } else {
    if (!/^\d+$/.test(body)) return null;
    code = parseInt(body, 10);
  }
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return null;
  try {
    // 代理区/非法码位按字面返回，避免产生损坏字符串
    if (code >= 0xd800 && code <= 0xdfff) return null;
    return String.fromCodePoint(code);
  } catch {
    return null;
  }
}

/**
 * 解码：优先数值实体，再查命名表（不区分前导 & 与结尾 ; 缺失情形——
 * 必须同时具备 & 与 ; 才解码，未命中的整段原样保留）。
 */
export function decodeHtmlEntities(text: string, named?: EntityMap): string {
  const lookup = (body: string): string | undefined => {
    if (named) {
      const hit = named[body];
      if (hit !== undefined) return hit;
      // HTML 实体名区分大小写，但对全小写变体（&AMP; 等）做一次兜底
      const ci = named[body.toLowerCase()];
      if (ci !== undefined) return ci;
    }
    return CORE_NAMED[body];
  };
  return text.replace(/&(#?[0-9a-zA-Z]+);/g, (whole, body: string) => {
    if (body.startsWith("#")) {
      const ch = decodeNumeric(body.slice(1));
      return ch ?? whole;
    }
    const hit = lookup(body);
    return hit === undefined ? whole : hit;
  });
}
