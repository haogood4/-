import { describe, expect, it } from "vitest";
import { formatJson } from "./json-format-cn";

describe("json-format-cn", () => {
  it("英文对象 pretty 输出带 2 空格缩进", () => {
    const r = formatJson({ input: '{"a":1,"b":"x"}', mode: "pretty" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toBe('{\n  "a": 1,\n  "b": "x"\n}');
    }
  });

  it("minify 去除缩进与换行", () => {
    const r = formatJson({
      input: '{\n  "a": 1,\n  "b": [2, 3]\n}',
      mode: "minify",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe('{"a":1,"b":[2,3]}');
  });

  it("中文内容原样保留", () => {
    const r = formatJson({ input: '{"名称":"计算器"}', mode: "pretty" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toContain('"名称": "计算器"');
    }
  });

  it("空输入返回 EMPTY", () => {
    const r = formatJson({ input: "", mode: "pretty" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白输入返回 EMPTY", () => {
    const r = formatJson({ input: "   \n\t ", mode: "minify" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("非法 JSON 返回 INVALID 且消息含行列位置", () => {
    const bad = '{\n  "a": 1,\n  b: 2\n}';
    const r = formatJson({ input: bad, mode: "pretty" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("INVALID");
      expect(r.error.message).toContain("第 3 行");
      expect(r.error.message).toMatch(/第 \d+ 行第 \d+ 列附近/);
    }
  });

  it("单行非法 JSON 位置换算为第 1 行第 8 列", () => {
    const r = formatJson({ input: '{"a":1,}', mode: "pretty" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.message).toContain("第 1 行第 8 列附近");
    }
  });

  it("嵌套对象 pretty 输出多层缩进", () => {
    const r = formatJson({
      input: '{"a":{"b":{"c":1}}}',
      mode: "pretty",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.output).toContain('\n      "c": 1');
    }
  });

  it("数组顶层输入可格式化", () => {
    const r = formatJson({ input: "[1,2,3]", mode: "pretty" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.output).toBe("[\n  1,\n  2,\n  3\n]");
  });

  it("标量 JSON（数字/字符串/null）可解析", () => {
    for (const text of ["42", '"文本"', "null", "true"]) {
      const r = formatJson({ input: text, mode: "minify" });
      expect(r.ok).toBe(true);
    }
  });

  it("pretty 输出可再解析且与 minify 往返一致", () => {
    const src = '{"x":[1,{"y":"中文"}],"z":null}';
    const pretty = formatJson({ input: src, mode: "pretty" });
    const min = formatJson({ input: src, mode: "minify" });
    expect(pretty.ok).toBe(true);
    expect(min.ok).toBe(true);
    if (pretty.ok && min.ok) {
      expect(JSON.parse(pretty.value.output)).toEqual(JSON.parse(src));
      expect(pretty.value.output.replace(/\s+/g, "")).toBe(
        min.value.output.replace(/\s+/g, ""),
      );
    }
  });

  it("超长 JSON（1000 元素数组）可处理", () => {
    const big = JSON.stringify({
      items: Array.from({ length: 1000 }, (_, i) => i),
    });
    const r = formatJson({ input: big, mode: "minify" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const back = JSON.parse(r.value.output) as { items: number[] };
      expect(back.items.length).toBe(1000);
      expect(back.items[999]).toBe(999);
    }
  });

  it("emoji 与多字节字符往返一致", () => {
    const src = '{"face":"😀🎉","note":" café ñ"}';
    const r = formatJson({ input: src, mode: "pretty" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.value.output)).toEqual(JSON.parse(src));
    }
  });
});
