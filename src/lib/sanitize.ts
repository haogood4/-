/**
 * src/lib/sanitize.ts — 构建期 markdown HTML 清洗（P0-2 安全门禁）
 *
 * 用途：对 marked.parse 的输出做 DOMPurify 白名单清洗，杜绝文章 markdown
 * 中可能混入的 <script>/事件属性/javascript: 协议等 XSS 载体。
 * 仅在构建期（Node）执行，不进客户端 bundle（isomorphic-dompurify 为 devDependency）。
 */
import DOMPurify from "isomorphic-dompurify";

/** 文章正文允许的标签：覆盖 markdown 渲染产物（标题/段落/列表/表格/代码/引用/链接/图片） */
const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "del",
  "s",
  "sup",
  "sub",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "kbd",
  "samp",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  "a",
  "img",
  "figure",
  "figcaption",
  "abbr",
  "cite",
  "dfn",
  "mark",
  "small",
  "span",
  "div",
];

/** 允许的属性：链接/图片/表格对齐/标题锚点等 markdown 常规产物 */
const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "align",
  "id",
  "colspan",
  "rowspan",
  "start",
  "type",
];

/** 协议白名单：站内相对路径 + http(s) + mailto；javascript:/data: 等一律拒绝 */
const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * 清洗 marked.parse 产出的 HTML。
 * 输入为构建期受控 markdown 的渲染结果；输出保证无脚本、无事件属性、无危险协议。
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    ALLOW_DATA_ATTR: false,
  });
}
