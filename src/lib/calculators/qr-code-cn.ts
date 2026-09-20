// 二维码生成器引擎 —— 纯函数，无 DOM 依赖
// 算法移植自真机扫码验证过的单文件实现（TABLE/TOTAL/ALIGN/FMT 数据表逐字保留），
// 改写为现代 TS 模块级函数；源文件 throw Error 处改为返回错误联合类型。
//
// 已知限制（继承自源算法）：
// - Q 等级 + 第 4 版及以上，个别扫码 App 识别不稳定；页面默认推荐 L 等级。
// - 仅支持字节模式（UTF-8）与第 1~10 版；超出容量返回 TOO_LONG。
//
// 相对源文件的两处修正（源实现偏离 ISO/IEC 18004，已按规范修正）：
// 1. 暗模块：源 makeMatrix 预留左下格式副本时把 (4v+9, 8) 暗模块清零且无人回填，
//    现仅预留 7 行副本位，暗模块恒为 1。
// 2. 版本信息区（v≥7）：源在 placeData 之后才由 drawVersion 覆盖该区域，
//    导致落在其中的数据位丢失、v≥7 解码失败；现于放置数据前预留该区域（同格式区做法）。

export type QrLevel = "L" | "M" | "Q" | "H";

export interface QrCodeValue {
  /** 模块矩阵：1=黑，0=白 */
  grid: number[][];
  /** 边长（模块数） */
  size: number;
  /** 二维码版本（1~10） */
  version: number;
  /** 选用的掩码编号（0~7） */
  mask: number;
}

export type QrErrorCode = "EMPTY" | "TOO_LONG" | "INTERNAL";

export type QrCodeResult =
  | { ok: true; value: QrCodeValue }
  | {
      ok: false;
      error: { code: QrErrorCode; message: string };
    };

interface LevelSpec {
  /** 每块纠错码字数 */
  ecc: number;
  /** [块数, 每块数据码字数][] */
  blocks: readonly (readonly [number, number])[];
}

/** @internal 版本×纠错等级容量表（逐字移植） */
export const TABLE: Record<number, Record<QrLevel, LevelSpec>> = {
  1: {
    L: { ecc: 7, blocks: [[1, 19]] },
    M: { ecc: 10, blocks: [[1, 16]] },
    Q: { ecc: 13, blocks: [[1, 13]] },
    H: { ecc: 17, blocks: [[1, 9]] },
  },
  2: {
    L: { ecc: 10, blocks: [[1, 34]] },
    M: { ecc: 16, blocks: [[1, 28]] },
    Q: { ecc: 22, blocks: [[1, 22]] },
    H: { ecc: 28, blocks: [[1, 16]] },
  },
  3: {
    L: { ecc: 15, blocks: [[1, 55]] },
    M: { ecc: 26, blocks: [[1, 44]] },
    Q: { ecc: 18, blocks: [[2, 17]] },
    H: { ecc: 22, blocks: [[2, 13]] },
  },
  4: {
    L: { ecc: 20, blocks: [[1, 80]] },
    M: { ecc: 18, blocks: [[2, 32]] },
    Q: { ecc: 26, blocks: [[2, 24]] },
    H: { ecc: 16, blocks: [[4, 9]] },
  },
  5: {
    L: { ecc: 26, blocks: [[1, 108]] },
    M: { ecc: 24, blocks: [[2, 43]] },
    Q: {
      ecc: 18,
      blocks: [
        [2, 15],
        [2, 16],
      ],
    },
    H: {
      ecc: 22,
      blocks: [
        [2, 11],
        [2, 12],
      ],
    },
  },
  6: {
    L: { ecc: 18, blocks: [[2, 68]] },
    M: { ecc: 16, blocks: [[4, 27]] },
    Q: { ecc: 24, blocks: [[4, 19]] },
    H: {
      ecc: 28,
      blocks: [
        [4, 15],
        [4, 16],
      ],
    },
  },
  7: {
    L: { ecc: 20, blocks: [[2, 78]] },
    M: { ecc: 18, blocks: [[4, 31]] },
    Q: {
      ecc: 18,
      blocks: [
        [2, 14],
        [4, 15],
      ],
    },
    H: {
      ecc: 26,
      blocks: [
        [4, 13],
        [1, 14],
      ],
    },
  },
  8: {
    L: { ecc: 24, blocks: [[2, 97]] },
    M: {
      ecc: 22,
      blocks: [
        [2, 38],
        [2, 39],
      ],
    },
    Q: {
      ecc: 22,
      blocks: [
        [4, 18],
        [2, 19],
      ],
    },
    H: {
      ecc: 26,
      blocks: [
        [4, 14],
        [2, 15],
      ],
    },
  },
  9: {
    L: { ecc: 30, blocks: [[2, 116]] },
    M: {
      ecc: 22,
      blocks: [
        [3, 36],
        [2, 37],
      ],
    },
    Q: {
      ecc: 20,
      blocks: [
        [4, 16],
        [4, 17],
      ],
    },
    H: {
      ecc: 24,
      blocks: [
        [4, 12],
        [4, 13],
      ],
    },
  },
  10: {
    L: {
      ecc: 18,
      blocks: [
        [2, 68],
        [2, 69],
      ],
    },
    M: {
      ecc: 26,
      blocks: [
        [4, 43],
        [1, 44],
      ],
    },
    Q: {
      ecc: 24,
      blocks: [
        [6, 19],
        [2, 20],
      ],
    },
    H: {
      ecc: 28,
      blocks: [
        [6, 15],
        [2, 16],
      ],
    },
  },
};

