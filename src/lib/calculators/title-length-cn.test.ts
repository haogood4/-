import { describe, expect, it } from "vitest";
import { analyzeTitle, type TitleStatus } from "./title-length-cn";

/** 取指定平台建议的 status */
function statusOf(
  r: ReturnType<typeof analyzeTitle>,
  platform: string,
): TitleStatus {
  if (!r.ok) throw new Error("预期成功");
  const s = r.value.suggestions.find((x) => x.platform === platform);
  if (!s) throw new Error(`缺少平台：${platform}`);
  return s.status;
}

const cn = (n: number) => "字".repeat(n);
const en = (n: number) => "a".repeat(n);

describe("title-length-cn analyzeTitle", () => {
  it("纯中文：chars/bytes/units 正确（每字 3 字节、宽度 2）", () => {
    const r = analyzeTitle("新媒体运营技巧");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(7);
      expect(r.value.bytes).toBe(21);
      expect(r.value.units).toBe(14);
    }
  });

  it("纯英文：每字符 1 字节 1 宽度", () => {
    const r = analyzeTitle("Hello World");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(11);
      expect(r.value.bytes).toBe(11);
      expect(r.value.units).toBe(11);
    }
  });

  it("中英混合：宽度按 CJK=2 / 其余=1 累加", () => {
    const r = analyzeTitle("SEO 优化技巧分享");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(10);
      expect(r.value.bytes).toBe(3 + 1 + 6 * 3); // SEO + 空格 + 6 汉字
      expect(r.value.units).toBe(4 + 6 * 2); // "SEO " 窄 4 + 6 宽
    }
  });

  it("空字符串拒绝并返回 INVALID_INPUT", () => {
    const r = analyzeTitle("");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID_INPUT");
      expect(r.error.message).toBe("请输入要检测的标题");
    }
  });

  it("纯空白（含全角空格）拒绝", () => {
    expect(analyzeTitle("   ").ok).toBe(false);
    expect(analyzeTitle("\u3000\t\n").ok).toBe(false);
  });

  it("非字符串输入拒绝且不抛异常", () => {
    for (const bad of [null, undefined, 123, {}]) {
      const r = analyzeTitle(bad as unknown as string);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
    }
  });

  it("超长标题：各平台 OVER 状态正确", () => {
    const r = analyzeTitle(cn(65));
    expect(r.ok).toBe(true);
    expect(statusOf(r, "百度")).toBe("OVER");
    expect(statusOf(r, "谷歌")).toBe("WARN"); // 65 在 61-75
    expect(statusOf(r, "微博")).toBe("OVER");
    expect(statusOf(r, "知乎")).toBe("OVER"); // 65 > 60
  });

  it("emoji：码点算 1、UTF-8 算 4 字节、宽度算 2", () => {
    const r = analyzeTitle("🚀火箭");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(3);
      expect(r.value.bytes).toBe(4 + 6);
      expect(r.value.units).toBe(2 + 4);
    }
  });

  it("全角标点与全角空格按宽度 2 计", () => {
    const r = analyzeTitle("你好，世界！");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(6);
      expect(r.value.bytes).toBe(18);
      expect(r.value.units).toBe(12);
    }
  });

  it("百度边界：30 OK / 31 WARN / 36 WARN / 37 OVER", () => {
    expect(statusOf(analyzeTitle(cn(30)), "百度")).toBe("OK");
    expect(statusOf(analyzeTitle(cn(31)), "百度")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(36)), "百度")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(37)), "百度")).toBe("OVER");
  });

  it("谷歌边界：9 过短 WARN / 10 OK / 60 OK / 61 WARN / 75 WARN / 76 OVER", () => {
    expect(statusOf(analyzeTitle(en(9)), "谷歌")).toBe("WARN");
    expect(statusOf(analyzeTitle(en(10)), "谷歌")).toBe("OK");
    expect(statusOf(analyzeTitle(en(60)), "谷歌")).toBe("OK");
    expect(statusOf(analyzeTitle(en(61)), "谷歌")).toBe("WARN");
    expect(statusOf(analyzeTitle(en(75)), "谷歌")).toBe("WARN");
    expect(statusOf(analyzeTitle(en(76)), "谷歌")).toBe("OVER");
  });

  it("微博边界：13 OVER / 14 WARN / 18 OK / 22 OK / 26 WARN / 27 OVER", () => {
    expect(statusOf(analyzeTitle(cn(13)), "微博")).toBe("OVER");
    expect(statusOf(analyzeTitle(cn(14)), "微博")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(18)), "微博")).toBe("OK");
    expect(statusOf(analyzeTitle(cn(22)), "微博")).toBe("OK");
    expect(statusOf(analyzeTitle(cn(26)), "微博")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(27)), "微博")).toBe("OVER");
  });

  it("知乎边界：19 OVER / 20 WARN / 30 OK / 50 OK / 60 WARN / 61 OVER", () => {
    expect(statusOf(analyzeTitle(cn(19)), "知乎")).toBe("OVER");
    expect(statusOf(analyzeTitle(cn(20)), "知乎")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(30)), "知乎")).toBe("OK");
    expect(statusOf(analyzeTitle(cn(50)), "知乎")).toBe("OK");
    expect(statusOf(analyzeTitle(cn(60)), "知乎")).toBe("WARN");
    expect(statusOf(analyzeTitle(cn(61)), "知乎")).toBe("OVER");
  });

  it("suggestions 固定 4 平台且顺序为 百度/谷歌/微博/知乎，字段齐全", () => {
    const r = analyzeTitle("一个合适的中文标题长度示例");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.suggestions.map((s) => s.platform)).toEqual([
        "百度",
        "谷歌",
        "微博",
        "知乎",
      ]);
      for (const s of r.value.suggestions) {
        expect(s.rule.length).toBeGreaterThan(0);
        expect(["OK", "WARN", "OVER"]).toContain(s.status);
        expect(s.advice.length).toBeGreaterThan(0);
      }
    }
  });

  it("前后含空白的有效标题：正常返回且按原文计数", () => {
    const r = analyzeTitle("  标题  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.chars).toBe(6);
  });
});
