import { describe, expect, it } from "vitest";
import { bytesToHex, md5Hex, sha1Hex, sha256Hex } from "./hash-cn";

describe("md5Hex / 标准向量", () => {
  it("RFC 1321 经典向量 hello world", () => {
    expect(md5Hex("hello world")).toBe("5eb63bbbe01eeed093cb22bb8f5acdc3");
  });

  it("空字符串向量 d41d8cd9…", () => {
    expect(md5Hex("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("abc 向量", () => {
    expect(md5Hex("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  });

  it("The quick brown fox jumps over the lazy dog 向量", () => {
    expect(md5Hex("The quick brown fox jumps over the lazy dog")).toBe(
      "9e107d9d372bb6826bd81d3542a419d6",
    );
  });

  it("中文 UTF-8 口径（与 node crypto 对齐）", () => {
    expect(md5Hex("你好世界")).toBe("65396ee4aad0b4f17aacd1c6112ee364");
  });
});

describe("md5Bytes / 填充边界", () => {
  it("56 字节输入（需双块填充）", () => {
    expect(md5Hex("a".repeat(56))).toBe("3b0c8ac703f828b04c6c197006d17218");
  });

  it("55 字节输入（单块填充上限）", () => {
    expect(md5Hex("a".repeat(55))).toBe("ef1772b6dff9a122358552954ad0df65");
  });

  it("1000 字节长输入（长度字段跨块正确）", () => {
    expect(md5Hex("b".repeat(1000))).toBe("c73c16de8912c313c06ac38b9961e806");
  });
});

describe("sha1Hex / sha256Hex（crypto.subtle 异步）", () => {
  it("SHA-1 hello world 标准向量（node crypto 口径）", async () => {
    await expect(sha1Hex("hello world")).resolves.toBe(
      "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed",
    );
  });

  it("SHA-1 空字符串向量", async () => {
    await expect(sha1Hex("")).resolves.toBe(
      "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    );
  });

  it("SHA-256 hello world 标准向量", async () => {
    await expect(sha256Hex("hello world")).resolves.toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("SHA-256 空字符串向量", async () => {
    await expect(sha256Hex("")).resolves.toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("中文输入 SHA-256 输出 64 位十六进制", async () => {
    await expect(sha256Hex("你好世界")).resolves.toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("bytesToHex", () => {
  it("空数组返回空串", () => {
    expect(bytesToHex(new Uint8Array(0))).toBe("");
  });

  it("0x0a 0xff 输出补零大写转小写十六进制", () => {
    expect(bytesToHex(new Uint8Array([0x0a, 0xff]))).toBe("0aff");
  });
});