/** @internal 各版本码字总数（逐字移植） */
export const TOTAL: Record<number, number> = {
  1: 26,
  2: 44,
  3: 70,
  4: 100,
  5: 134,
  6: 172,
  7: 196,
  8: 242,
  9: 292,
  10: 346,
};

/** 各版本校正图形中心坐标（逐字移植） */
const ALIGN: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

/** 15 位格式信息位串（等级×掩码，逐字移植） */
const FMT: Record<QrLevel, string[]> = {
  L: [
    "111011111000100",
    "111001011110011",
    "111110110101010",
    "111100010011101",
    "110011000101111",
    "110001100011000",
    "110110001000001",
    "110100101110110",
  ],
  M: [
    "101010000010010",
    "101000100100101",
    "101111001111100",
    "101101101001011",
    "100010111111001",
    "100000011001110",
    "100111110010111",
    "100101010100000",
  ],
  Q: [
    "011010101011111",
    "011000001101000",
    "011111100110001",
    "011101000000110",
    "010010010110100",
    "010000110000011",
    "010111011011010",
    "010101111101101",
  ],
  H: [
    "001011010001001",
    "001001110111110",
    "001110011100111",
    "001100111010000",
    "000011101100010",
    "000001001010101",
    "000110100001100",
    "000100000111011",
  ],
};

// GF(256) 对数/指数表（本原多项式 0x11D）
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}

function gmul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

/** Reed-Solomon 生成多项式（deg 次） */
function rsGen(deg: number): number[] {
  let g = [1];
  for (let i = 0; i < deg; i++) {
    const ng = new Array<number>(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= gmul(g[j], EXP[i]);
      ng[j + 1] ^= g[j];
    }
    g = ng;
  }
  return g;
}

/** 计算 deg 个纠错码字 */
function rsEncode(data: number[], deg: number): number[] {
  const gr = rsGen(deg).slice().reverse();
  const res = new Array<number>(deg).fill(0);
  for (let i = 0; i < data.length; i++) {
    const f = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (f !== 0) {
      for (let j = 0; j < deg; j++) res[j] ^= gmul(gr[j + 1], f);
    }
  }
  return res;
}

