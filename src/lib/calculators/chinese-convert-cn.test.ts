import { describe, expect, it } from "vitest";
import { convertChinese } from "./chinese-convert-cn";

describe("chinese-convert-cn 繁简转换引擎", () => {
  it("s2t：基本简体转繁体", () => {
    const r = convertChinese({ text: "计算机开发" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("計算機開發");
  });

  it("t2s：基本繁体转简体", () => {
    const r = convertChinese({ text: "計算機開發" }, "t2s");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("计算机开发");
  });

  it("s2t：常用句子转换，同形字保持不变", () => {
    const r = convertChinese({ text: "我的电脑" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("我的電腦");
  });

  it("t2s：常用句子转换", () => {
    const r = convertChinese({ text: "這裡有學習資料" }, "t2s");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("这里有学习资料");
  });

  it("非中文透传：英文数字符号原样输出", () => {
    const r = convertChinese({ text: "Hello, world! 12345 @#$" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toBe("Hello, world! 12345 @#$");
      expect(r.value.converted).toBe(0);
    }
  });

  it("空输入正常返回空结果", () => {
    const r = convertChinese({ text: "" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toBe("");
      expect(r.value.chars).toBe(0);
      expect(r.value.converted).toBe(0);
    }
  });

  it("s2t 标点：弯引号转直角引号", () => {
    const r = convertChinese({ text: "他说：“你好”" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("他說：「你好」");
  });

  it("t2s 标点：直角引号转弯引号", () => {
    const r = convertChinese({ text: "他說：「你好」" }, "t2s");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("他说：“你好”");
  });

  it("多音字局限：简→繁取常用义优先（发→發 而非 髮）", () => {
    const r = convertChinese({ text: "头发" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 单字级映射无法区分「頭髮」，发→發 常用义优先（见文件头注释与 FAQ）
      expect(r.value.output).toBe("頭發");
    }
  });

  it("多音字局限：后→後、干→幹（常用义优先）", () => {
    const r = convertChinese({ text: "以后干活" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("以後幹活");
  });

  it("简繁同形字不转换（面、中、算）", () => {
    const r = convertChinese({ text: "面中算" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toBe("面中算");
      expect(r.value.converted).toBe(0);
    }
  });

  it("chars 按 Unicode 码点计数（emoji 算 1 个字符）", () => {
    const r = convertChinese({ text: "😀我爱电脑" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.chars).toBe(5);
      expect(r.value.output).toBe("😀我愛電腦");
    }
  });

  it("换行与空白保留", () => {
    const r = convertChinese({ text: "a\nb  c\t" }, "t2s");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("a\nb  c\t");
  });

  it("converted 统计实际转换字符数", () => {
    const r = convertChinese({ text: "电脑abc" }, "s2t");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.converted).toBe(2);
  });

  it("非字符串输入拒绝且不抛异常", () => {
    const r = convertChinese({ text: null as unknown as string }, "s2t");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("input 为 null 拒绝且不抛异常", () => {
    const r = convertChinese(null as unknown as { text: string }, "s2t");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("未知方向拒绝", () => {
    const r = convertChinese({ text: "测试" }, "unknown" as unknown as "s2t");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_DIRECTION");
  });
});
