// 哈希生成器引擎 —— MD5 为手写纯 JS 同步实现（RFC 1321 公开算法，无第三方依赖）；
// SHA-1/SHA-256 走浏览器原生 crypto.subtle（异步）。输入一律先经 TextEncoder 转
// UTF-8 字节，保证中英文结果与规范向量一致。MD5 仅用于文件校验、缓存键等非安全
// 场景（早已可碰撞），页面 FAQ 已注明。
const HEX = "0123456789abcdef";

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += HEX[b >> 4] + HEX[b & 0xf];
  return out;
}

// ---------- MD5（同步，RFC 1321） ----------
// 每轮移位表与常量表逐字对应标准伪代码
const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
];

// K[i] = floor(2^32 × |sin(i+1)|)，模块加载期一次性生成（与标准一致）
const MD5_K = (() => {
  const k = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
  }
  return k;
})();

/** @internal 对字节序列做 MD5（消息长度 < 512MB，页面场景足够） */
export function md5Bytes(bytes: Uint8Array): string {
  const len = bytes.length;
  // 填充：追加 0x80 与若干 0，使 (len+1+8) 向上取整到 64 字节块；末 8 字节为小端位长
  const total = ((len + 72) >> 6) << 6;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  const bitLenLo = (len << 3) >>> 0;
  const bitLenHi = Math.floor((len * 8) / 4294967296);
  dv.setUint32(total - 8, bitLenLo, true);
  dv.setUint32(total - 4, bitLenHi, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const m = new Uint32Array(16);

  for (let off = 0; off < total; off += 64) {
    for (let j = 0; j < 16; j++) m[j] = dv.getUint32(off + j * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let j = 0; j < 64; j++) {
      let f: number;
      let g: number;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }
      const tmp = (f + a + MD5_K[j] + m[g]) >>> 0;
      const s = MD5_S[j];
      a = d;
      d = c;
      c = b;
      b = (b + ((tmp << s) | (tmp >>> (32 - s)))) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }
  // 摘要按小端字节序输出
  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true);
  odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true);
  odv.setUint32(12, d0, true);
  return bytesToHex(out);
}

/** 文本 MD5（UTF-8 口径） */
export function md5Hex(text: string): string {
  return md5Bytes(new TextEncoder().encode(text));
}

// ---------- SHA-1 / SHA-256（crypto.subtle，异步） ----------
async function digestHex(
  algo: "SHA-1" | "SHA-256",
  text: string,
): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, data);
  return bytesToHex(new Uint8Array(digest));
}

export function sha1Hex(text: string): Promise<string> {
  return digestHex("SHA-1", text);
}

export function sha256Hex(text: string): Promise<string> {
  return digestHex("SHA-256", text);
}