function utf8Bytes(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

function dataCodewords(v: number, level: QrLevel): number {
  let dcw = 0;
  for (const [count, len] of TABLE[v][level].blocks) dcw += count * len;
  return dcw;
}

/** 该版本/等级下字节模式最大载荷（字节数） */
function maxBytes(v: number, level: QrLevel): number {
  const countBits = v < 10 ? 8 : 16;
  return Math.floor((dataCodewords(v, level) * 8 - 4 - countBits) / 8);
}

/** 字节模式比特流 → 补位后的数据码字序列 */
function encodeData(bytes: number[], v: number, level: QrLevel): number[] {
  const dcw = dataCodewords(v, level);
  const bits: number[] = [];
  const push = (val: number, len: number): void => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  push(4, 4); // 字节模式指示符 0100
  push(bytes.length, v < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const cap = dcw * 8;
  push(0, Math.min(4, cap - bits.length)); // 结束符
  while (bits.length % 8 !== 0) bits.push(0); // 补齐到字节
  const cw: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    cw.push(b);
  }
  const pads = [0xec, 0x11]; // 交替填充码字
  let pi = 0;
  while (cw.length < dcw) cw.push(pads[pi++ % 2]);
  return cw;
}

/** 分块 + RS 纠错 + 数据/纠错码字交织 */
function interleave(dataCw: number[], v: number, level: QrLevel): number[] {
  const info = TABLE[v][level];
  const blocks: number[][] = [];
  let idx = 0;
  for (const [count, len] of info.blocks) {
    for (let b = 0; b < count; b++) {
      blocks.push(dataCw.slice(idx, idx + len));
      idx += len;
    }
  }
  const eccBlocks = blocks.map((blk) => rsEncode(blk, info.ecc));
  const out: number[] = [];
  let maxLen = 0;
  for (const b of blocks) maxLen = Math.max(maxLen, b.length);
  for (let i = 0; i < maxLen; i++)
    for (const b of blocks) if (i < b.length) out.push(b[i]);
  maxLen = 0;
  for (const b of eccBlocks) maxLen = Math.max(maxLen, b.length);
  for (let i = 0; i < maxLen; i++)
    for (const b of eccBlocks) if (i < b.length) out.push(b[i]);
  return out;
}

interface Matrix {
  grid: number[][];
  /** true = 功能模块（不参与数据放置与掩码） */
  func: boolean[][];
  size: number;
}

/** @internal 构建功能图形矩阵（单测反向提取数据位时需要同一 func 掩码） */
export function makeMatrix(v: number): Matrix {
  const size = 17 + 4 * v;
  const grid: number[][] = [];
  const func: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    grid.push(new Array<number>(size).fill(0));
    func.push(new Array<boolean>(size).fill(false));
  }
  const setF = (r: number, c: number, val: number): void => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      grid[r][c] = val;
      func[r][c] = true;
    }
  };
  const finder = (r: number, c: number): void => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inF = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const dark =
          inF &&
          (dr === 0 ||
            dr === 6 ||
            dc === 0 ||
            dc === 6 ||
            (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        setF(rr, cc, dark ? 1 : 0);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  const pos = ALIGN[v];
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const r = pos[i];
      const c = pos[j];
      if (func[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setF(r + dr, c + dc, dark ? 1 : 0);
        }
      }
    }
  }
  // 时序图形
  for (let i = 8; i < size - 8; i++) {
    if (!func[6][i]) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      func[6][i] = true;
    }
    if (!func[i][6]) {
      grid[i][6] = i % 2 === 0 ? 1 : 0;
      func[i][6] = true;
    }
  }
  setF(4 * v + 9, 8, 1); // 暗模块
  // 预留左上格式信息 15 位
  const fmtPos: [number, number][] = [];
  for (let i = 0; i <= 5; i++) fmtPos.push([8, i]);
  fmtPos.push([8, 7], [8, 8], [7, 8]);
  for (let i = 5; i >= 0; i--) fmtPos.push([i, 8]);
  for (const [r, c] of fmtPos) setF(r, c, 0);
  // 预留格式信息副本：左下 7 位（修正：源多清 1 行会抹掉暗模块）+ 右上 8 位
  for (let i = 0; i < 7; i++) setF(size - 1 - i, 8, 0);
  for (let i = 0; i < 8; i++) setF(8, size - 1 - i, 0);
  // 修正：v≥7 先预留版本信息区，drawVersion 再回填（源在 placeData 后才画，覆盖数据位）
  if (v >= 7) {
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setF(b, a, 0);
      setF(a, b, 0);
    }
  }
  return { grid, func, size };
}

