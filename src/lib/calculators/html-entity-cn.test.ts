import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, encodeHtmlEntities } from "./html-entity-cn";
// 命名实体表单一来源：public/data/html-entities.json（页面运行时 lazy fetch 同一文件）
import namedEntities from "../../../public/data/html-entities.json";

describe("encodeHtmlEntities", () => {
  it("5 个 XML 核心字符全部转义", () => {
    expect(encodeHtmlEntities('<a href="x">&\'')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;",
    );
  });

  it("普通文本原样返回", () => {
    expect(encodeHtmlEntities("你好 world 123")).toBe("你好 world 123");
  });

  it("空字符串返回空字符串", () => {
    expect(encodeHtmlEntities("")).toBe("");
  });
});

describe("decodeHtmlEntities / 数值实体", () => {
  it("十进制实体解码", () => {
    expect(decodeHtmlEntities("&#72;&#101;&#108;lo")).toBe("Hello");
  });

  it("十六进制实体解码（小写 x）", () => {
    expect(decodeHtmlEntities("&#x4f60;&#x597d;")).toBe("你好");
  });

  it("未知/越界实体原样保留", () => {
    expect(decodeHtmlEntities("&#zz; &#99999999999;")).toBe(
      "&#zz; &#99999999999;",
    );
  });
});

describe("decodeHtmlEntities / 命名实体（外置表）", () => {
  it("nbsp amp copy 解码", () => {
    expect(decodeHtmlEntities("&nbsp;&amp;&copy;", namedEntities)).toBe(
      "\u00a0&©",
    );
  });

  it("希腊字母与箭头", () => {
    expect(decodeHtmlEntities("&alpha;&rarr;&infin;", namedEntities)).toBe(
      "α→∞",
    );
  });

  it("无映射表时命名实体原样保留，数值实体仍解码", () => {
    expect(decodeHtmlEntities("&copy;&#169;")).toBe("&copy;©");
  });

  it("未收录实体原样保留", () => {
    expect(decodeHtmlEntities("&notarealentity;", namedEntities)).toBe(
      "&notarealentity;",
    );
  });
});

describe("encode/decode 往返", () => {
  it("编码后解码还原原文", () => {
    const src = '<div class="a">Tom & Jerry\'s</div>';
    expect(decodeHtmlEntities(encodeHtmlEntities(src))).toBe(src);
  });
});
