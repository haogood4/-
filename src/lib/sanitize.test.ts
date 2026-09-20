/**
 * src/lib/sanitize.test.ts — 构建期 HTML 清洗单测（P0-2）
 * 覆盖：正常 markdown 产物保留 / XSS 载体剥离 / 危险协议拒绝 / 空值与边界
 */
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml — 正常内容保留", () => {
  it("保留标题、段落、列表、加粗斜体", () => {
    const html =
      "<h2>房贷计算</h2><p>等额本息是<em>常见</em><strong>方式</strong></p><ul><li>月供</li><li>利息</li></ul>";
    const out = sanitizeHtml(html);
    expect(out).toContain("<h2>房贷计算</h2>");
    expect(out).toContain("<ul><li>月供</li>");
    expect(out).toContain("<em>常见</em>");
    expect(out).toContain("<strong>方式</strong>");
  });

  it("错配闭合标签被规范化且不丢失文本", () => {
    const out = sanitizeHtml("<p>等额本息是<em>常见</strong>方式</p>");
    expect(out).toContain("常见");
    expect(out).toContain("方式");
    expect(out).not.toContain("</strong>");
  });

  it("保留表格与代码块", () => {
    const html =
      '<table><thead><tr><th>期数</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table><pre><code class="lang-js">let a=1;</code></pre>';
    const out = sanitizeHtml(html);
    expect(out).toContain("<table>");
    expect(out).toContain("<td>1</td>");
    expect(out).toContain("<pre><code>");
  });

  it("保留站内链接与 https 外链、图片", () => {
    const html =
      '<a href="/finance/mortgage-cn/">房贷</a><a href="https://www.gov.cn/x">政策</a><img src="/og-image.png" alt="图示">';
    const out = sanitizeHtml(html);
    expect(out).toContain('href="/finance/mortgage-cn/"');
    expect(out).toContain('href="https://www.gov.cn/x"');
    expect(out).toContain('src="/og-image.png"');
    expect(out).toContain('alt="图示"');
  });

  it("保留 mailto 链接", () => {
    expect(sanitizeHtml('<a href="mailto:a@b.com">联系</a>')).toContain(
      'href="mailto:a@b.com"',
    );
  });
});

describe("sanitizeHtml — XSS 载体剥离", () => {
  it("剥离 script 标签及其内容", () => {
    const out = sanitizeHtml("<p>正常</p><script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert");
    expect(out).toContain("<p>正常</p>");
  });

  it("剥离内联事件属性", () => {
    const out = sanitizeHtml(
      '<img src="x.png" onerror="alert(1)"><p onclick="steal()">文</p>',
    );
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("onclick");
    expect(out).toContain("<p>文</p>");
  });

  it("拒绝 javascript: 协议链接", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">点我</a>');
    expect(out).not.toContain("javascript:");
  });

  it("拒绝 data: 协议链接与危险 src", () => {
    expect(
      sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>'),
    ).not.toContain("data:text/html");
    expect(sanitizeHtml('<img src="javascript:alert(1)">')).not.toContain(
      "javascript:",
    );
  });

  it("剥离 iframe / form / style 标签", () => {
    const out = sanitizeHtml(
      '<iframe src="https://evil.example"></iframe><form action="/x"><input></form><style>body{display:none}</style>',
    );
    expect(out).not.toContain("<iframe");
    expect(out).not.toContain("<form");
    expect(out).not.toContain("<style");
  });

  it("剥离 svg 内嵌脚本载体", () => {
    const out = sanitizeHtml("<svg><script>alert(1)</script></svg><p>ok</p>");
    expect(out).not.toContain("script");
    expect(out).toContain("<p>ok</p>");
  });
});

describe("sanitizeHtml — 空值与边界", () => {
  it("空字符串返回空", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("纯文本原样保留", () => {
    expect(sanitizeHtml("纯文本内容")).toBe("纯文本内容");
  });

  it("未闭合标签不产生可执行内容", () => {
    const out = sanitizeHtml("<p>未闭合<script>alert(1)");
    expect(out).not.toContain("<script");
  });

  it("超长输入正常处理", () => {
    const long = "<p>" + "字".repeat(50000) + "</p>";
    const out = sanitizeHtml(long);
    expect(out).toContain("<p>");
    expect(out.length).toBeGreaterThan(50000);
  });
});