/** 写入 15 位格式信息及其两处副本 */
function drawFormat(m: Matrix, level: QrLevel, mask: number): void {
  const s = FMT[level][mask];
  const size = m.size;
  const p1: [number, number][] = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const b = s[i] === "1" ? 1 : 0;
    m.grid[p1[i][0]][p1[i][1]] = b;
    m.func[p1[i][0]][p1[i][1]] = true;
  }
  for (let i = 0; i < 7; i++) {
    m.grid[size - 1 - i][8] = s[i] === "1" ? 1 : 0;
    m.func[size - 1 - i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    m.grid[8][size - 1 - i] = s[7 + i] === "1" ? 1 : 0;
    m.func[8][size - 1 - i] = true;
  }
}

/** 版本信息 18 位 BCH(6,18) 编码 */
function versionBits(v: number): number {
  let rem = v;
  for (let i = 0; i < 12; i++)
    rem = (rem << 1) ^ ((rem >>> 11) & 1 ? 0x1f25 : 0);
  return ((v << 12) | rem) >>> 0;
}

function drawVersion(m: Matrix, v: number): void {
  if (v < 7) return;
  const bits = versionBits(v);
  const size = m.size;
  for (let i = 0; i < 18; i++) {
    const bit = (bits >>> i) & 1;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    m.grid[b][a] = bit;
    m.func[b][a] = true;
    m.grid[a][b] = bit;
    m.func[a][b] = true;
  }
}

