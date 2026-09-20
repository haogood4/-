import { describe, expect, it } from "vitest";
import { dedupLines, MAX_LINES } from "./line-dedup-cn";
import type { DedupResult } from "./line-dedup-cn";

function run(
  text: string,
  opts?: { trim?: boolean; ignoreCase?: boolean; removeEmpty?: boolean },
): DedupResult {
  return dedupLines({
    text,
    trim: opts?.trim ?? false,
    ignoreCase: opts?.ignoreCase ?? false,
    removeEmpty: opts?.removeEmpty ?? false,
  });
}

function okValue(r: DedupResult) {
  if (!r.ok) throw new Error(`期望成功，实际报错：${r.error.message}`);
  return r.value;
}

describe("line-dedup-cn / 基本去重", () => {
  it("重复行只保留一份，统计正确", () => {
    const v = okValue(run("a\nb\na"));
    expect(v.output).toBe("a\nb");
    expect(v.total).toBe(3);
    expect(v.kept).toBe(2);
    expect(v.removed).toBe(1);
    expect(v.removedLines).toEqual(["a"]);
  });

  it("保留首次出现顺序", () => {
    const v = okValue(run("b\na\nb\na\nc"));
    expect(v.output).toBe("b\na\nc");
    expect(v.kept).toBe(3);
    expect(v.removed).toBe(2);
  });

  it("全重复：只留一行", () => {
    const v = okValue(run("x\nx\nx"));
    expect(v.output).toBe("x");
    expect(v.removedLines).toEqual(["x", "x"]);
  });

  it("单行输入原样保留", () => {
    const v = okValue(run("only"));
    expect(v.output).toBe("only");
    expect(v.total).toBe(1);
    expect(v.kept).toBe(1);
    expect(v.removed).toBe(0);
  });

  it("空输入：0 行，输出为空", () => {
    const v = okValue(run(""));
    expect(v.output).toBe("");
    expect(v.total).toBe(0);
    expect(v.kept).toBe(0);
    expect(v.removed).toBe(0);
    expect(v.removedLines).toEqual([]);
  });

  it("中文行去重", () => {
    const v = okValue(run("苹果\n香蕉\n苹果\n苹果"));
    expect(v.output).toBe("苹果\n香蕉");
    expect(v.removed).toBe(2);
  });

  it("CRLF 换行按 \\r?\\n 拆分，输出以 \\n 连接", () => {
    const v = okValue(run("a\r\nb\r\na"));
    expect(v.output).toBe("a\nb");
    expect(v.total).toBe(3);
  });
});

describe("line-dedup-cn / trim 选项", () => {
  it("trim 开：前后空格不同的同一行视为重复，输出去空白", () => {
    const v = okValue(run("  a  \na\nb", { trim: true }));
    expect(v.output).toBe("a\nb");
    expect(v.removed).toBe(1);
    expect(v.removedLines).toEqual(["a"]);
  });

  it("trim 关：' a' 与 'a' 视为不同行", () => {
    const v = okValue(run(" a\na"));
    expect(v.output).toBe(" a\na");
    expect(v.kept).toBe(2);
    expect(v.removed).toBe(0);
  });
});

describe("line-dedup-cn / ignoreCase 选项", () => {
  it("ABC/abc/Abc 忽略大小写只留首行，且保留原文大小写", () => {
    const v = okValue(run("ABC\nabc\nAbc", { ignoreCase: true }));
    expect(v.output).toBe("ABC");
    expect(v.removed).toBe(2);
  });

  it("ignoreCase 关闭时大小写不同视为不同行", () => {
    const v = okValue(run("ABC\nabc"));
    expect(v.kept).toBe(2);
  });

  it("ignoreCase + trim 组合：' ABC ' 与 'abc' 判重", () => {
    const v = okValue(run(" ABC \nabc", { trim: true, ignoreCase: true }));
    expect(v.output).toBe("ABC");
    expect(v.removed).toBe(1);
  });
});

describe("line-dedup-cn / removeEmpty 选项", () => {
  it("removeEmpty 开：空行与纯空白行被删除并计入 removed", () => {
    const v = okValue(run("a\n\n  \nb\n", { removeEmpty: true }));
    expect(v.output).toBe("a\nb");
    expect(v.total).toBe(5);
    expect(v.kept).toBe(2);
    expect(v.removed).toBe(3);
    expect(v.removedLines).toEqual(["", "  ", ""]);
  });

  it("removeEmpty 关：空行保留一份，多余空行按重复去除", () => {
    const v = okValue(run("a\n\n\nb"));
    expect(v.output).toBe("a\n\nb");
    expect(v.total).toBe(4);
    expect(v.kept).toBe(3);
    expect(v.removed).toBe(1);
  });

  it("removeEmpty 关 + trim 开：纯空白行归一为空行仍保留", () => {
    const v = okValue(run("a\n  \nb", { trim: true }));
    expect(v.output).toBe("a\n\nb");
    expect(v.kept).toBe(3);
  });

  it("removed 恒等于 total - kept（开关全开组合）", () => {
    const v = okValue(
      run(" A \n a\n\nb\nb\n  ", {
        trim: true,
        ignoreCase: true,
        removeEmpty: true,
      }),
    );
    expect(v.output).toBe("A\nb");
    expect(v.removed).toBe(v.total - v.kept);
  });
});

describe("line-dedup-cn / 上限与非法输入", () => {
  it("行数超过上限返回 TOO_LARGE", () => {
    const text = Array(MAX_LINES + 1)
      .fill("a")
      .join("\n");
    const r = run(text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LARGE");
  });

  it("恰好处于行数上限允许通过", () => {
    const text = Array(MAX_LINES).fill("a").join("\n");
    const v = okValue(run(text));
    expect(v.total).toBe(MAX_LINES);
    expect(v.kept).toBe(1);
  });

  it("输入超过 2MB 返回 TOO_LARGE", () => {
    // 汉字 UTF-8 占 3 字节：700000 字 ≈ 2.1MB，单行不触发行数上限
    const text = "あ".repeat(700000);
    const r = run(text);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LARGE");
  });

  it("非字符串输入返回 INVALID_INPUT 且不抛异常", () => {
    const r = dedupLines({
      text: null as unknown as string,
      trim: false,
      ignoreCase: false,
      removeEmpty: false,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
