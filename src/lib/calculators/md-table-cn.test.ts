import { describe, expect, it } from "vitest";
import {
  toMarkdownTable,
  MAX_TABLE_LINES,
  MAX_TABLE_COLS,
} from "./md-table-cn";
import type { MdTableInput, MdTableResult } from "./md-table-cn";

function run(
  text: string,
  opts?: Partial<Omit<MdTableInput, "text">>,
): MdTableResult {
  return toMarkdownTable({
    text,
    delimiter: opts?.delimiter ?? "auto",
    hasHeader: opts?.hasHeader ?? true,
    align: opts?.align ?? "left",
  });
}

function okValue(r: MdTableResult) {
  if (!r.ok) throw new Error(`期望成功，实际报错：${r.error.message}`);
  return r.value;
}

describe("md-table-cn / 显式分隔符", () => {
  it("Tab 分隔：表头 + 对齐行 + 数据行", () => {
    const v = okValue(run("名称\t数量\n苹果\t3", { delimiter: "tab" }));
    expect(v.output).toBe("| 名称 | 数量 |\n| :--- | :--- |\n| 苹果 | 3 |");
    expect(v.rows).toBe(1);
    expect(v.cols).toBe(2);
    expect(v.delimiter).toBe("tab");
  });

  it("逗号分隔：普通字段", () => {
    const v = okValue(run("name,city\nAlice,Beijing", { delimiter: "comma" }));
    expect(v.output).toBe(
      "| name | city |\n| :--- | :--- |\n| Alice | Beijing |",
    );
    expect(v.cols).toBe(2);
  });

  it("逗号分隔：引号包裹字段内的逗号不分列，引号剥离", () => {
    const v = okValue(run('"a,b",c', { delimiter: "comma" }));
    expect(v.output).toBe("| a,b | c |\n| :--- | :--- |");
    expect(v.cols).toBe(2);
    expect(v.rows).toBe(0);
  });

  it("竖线分隔：已有管道包裹的表格重建，不产生空列", () => {
    const v = okValue(run("| a | b |\n| 1 | 2 |", { delimiter: "pipe" }));
    expect(v.output).toBe("| a | b |\n| :--- | :--- |\n| 1 | 2 |");
    expect(v.cols).toBe(2);
  });

  it("竖线分隔：输入含 \\| 转义时字面竖线保留", () => {
    const v = okValue(run("| a \\| b | c |\n| 1 | 2 |", { delimiter: "pipe" }));
    expect(v.output).toBe("| a \\| b | c |\n| :--- | :--- |\n| 1 | 2 |");
    expect(v.cols).toBe(2);
  });
});

describe("md-table-cn / auto 检测", () => {
  it("auto 检出 Tab", () => {
    const v = okValue(run("a\tb\nc\td"));
    expect(v.delimiter).toBe("tab");
    expect(v.output).toBe("| a | b |\n| :--- | :--- |\n| c | d |");
  });

  it("auto 检出逗号", () => {
    const v = okValue(run("a,b\nc,d"));
    expect(v.delimiter).toBe("comma");
    expect(v.cols).toBe(2);
  });

  it("auto 检出竖线", () => {
    const v = okValue(run("| a | b |\n| c | d |"));
    expect(v.delimiter).toBe("pipe");
    expect(v.cols).toBe(2);
  });

  it("auto 逗号计数引号感知：引号内逗号不计入", () => {
    const v = okValue(run('"a,b",c\n"d,e",f'));
    expect(v.delimiter).toBe("comma");
    expect(v.output).toBe("| a,b | c |\n| :--- | :--- |\n| d,e | f |");
  });

  it("auto 无任何分隔符：按单列竖线处理", () => {
    const v = okValue(run("only-one-cell\nanother"));
    expect(v.delimiter).toBe("pipe");
    expect(v.cols).toBe(1);
    expect(v.output).toBe("| only-one-cell |\n| :--- |\n| another |");
  });
});