/** 按蛇形顺序（右下起，两列一组，跳过 col 6）放置数据位 */
function placeData(m: Matrix, codewords: number[]): void {
  const size = m.size;
  const bits: number[] = [];
  for (let i = 0; i < codewords.length; i++)
    for (let j = 7; j >= 0; j--) bits.push((codewords[i] >>> j) & 1);
  let inc = -1;
  let row = size - 1;
  let idx = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (;;) {
      for (let c2 = 0; c2 < 2; c2++) {
        const cc = col - c2;
        if (!m.func[row][cc]) {
          m.grid[row][cc] = idx < bits.length ? bits[idx] : 0;
          idx++;
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
}

/** @internal 8 种掩码规则（单测撤销掩码时需要） */
export const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/** 掩码惩罚分（四项规则） */
function penalty(g: number[][], size: number): number {
  let p = 0;
  let run: number;
  // 规则 1：行列同色连段
  for (let r = 0; r < size; r++) {
    run = 1;
    for (let c = 1; c < size; c++) {
      if (g[r][c] === g[r][c - 1]) {
        run++;
        if (c === size - 1 && run >= 5) p += 3 + (run - 5);
      } else {
        if (run >= 5) p += 3 + (run - 5);
        run = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    run = 1;
    for (let r = 1; r < size; r++) {
      if (g[r][c] === g[r - 1][c]) {
        run++;
        if (r === size - 1 && run >= 5) p += 3 + (run - 5);
      } else {
        if (run >= 5) p += 3 + (run - 5);
        run = 1;
      }
    }
  }
  // 规则 2：2×2 同色块
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const val = g[r][c];
      if (g[r][c + 1] === val && g[r + 1][c] === val && g[r + 1][c + 1] === val)
        p += 3;
    }
  }
  // 规则 3：类定位图形 1:1:3:1:1 + 4 空白
  for (let r = 0; r < size; r++) {
    for (let c = 0; c + 6 < size; c++) {
      if (
        g[r][c] === 1 &&
        g[r][c + 1] === 0 &&
        g[r][c + 2] === 1 &&
        g[r][c + 3] === 1 &&
        g[r][c + 4] === 1 &&
        g[r][c + 5] === 0 &&
        g[r][c + 6] === 1
      ) {
        if (
          (c + 10 < size &&
            g[r][c + 7] === 0 &&
            g[r][c + 8] === 0 &&
            g[r][c + 9] === 0 &&
            g[r][c + 10] === 0) ||
          (c - 4 >= 0 &&
            g[r][c - 1] === 0 &&
            g[r][c - 2] === 0 &&
            g[r][c - 3] === 0 &&
            g[r][c - 4] === 0)
        )
          p += 40;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r + 6 < size; r++) {
      if (
        g[r][c] === 1 &&
        g[r + 1][c] === 0 &&
        g[r + 2][c] === 1 &&
        g[r + 3][c] === 1 &&
        g[r + 4][c] === 1 &&
        g[r + 5][c] === 0 &&
        g[r + 6][c] === 1
      ) {
        if (
          (r + 10 < size &&
            g[r + 7][c] === 0 &&
            g[r + 8][c] === 0 &&
            g[r + 9][c] === 0 &&
            g[r + 10][c] === 0) ||
          (r - 4 >= 0 &&
            g[r - 1][c] === 0 &&
            g[r - 2][c] === 0 &&
            g[r - 3][c] === 0 &&
            g[r - 4][c] === 0)
        )
          p += 40;
      }
    }
  }
  // 规则 4：黑白比例偏离 50%
  let dark = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (g[r][c] === 1) dark++;
  p += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return p;
}

/**
 * 生成二维码（字节模式 UTF-8，自动选最小版本与最优掩码）。
 *
 * 已知限制：Q 等级 + 第 4 版及以上个别扫码器识别不稳定，默认建议 L 等级。
 */
export function generateQrCode(input: {
  text: string;
  level: QrLevel;
}): QrCodeResult {
  const text = input.text.trim();
  if (text === "") {
    return { ok: false, error: { code: "EMPTY", message: "请输入内容" } };
  }
  const bytes = utf8Bytes(text);
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    if (bytes.length <= maxBytes(v, input.level)) {
      version = v;
      break;
    }
  }
  if (version === 0) {
    return {
      ok: false,
      error: {
        code: "TOO_LONG",
        message: `内容过长（最多约 ${maxBytes(10, input.level)} 个英文字符，中文约占3个字符）`,
      },
    };
  }
  const codewords = interleave(
    encodeData(bytes, version, input.level),
    version,
    input.level,
  );
  if (codewords.length !== TOTAL[version]) {
    return {
      ok: false,
      error: { code: "INTERNAL", message: "内部错误：码字总数不符，请重试" },
    };
  }
  let best:
    { grid: number[][]; size: number; mask: number; pen: number } | undefined;
  for (let mask = 0; mask < 8; mask++) {
    const m = makeMatrix(version);
    placeData(m, codewords);
    for (let r = 0; r < m.size; r++) {
      for (let c = 0; c < m.size; c++) {
        if (!m.func[r][c] && MASKS[mask](r, c)) m.grid[r][c] ^= 1;
      }
    }
    drawFormat(m, input.level, mask);
    drawVersion(m, version);
    const pen = penalty(m.grid, m.size);
    if (best === undefined || pen < best.pen) {
      best = { grid: m.grid, size: m.size, mask, pen };
    }
  }
  if (best === undefined) {
    return {
      ok: false,
      error: { code: "INTERNAL", message: "内部错误：掩码选择失败，请重试" },
    };
  }
  return {
    ok: true,
    value: { grid: best.grid, size: best.size, version, mask: best.mask },
  };
}
