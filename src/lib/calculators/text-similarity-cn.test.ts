import { describe, expect, it } from "vitest";
import { compareText, MAX_TEXT_CHARS } from "./text-similarity-cn";
import type { CompareTextResult } from "./text-similarity-cn";

function run(
  a: string,
  b: string,
  opts?: { ignoreCase?: boolean; ignoreWhitespace?: boolean },
): CompareTextResult {
  return compareText({
    a,
    b,
    ignoreCase: opts?.ignoreCase ?? false,
    ignoreWhitespace: opts?.ignoreWhitespace ?? false,
  });
}

function okValue(r: CompareTextResult) {
  if (!r.ok) throw new Error(`期望成功，实际报错：${r.error.message}`);
  return r.value;
}

describe("text-similarity-cn / 基本编辑距离", () => {
  it("完全相同：距离 0，相似度 1", () => {
    const v = okValue(run("hello", "hello"));
    expect(v.levenshtein).toBe(0);
    expect(v.similarity).toBe(1);
    expect(v.jaccard).toBe(1);
    expect(v.lengthA).toBe(5);
    expect(v.lengthB).toBe(5);
    expect(v.verdict).toBe("high");
  });

  it("完全不同：abc 与 xyz 距离 3，相似度 0", () => {
    const v = okValue(run("abc", "xyz"));
    expect(v.levenshtein).toBe(3);
    expect(v.similarity).toBe(0);
    expect(v.jaccard).toBe(0);
    expect(v.verdict).toBe("low");
  });

  it("单字符替换：kitten/sitten 距离 1，相似度 0.8333", () => {
    const v = okValue(run("kitten", "sitten"));
    expect(v.levenshtein).toBe(1);
    expect(v.similarity).toBe(0.8333);
  });

  it("插入与删除：abc/abcd 距离 1，相似度 0.75；词级 Jaccard 为 0", () => {
    const v = okValue(run("abc", "abcd"));
    expect(v.levenshtein).toBe(1);
    expect(v.similarity).toBe(0.75);
    expect(v.jaccard).toBe(0);
  });

  it("similarity 精度保留 4 位小数：1-1/7 → 0.8571", () => {
    const v = okValue(run("1234567", "123456x"));
    expect(v.similarity).toBe(0.8571);
  });
});

describe("text-similarity-cn / ignoreCase 开关", () => {
  it("开启：ABC 与 abc 判为完全相同", () => {
    const v = okValue(run("ABC", "abc", { ignoreCase: true }));
    expect(v.levenshtein).toBe(0);
    expect(v.similarity).toBe(1);
    expect(v.jaccard).toBe(1);
  });

  it("关闭：ABC 与 abc 距离 3，相似度 0", () => {
    const v = okValue(run("ABC", "abc"));
    expect(v.levenshtein).toBe(3);
    expect(v.similarity).toBe(0);
  });
});

describe("text-similarity-cn / ignoreWhitespace 开关", () => {
  it("开启：'a b c' 与 'abc' 判为相同，长度统计不含空白", () => {
    const v = okValue(run("a b c", "abc", { ignoreWhitespace: true }));
    expect(v.levenshtein).toBe(0);
    expect(v.similarity).toBe(1);
    expect(v.lengthA).toBe(3);
    expect(v.lengthB).toBe(3);
  });

  it("关闭：'a b c' 与 'abc' 距离 2（空格计入长度）", () => {
    const v = okValue(run("a b c", "abc"));
    expect(v.levenshtein).toBe(2);
    expect(v.similarity).toBe(0.6);
    expect(v.lengthA).toBe(5);
  });

  it("开启：全角空格与换行同样被移除", () => {
    const v = okValue(run("a　\nb", "ab", { ignoreWhitespace: true }));
    expect(v.levenshtein).toBe(0);
    expect(v.similarity).toBe(1);
  });
});

describe("text-similarity-cn / 中文与切词", () => {
  it("中文短句：计算器大全/计算器网站 距离 2，Jaccard 按单字 3/7", () => {
    const v = okValue(run("计算器大全", "计算器网站"));
    expect(v.levenshtein).toBe(2);
    expect(v.similarity).toBe(0.6);
    expect(v.jaccard).toBe(0.4286);
    expect(v.verdict).toBe("medium");
  });

  it("中英混合切词：词序打乱时 Jaccard 为 1 而编辑距离仍很大", () => {
    const v = okValue(run("计算器 abc", "abc 计算器"));
    expect(v.jaccard).toBe(1);
    expect(v.levenshtein).toBe(6);
    expect(v.similarity).toBe(0.1429);
  });
});

describe("text-similarity-cn / 空串与码点", () => {
  it("一空一非空：相似度 0，判定 low", () => {
    const v = okValue(run("", "abc"));
    expect(v.levenshtein).toBe(3);
    expect(v.similarity).toBe(0);
    expect(v.jaccard).toBe(0);
    expect(v.lengthA).toBe(0);
    expect(v.verdict).toBe("low");
  });

  it("双方皆空：相似度 1，判定 high", () => {
    const v = okValue(run("", ""));
    expect(v.levenshtein).toBe(0);
    expect(v.similarity).toBe(1);
    expect(v.jaccard).toBe(1);
    expect(v.verdict).toBe("high");
  });

  it("emoji 按码点计数：两个笑脸 vs 一个距离 1（非代理对 2）", () => {
    const v = okValue(run("😀😀", "😀"));
    expect(v.lengthA).toBe(2);
    expect(v.lengthB).toBe(1);
    expect(v.levenshtein).toBe(1);
    expect(v.similarity).toBe(0.5);
  });
});

describe("text-similarity-cn / 上限与非法输入", () => {
  it("恰好 5000 字符允许通过", () => {
    const t = "a".repeat(MAX_TEXT_CHARS);
    const v = okValue(run(t, t));
    expect(v.similarity).toBe(1);
  });

  it("文本 A 超过 5000 字符返回 TOO_LONG", () => {
    const r = run("a".repeat(MAX_TEXT_CHARS + 1), "abc");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_LONG");
      expect(r.error.message).toContain("文本 A");
    }
  });

  it("文本 B 超限返回 TOO_LONG 并指明 B", () => {
    const r = run("abc", "b".repeat(MAX_TEXT_CHARS + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LONG");
  });

  it("非字符串输入返回 INVALID_INPUT 且不抛异常", () => {
    const r = compareText({
      a: null as unknown as string,
      b: "x",
      ignoreCase: false,
      ignoreWhitespace: false,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("text-similarity-cn / verdict 三档边界", () => {
  it("相似度恰为 0.8 判 high", () => {
    const v = okValue(run("aaaaaaaaaa", "aaabaaabaa"));
    expect(v.similarity).toBe(0.8);
    expect(v.verdict).toBe("high");
  });

  it("相似度恰为 0.5 判 medium", () => {
    const v = okValue(run("000000111111", "000000000000"));
    expect(v.similarity).toBe(0.5);
    expect(v.verdict).toBe("medium");
  });

  it("相似度低于 0.5 判 low", () => {
    const v = okValue(run("0000001111111", "0000000000000"));
    expect(v.similarity).toBe(0.4615);
    expect(v.verdict).toBe("low");
  });
});
