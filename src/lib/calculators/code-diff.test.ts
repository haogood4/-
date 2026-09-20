import { describe, expect, it } from "vitest";
import { diffLines, type DiffRow } from "./code-diff";

/** 校验行号连续性：del/eq 行的 oldLine 依次为 1..n，add/eq 行的 newLine 依次为 1..m */
function expectLineNumbersContinuous(
  rows: DiffRow[],
  leftLines: number,
  rightLines: number,
): void {
  let oldNo = 0;
  let newNo = 0;
  for (const r of rows) {
    if (r.type !== "add") expect(r.oldLine).toBe(++oldNo);
    if (r.type !== "del") expect(r.newLine).toBe(++newNo);
  }
  expect(oldNo).toBe(leftLines);
  expect(newNo).toBe(rightLines);
}

describe("code-diff diffLines", () => {
  it("非字符串输入返回 INVALID_INPUT", () => {
    const r1 = diffLines(123 as unknown as string, "a");
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.error.code).toBe("INVALID_INPUT");
    const r2 = diffLines("a", null as unknown as string);
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.error.code).toBe("INVALID_INPUT");
  });

  it("完全相同：全部 eq，统计 unchanged", () => {
    const r = diffLines("a\nb\nc", "a\nb\nc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.added).toBe(0);
      expect(r.value.deleted).toBe(0);
      expect(r.value.unchanged).toBe(3);
      expect(r.value.rows.every((row) => row.type === "eq")).toBe(true);
      expect(r.value.rows.map((row) => [row.oldLine, row.newLine])).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
    }
  });

  it("全新增：原文为空文件，新文本逐行 add", () => {
    const r = diffLines("", "x\ny\nz");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.added).toBe(3);
      expect(r.value.deleted).toBe(0);
      expect(r.value.unchanged).toBe(0);
      expect(r.value.rows.map((row) => row.type)).toEqual([
        "add",
        "add",
        "add",
      ]);
      expect(r.value.rows.map((row) => row.newLine)).toEqual([1, 2, 3]);
      expect(r.value.rows.every((row) => row.oldLine === null)).toBe(true);
    }
  });

  it("全删除：新文本为空文件，原文逐行 del", () => {
    const r = diffLines("x\ny", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.deleted).toBe(2);
      expect(r.value.added).toBe(0);
      expect(r.value.rows.map((row) => row.type)).toEqual(["del", "del"]);
      expect(r.value.rows.map((row) => row.oldLine)).toEqual([1, 2]);
      expect(r.value.rows.every((row) => row.newLine === null)).toBe(true);
    }
  });

  it("两侧均空：合法输入，rows 为空且统计全 0", () => {
    const r = diffLines("", "");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows).toEqual([]);
      expect(r.value.added).toBe(0);
      expect(r.value.deleted).toBe(0);
      expect(r.value.unchanged).toBe(0);
    }
  });

  it("中间插入：前后 eq 行号连续，插入行为 add", () => {
    const r = diffLines("a\nb\nc", "a\nb\nX\nc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows.map((row) => row.type)).toEqual([
        "eq",
        "eq",
        "add",
        "eq",
      ]);
      expect(r.value.rows[2]).toMatchObject({ newLine: 3, oldLine: null });
      expect(r.value.rows[3]).toMatchObject({ oldLine: 3, newLine: 4 });
      expect(r.value.added).toBe(1);
      expect(r.value.unchanged).toBe(3);
      expectLineNumbersContinuous(r.value.rows, 3, 4);
    }
  });

  it("行替换：del 行先于 add 行，行号正确", () => {
    const r = diffLines("a\nb\nc", "a\nB\nc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows.map((row) => row.type)).toEqual([
        "eq",
        "del",
        "add",
        "eq",
      ]);
      expect(r.value.rows[1]).toMatchObject({ oldLine: 2, newLine: null });
      expect(r.value.rows[2]).toMatchObject({ oldLine: null, newLine: 2 });
      expect(r.value.added).toBe(1);
      expect(r.value.deleted).toBe(1);
      expectLineNumbersContinuous(r.value.rows, 3, 3);
    }
  });

  it("多行替换块：先全部 del 后全部 add", () => {
    const r = diffLines("a\nb\nc\nd", "a\nX\nY\nd");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows.map((row) => row.type)).toEqual([
        "eq",
        "del",
        "del",
        "add",
        "add",
        "eq",
      ]);
      expectLineNumbersContinuous(r.value.rows, 4, 4);
    }
  });

  it("CRLF 换行与 LF 换行内容一致时无差异", () => {
    const r = diffLines("a\r\nb\r\nc", "a\nb\nc");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.unchanged).toBe(3);
      expect(r.value.added).toBe(0);
      expect(r.value.deleted).toBe(0);
    }
  });

  it("空行参与对比：首尾空行按普通行处理", () => {
    const r = diffLines("\na\n", "\nb\n");
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 两侧均为 3 行：["", "a", ""] 与 ["", "b", ""]
      expect(r.value.unchanged).toBe(2);
      expect(r.value.deleted).toBe(1);
      expect(r.value.added).toBe(1);
      expectLineNumbersContinuous(r.value.rows, 3, 3);
    }
  });

  it("单侧超过 5000 行返回 TOO_LARGE", () => {
    const big = Array.from({ length: 5001 }, (_, i) => `l${i}`).join("\n");
    const r = diffLines(big, "a");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_LARGE");
      expect(r.error.message).toBe(
        "文本过长，请缩减后对比（单侧上限 5000 行）",
      );
    }
  });

  it("行数乘积超过 1000000 返回 TOO_LARGE", () => {
    const left = Array.from({ length: 1100 }, (_, i) => `l${i}`).join("\n");
    const right = Array.from({ length: 1000 }, (_, i) => `r${i}`).join("\n");
    const r = diffLines(left, right);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOO_LARGE");
  });

  it("恰好处于上限（5000 行 × 200 行）允许对比", () => {
    const left = Array.from({ length: 5000 }, (_, i) => `l${i}`).join("\n");
    const right = Array.from({ length: 200 }, (_, i) => `l${i}`).join("\n");
    const r = diffLines(left, right);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.unchanged).toBe(200);
      expect(r.value.deleted).toBe(4800);
      expect(r.value.added).toBe(0);
      expectLineNumbersContinuous(r.value.rows, 5000, 200);
    }
  });

  it("行号连续性：混合增删改后 oldLine/newLine 各自严格递增", () => {
    const left = "1\n2\n3\n4\n5\n6";
    const right = "1\nX\n3\n4\n5\nY\n6\nZ";
    const r = diffLines(left, right);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expectLineNumbersContinuous(r.value.rows, 6, 8);
      expect(r.value.added + r.value.unchanged).toBe(8);
      expect(r.value.deleted + r.value.unchanged).toBe(6);
    }
  });

  it("往返一致性：eq+del 文本还原原文，eq+add 文本还原新文本", () => {
    const left = "keep\nold1\nold2\ntail";
    const right = "keep\nnew1\ntail\nextra";
    const r = diffLines(left, right);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const rebuiltLeft = r.value.rows
        .filter((row) => row.type !== "add")
        .map((row) => row.text)
        .join("\n");
      const rebuiltRight = r.value.rows
        .filter((row) => row.type !== "del")
        .map((row) => row.text)
        .join("\n");
      expect(rebuiltLeft).toBe(left);
      expect(rebuiltRight).toBe(right);
    }
  });
});
