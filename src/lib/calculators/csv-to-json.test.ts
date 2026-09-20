import { describe, expect, it } from "vitest";
import { csvToJson, toPrettyJson } from "./csv-to-json";

describe("csv-to-json", () => {
  it("简单表：首行作表头转对象数组", () => {
    const r = csvToJson({ csv: "name,age\nAlice,30\nBob,25" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([
        { name: "Alice", age: "30" },
        { name: "Bob", age: "25" },
      ]);
      expect(r.value.count).toBe(2);
      expect(r.value.fields).toBe(2);
    }
  });

  it("引号内的逗号不拆分字段", () => {
    const r = csvToJson({ csv: 'a,b\n"x,y",z', delimiter: "," });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: "x,y", b: "z" }]);
  });

  it('"" 转义为字面引号', () => {
    const r = csvToJson({ csv: 'a\n"say ""hi"""', delimiter: "," });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: 'say "hi"' }]);
  });

  it("引号内的换行保留在字段值中", () => {
    const r = csvToJson({ csv: 'a,b\n"line1\nline2",x' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([{ a: "line1\nline2", b: "x" }]);
      expect(r.value.count).toBe(1);
    }
  });

  it("分号分隔自动检测", () => {
    const r = csvToJson({ csv: "a;b;c\n1;2;3" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: "1", b: "2", c: "3" }]);
  });

  it("Tab 分隔自动检测", () => {
    const r = csvToJson({ csv: "a\tb\n1\t2" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: "1", b: "2" }]);
  });

  it("显式分隔符覆盖自动检测", () => {
    const r = csvToJson({ csv: "a;b\tc\nd;e\tf", delimiter: "\t" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ "a;b": "d;e", c: "f" }]);
  });

  it("自动检测忽略引号内的分隔符候选", () => {
    // 首行引号外：逗号 0 个、分号 1 个 → 应选分号
    const r = csvToJson({ csv: '"x,y";z\n"p,q";w' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ "x,y": "p,q", z: "w" }]);
  });

  it("无表头模式输出二维数组", () => {
    const r = csvToJson({ csv: "a,b\n1,2", hasHeader: false });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([
        ["a", "b"],
        ["1", "2"],
      ]);
      expect(r.value.count).toBe(2);
    }
  });

  it("字段数不一致报错且消息含行号", () => {
    const r = csvToJson({ csv: "a,b\n1,2\n3" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("FIELD_COUNT_MISMATCH");
      expect(r.error.message).toContain("第 3 行");
    }
  });

  it("多行引号字段后的错位行号计算正确", () => {
    const r = csvToJson({ csv: 'a,b\n"x\ny",z\n1' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // 第二条记录跨第 2-3 行，第三条记录起始于第 4 行
      expect(r.error.message).toContain("第 4 行");
    }
  });

  it("空输入返回 EMPTY", () => {
    const r = csvToJson({ csv: "" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白输入返回 EMPTY", () => {
    const r = csvToJson({ csv: "  \n\t \n" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("仅表头：rows 为空且字段数正确", () => {
    const r = csvToJson({ csv: "a,b,c" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([]);
      expect(r.value.count).toBe(0);
      expect(r.value.fields).toBe(3);
    }
  });

  it("单字段列（换行分隔）", () => {
    const r = csvToJson({ csv: "name\nAlice\nBob" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([{ name: "Alice" }, { name: "Bob" }]);
      expect(r.value.fields).toBe(1);
    }
  });

  it("CRLF 行尾正常解析", () => {
    const r = csvToJson({ csv: "a,b\r\n1,2\r\n" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: "1", b: "2" }]);
  });

  it("中文内容原样保留", () => {
    const r = csvToJson({ csv: "名称,备注\n计算器,「好用」" });
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.value.rows).toEqual([{ 名称: "计算器", 备注: "「好用」" }]);
  });

  it("数字字符串保留为字符串，不自动转数值", () => {
    const r = csvToJson({ csv: "n\n42\n3.14" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const row = r.value.rows[0];
      expect(typeof (row as Record<string, string>).n).toBe("string");
      expect(toPrettyJson(r.value.rows, 0)).toBe('[{"n":"42"},{"n":"3.14"}]');
    }
  });

  it("空字段保留为空字符串", () => {
    const r = csvToJson({ csv: "a,,b\n1,,2" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.rows).toEqual([{ a: "1", "": "", b: "2" }]);
  });

  it("纯空白行被忽略，不参与字段数校验", () => {
    const r = csvToJson({ csv: "a,b\n\n1,2\n" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([{ a: "1", b: "2" }]);
      expect(r.value.count).toBe(1);
    }
  });

  it("末行无换行符与带换行符结果一致", () => {
    const withNl = csvToJson({ csv: "a,b\n1,2\n" });
    const withoutNl = csvToJson({ csv: "a,b\n1,2" });
    expect(withNl.ok).toBe(true);
    expect(withoutNl.ok).toBe(true);
    if (withNl.ok && withoutNl.ok)
      expect(withNl.value.rows).toEqual(withoutNl.value.rows);
  });

  it("toPrettyJson：indent 2/4 缩进层级正确，0 为压缩", () => {
    const rows: Record<string, string>[] = [{ a: "1" }];
    expect(toPrettyJson(rows, 2)).toBe('[\n  {\n    "a": "1"\n  }\n]');
    expect(toPrettyJson(rows, 4)).toBe('[\n    {\n        "a": "1"\n    }\n]');
    expect(toPrettyJson(rows, 0)).toBe('[{"a":"1"}]');
  });
});
