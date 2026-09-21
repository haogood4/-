import { describe, expect, it } from "vitest";
import { formatSql, minifySql, tokenizeSql } from "./sql-format-cn";

describe("minifySql", () => {
  it("空白折叠为单空格并去注释（不改大小写）", () => {
    expect(minifySql("SELECT  a ,  b\n-- 注释\nFROM t /* x */")).toBe(
      "SELECT a,b FROM t",
    );
  });

  it("字符串字面量原样保留（含内部空格）", () => {
    expect(minifySql("select 'a  b' from t")).toBe("select 'a  b' from t");
  });

  it("'' 转义引号保留", () => {
    expect(minifySql("select 'it''s' from t")).toBe("select 'it''s' from t");
  });
});

describe("formatSql / 基础布局", () => {
  it("主子句换行、SELECT 列表逗号换行、WHERE 内 AND 换行", () => {
    expect(formatSql("select a,b from t where x=1 and y=2")).toBe(
      [
        "SELECT",
        "  a,",
        "  b",
        "FROM",
        "  t",
        "WHERE",
        "  x = 1",
        "  AND y = 2",
      ].join("\n"),
    );
  });

  it("关键字大写化但字符串内不大写", () => {
    expect(formatSql("select 'abc' from t")).toBe(
      ["SELECT", "  'abc'", "FROM", "  t"].join("\n"),
    );
  });

  it("JOIN 与 ON 换行", () => {
    expect(formatSql("select * from a left join b on a.id=b.id")).toBe(
      [
        "SELECT",
        "  *",
        "FROM",
        "  a",
        "LEFT JOIN",
        "  b",
        "  ON a.id = b.id",
      ].join("\n"),
    );
  });

  it("括号内子查询断行缩进，别名跟随右括号", () => {
    expect(formatSql("select * from (select id from t) x")).toBe(
      [
        "SELECT",
        "  *",
        "FROM",
        "  (",
        "    SELECT",
        "      id",
        "    FROM",
        "      t",
        "  ) x",
      ].join("\n"),
    );
  });

  it("IN 值列表保持内联", () => {
    const out = formatSql("select a from t where id in (1,2,3)");
    expect(out).toContain("IN (1, 2, 3)");
    expect(out).not.toContain("(1,\n");
  });

  it("自定义缩进单位", () => {
    const out = formatSql("select a from t", "    ");
    expect(out).toContain("\n    a");
  });
});

describe("tokenizeSql", () => {
  it("区分 word/string/punct 并丢弃注释", () => {
    const toks = tokenizeSql("select 'x' -- c\n, 1");
    expect(toks.map((t) => t.kind)).toEqual([
      "word",
      "string",
      "punct",
      "word",
    ]);
  });

  it("识别双字符运算符", () => {
    expect(tokenizeSql("a>=b").map((t) => t.text)).toEqual(["a", ">=", "b"]);
  });
});