describe("md-table-cn / 表头与对齐", () => {
  it("无表头：生成空表头行，所有行都是数据", () => {
    const v = okValue(
      run("a\tb\nc\td", { delimiter: "tab", hasHeader: false }),
    );
    expect(v.output).toBe("|  |  |\n| :--- | :--- |\n| a | b |\n| c | d |");
    expect(v.rows).toBe(2);
  });

  it("对齐 left → :---", () => {
    const v = okValue(run("a\tb", { delimiter: "tab", align: "left" }));
    expect(v.output).toBe("| a | b |\n| :--- | :--- |");
  });

  it("对齐 center → :---:", () => {
    const v = okValue(run("a\tb", { delimiter: "tab", align: "center" }));
    expect(v.output).toBe("| a | b |\n| :---: | :---: |");
  });

  it("对齐 right → ---:", () => {
    const v = okValue(run("a\tb", { delimiter: "tab", align: "right" }));
    expect(v.output).toBe("| a | b |\n| ---: | ---: |");
  });
});

describe("md-table-cn / 转义与单元格", () => {
  it("单元格内容含竖线时转义为 \\|", () => {
    const v = okValue(run("a|b\tc", { delimiter: "tab" }));
    expect(v.output).toBe("| a\\|b | c |\n| :--- | :--- |");
    expect(v.cols).toBe(2);
  });

  it("空单元格保留为空列", () => {
    const v = okValue(run("a\t\tb", { delimiter: "tab" }));
    expect(v.cols).toBe(3);
    expect(v.output).toBe("| a |  | b |\n| :--- | :--- | :--- |");
  });

  it("中文内容按字符数计列，不做显示宽度补齐", () => {
    const v = okValue(
      run("项目\t说明\n表格生成\t按字符数计列数", { delimiter: "tab" }),
    );
    expect(v.cols).toBe(2);
    expect(v.output).toBe(
      "| 项目 | 说明 |\n| :--- | :--- |\n| 表格生成 | 按字符数计列数 |",
    );
    for (const line of v.output.split("\n")) {
      expect(line.startsWith("| ")).toBe(true);
      expect(line.endsWith(" |")).toBe(true);
    }
  });
});

describe("md-table-cn / 校验与边界", () => {
  it("列数不齐报 FIELD_COUNT_MISMATCH 且含行号", () => {
    const r = run("a\tb\nc\td\ne", { delimiter: "tab" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("FIELD_COUNT_MISMATCH");
      expect(r.error.message).toContain("第 3 行");
      expect(r.error.message).toContain("1 列");
      expect(r.error.message).toContain("2 列");
    }
  });

  it("列数不齐报错按原始行号计（跳过空白行后仍报真实行号）", () => {
    const r = run("a\tb\n\nc\td\ne", { delimiter: "tab" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("第 4 行");
  });

  it("空输入与纯空白输入报 EMPTY", () => {
    for (const text of ["", "  \n\n"]) {
      const r = run(text);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("EMPTY");
    }
  });

  it("单行输入：表头 + 对齐行，0 数据行", () => {
    const v = okValue(run("only", { delimiter: "tab" }));
    expect(v.output).toBe("| only |\n| :--- |");
    expect(v.rows).toBe(0);
    expect(v.cols).toBe(1);
  });

  it("末尾换行与 CRLF 兼容，输出末尾无多余空行", () => {
    const v = okValue(run("a,b\r\nc,d\r\n", { delimiter: "comma" }));
    expect(v.output).toBe("| a | b |\n| :--- | :--- |\n| c | d |");
    expect(v.output.endsWith("\n")).toBe(false);
  });

  it(`恰好 ${MAX_TABLE_LINES} 行通过，超出报 TOO_LARGE`, () => {
    const at = Array<string>(MAX_TABLE_LINES).fill("a\tb").join("\n");
    const v = okValue(run(at, { delimiter: "tab" }));
    expect(v.rows).toBe(MAX_TABLE_LINES - 1);
    const over = Array<string>(MAX_TABLE_LINES + 1)
      .fill("a\tb")
      .join("\n");
    const r = run(over, { delimiter: "tab" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LARGE");
  });

  it(`恰好 ${MAX_TABLE_COLS} 列通过，超出报 TOO_LARGE`, () => {
    const at = Array<string>(MAX_TABLE_COLS).fill("x").join("\t");
    expect(okValue(run(at, { delimiter: "tab" })).cols).toBe(MAX_TABLE_COLS);
    const over = Array<string>(MAX_TABLE_COLS + 1)
      .fill("x")
      .join("\t");
    const r = run(over, { delimiter: "tab" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LARGE");
  });

  it("非字符串输入返回 INVALID_INPUT 且不抛异常", () => {
    const r = toMarkdownTable({
      text: null as unknown as string,
      delimiter: "auto",
      hasHeader: true,
      align: "left",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
