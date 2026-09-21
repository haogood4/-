import { describe, expect, it } from "vitest";
import { classifyStatus, parseUrlList } from "./seo-link-check-cn";

describe("parseUrlList", () => {
  it("解析多行 URL 并保持顺序", () => {
    const r = parseUrlList("https://a.com/\nhttps://b.com/x");
    expect(r.valid).toEqual(["https://a.com/", "https://b.com/x"]);
    expect(r.invalid).toEqual([]);
    expect(r.duplicates).toBe(0);
  });

  it("无协议时自动补 https://", () => {
    const r = parseUrlList("a.com\nhttp://b.com");
    expect(r.valid).toEqual(["https://a.com", "http://b.com"]);
  });

  it("重复 URL 去重并计数", () => {
    const r = parseUrlList("https://a.com/\nhttps://a.com/\na.com");
    // a.com 补协议后为 https://a.com（无尾斜杠），与 https://a.com/ 视为不同 URL
    expect(r.valid).toEqual(["https://a.com/", "https://a.com"]);
    expect(r.duplicates).toBe(1);
  });

  it("空行与 # 注释跳过", () => {
    const r = parseUrlList("# 注释\n\nhttps://a.com/\n   ");
    expect(r.valid).toEqual(["https://a.com/"]);
  });

  it("非法 URL 进入 invalid 列表（含空格 / 无 host）", () => {
    const r = parseUrlList("ht tp://x.com\nhttps://\nhttps://ok.com");
    expect(r.invalid).toEqual(["ht tp://x.com", "https://"]);
    expect(r.valid).toEqual(["https://ok.com"]);
  });

  it("空输入返回全空汇总", () => {
    const r = parseUrlList("");
    expect(r.valid).toEqual([]);
    expect(r.invalid).toEqual([]);
    expect(r.duplicates).toBe(0);
  });
});

describe("classifyStatus", () => {
  it("2xx 正常 / 3xx 重定向", () => {
    expect(classifyStatus(200)).toEqual({ group: "ok", label: "正常" });
    expect(classifyStatus(204).group).toBe("ok");
    expect(classifyStatus(301)).toEqual({ group: "redirect", label: "重定向" });
    expect(classifyStatus(302).group).toBe("redirect");
  });

  it("4xx / 5xx 分类为异常", () => {
    expect(classifyStatus(404)).toEqual({
      group: "client-error",
      label: "客户端错误",
    });
    expect(classifyStatus(500)).toEqual({
      group: "server-error",
      label: "服务端错误",
    });
    expect(classifyStatus(503).group).toBe("server-error");
  });
});
