import { describe, expect, it } from "vitest";
import {
  generateQrCode,
  makeMatrix,
  MASKS,
  TABLE,
  TOTAL,
  type QrLevel,
} from "./qr-code-cn";

/**
 * 往返解码：从最终 grid 反向提取数据位（按 placeData 蛇形顺序、跳过功能模块、
 * 撤销掩码 XOR），重组码字 → 去交织 → 解析字节模式（mode 0100 + 长度 + 载荷）
 * → TextDecoder 还原字符串。无外部解码库下的端到端验证。
 */
function decodeQr(
  grid: number[][],
  version: number,
  level: QrLevel,
  mask: number,
): string {
  const m = makeMatrix(version); // 与编码时同一 func 掩码
  const size = m.size;
  expect(size).toBe(grid.length);

  // 1) 蛇形顺序提取数据位并撤销掩码
  const bits: number[] = [];
  let inc = -1;
  let row = size - 1;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (;;) {
      for (let c2 = 0; c2 < 2; c2++) {
        const cc = col - c2;
        if (!m.func[row][cc]) {
          const bit = grid[row][cc];
          bits.push(MASKS[mask](row, cc) ? bit ^ 1 : bit);
        }
      }
      row += inc;
      if (row < 0 || row >= size) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }
  // 第 2~6 版含 7 个余位模块（蛇形遍历末尾，编码时补 0），仅取前 TOTAL×8 位
  const remainder = version >= 2 && version <= 6 ? 7 : 0;
  expect(bits.length).toBe(TOTAL[version] * 8 + remainder);
  const dataBits = bits.slice(0, TOTAL[version] * 8);

  // 2) 位 → 码字
  const codewords: number[] = [];
  for (let i = 0; i + 8 <= dataBits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | dataBits[i + j];
    codewords.push(b);
  }

  // 3) 去交织：前 dcw 个码字按数据块轮询顺序还原（与 interleave 的交织顺序互逆）
  const spec = TABLE[version][level];
  const lens: number[] = [];
  for (const [count, len] of spec.blocks)
    for (let i = 0; i < count; i++) lens.push(len);
  const blocks: number[][] = lens.map(() => []);
  let idx = 0;
  const maxLen = Math.max(...lens);
  for (let i = 0; i < maxLen; i++) {
    for (let b = 0; b < blocks.length; b++) {
      if (i < lens[b]) blocks[b].push(codewords[idx++]);
    }
  }
  const data: number[] = [];
  for (const blk of blocks) for (const cw of blk) data.push(cw);

  // 4) 解析字节模式：mode(4bit)=0100 + 长度(v<10 为 8bit，否则 16bit) + 载荷
  const dbits: number[] = [];
  for (const cw of data)
    for (let j = 7; j >= 0; j--) dbits.push((cw >>> j) & 1);
  let mode = 0;
  for (let i = 0; i < 4; i++) mode = (mode << 1) | dbits[i];
  expect(mode).toBe(4);
  const countBits = version < 10 ? 8 : 16;
  let len = 0;
  for (let i = 4; i < 4 + countBits; i++) len = (len << 1) | dbits[i];
  const payload = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | dbits[4 + countBits + i * 8 + j];
    payload[i] = b;
  }
  return new TextDecoder().decode(payload);
}

function expectRoundTrip(text: string, level: QrLevel = "L"): void {
  const r = generateQrCode({ text, level });
  expect(r.ok).toBe(true);
  if (!r.ok) return;
  expect(decodeQr(r.value.grid, r.value.version, level, r.value.mask)).toBe(
    text.trim(),
  );
}

describe("generateQrCode / 往返解码", () => {
  it("短英文文本 encode→decode 还原", () => {
    expectRoundTrip("hello world");
  });

  it("中文内容「你好世界」往返成功", () => {
    expectRoundTrip("你好世界");
  });

  it("URL 内容往返成功", () => {
    expectRoundTrip("https://example.com/tools/qr-code");
  });

  it("250 字符长内容（第 10 版，含版本信息区）往返成功", () => {
    expectRoundTrip("a".repeat(120) + "b".repeat(130));
  });

  it("M 等级多分块（第 5 版）往返成功", () => {
    expectRoundTrip("x".repeat(80), "M");
  });
});

/** 断言生成成功并取出 value（失败直接抛错，让相关用例明确失败） */
function mustOk(text: string, level: QrLevel = "L") {
  const r = generateQrCode({ text, level });
  if (!r.ok) throw new Error(`生成失败：${r.error.code} ${r.error.message}`);
  return r.value;
}

describe("generateQrCode / 结构不变量", () => {
  const { grid, size, version } = mustOk("https://example.com");

  it("size === 17 + 4 × version", () => {
    expect(size).toBe(17 + 4 * version);
    expect(grid.length).toBe(size);
    for (const row of grid) expect(row.length).toBe(size);
  });

  it("三个定位图形角点为 1", () => {
    expect(grid[0][0]).toBe(1);
    expect(grid[0][size - 1]).toBe(1);
    expect(grid[size - 1][0]).toBe(1);
  });

  it("timing 行（第 6 行）在数据区交替", () => {
    for (let i = 8; i < size - 8; i++) {
      expect(grid[6][i]).toBe(i % 2 === 0 ? 1 : 0);
    }
  });

  it("暗模块 grid[size-8][8] === 1", () => {
    expect(grid[size - 8][8]).toBe(1);
  });
});

describe("generateQrCode / 容量边界", () => {
  it("L 级 271 字节（第 10 版上限）成功", () => {
    const r = generateQrCode({ text: "a".repeat(271), level: "L" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.version).toBe(10);
  });

  it("L 级 272 字节返回 TOO_LONG 且提示容量", () => {
    const r = generateQrCode({ text: "a".repeat(272), level: "L" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("TOO_LONG");
      expect(r.error.message).toContain("271");
    }
  });
});

describe("generateQrCode / 纠错等级", () => {
  it("L/M/Q/H 短文本均成功", () => {
    for (const level of ["L", "M", "Q", "H"] as QrLevel[]) {
      const r = generateQrCode({ text: "hi", level });
      expect(r.ok).toBe(true);
    }
  });
});

describe("generateQrCode / 错误处理", () => {
  it("空文本 → EMPTY", () => {
    const r = generateQrCode({ text: "", level: "L" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });

  it("纯空白文本 → EMPTY", () => {
    const r = generateQrCode({ text: "   \n\t ", level: "L" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("EMPTY");
  });
});
