import { describe, expect, it } from "vitest";
import { parseUA } from "./ua-parser-cn";

// 常见真实 UA 片段
const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const EDGE_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91";
const FIREFOX_LINUX =
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0";
const SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const CHROME_ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const CHROME_ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 12; SM-T500) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
const IE11_WIN =
  "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko";
const OPERA_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0";

describe("parseUA / 浏览器识别", () => {
  it("Chrome（Windows）", () => {
    const r = parseUA(CHROME_WIN);
    expect(r.browser).toBe("Chrome");
    expect(r.browserVersion).toBe("120.0.0.0");
    expect(r.os).toBe("Windows 10/11");
    expect(r.device).toBe("桌面");
  });

  it("Edge 优先于 Chrome 判定", () => {
    const r = parseUA(EDGE_WIN);
    expect(r.browser).toBe("Microsoft Edge");
    expect(r.browserVersion).toBe("120.0.2210.91");
  });

  it("Opera 优先于 Chrome 判定", () => {
    const r = parseUA(OPERA_MAC);
    expect(r.browser).toBe("Opera");
    expect(r.os).toContain("macOS");
  });

  it("Firefox（Linux）", () => {
    const r = parseUA(FIREFOX_LINUX);
    expect(r.browser).toBe("Firefox");
    expect(r.browserVersion).toBe("121.0");
    expect(r.os).toBe("Linux");
  });

  it("Safari（macOS）带版本号", () => {
    const r = parseUA(SAFARI_MAC);
    expect(r.browser).toBe("Safari");
    expect(r.browserVersion).toBe("17.1");
  });

  it("IE11 经 Trident 判定", () => {
    const r = parseUA(IE11_WIN);
    expect(r.browser).toBe("Internet Explorer");
    expect(r.browserVersion).toBe("11.0");
  });
});

describe("parseUA / 系统与设备", () => {
  it("iPhone → iOS + 手机", () => {
    const r = parseUA(SAFARI_IPHONE);
    expect(r.os).toBe("iOS 17.1");
    expect(r.device).toBe("手机");
  });

  it("Android Mobile → 手机", () => {
    const r = parseUA(CHROME_ANDROID_PHONE);
    expect(r.os).toBe("Android 13");
    expect(r.device).toBe("手机");
  });

  it("Android 无 Mobile → 平板", () => {
    const r = parseUA(CHROME_ANDROID_TABLET);
    expect(r.device).toBe("平板");
  });

  it("未知 UA 返回未知兜底而非抛错", () => {
    const r = parseUA("some-random-agent/1.0");
    expect(r.browser).toBe("未知浏览器");
    expect(r.os).toBe("未知系统");
    expect(r.device).toBe("未知");
  });

  it("空字符串安全兜底", () => {
    const r = parseUA("");
    expect(r.browser).toBe("未知浏览器");
    expect(r.device).toBe("未知");
  });
});
