// PDF 压缩工具 — 占位引擎
// 原因同 pdf-merge-cn.ts：依赖体积超项目硬门槛，完整功能暂不上线。

export type PdfCompressErrorCode = "NOT_IMPLEMENTED";

export interface PdfCompressError {
  code: PdfCompressErrorCode;
  message: string;
}

export type PdfCompressResult =
  | { ok: true; value: { placeholder: true } }
  | { ok: false; error: PdfCompressError };

export interface PdfCompressInput {
  /** 压缩档位：low/medium/high（仅契约） */
  level: "low" | "medium" | "high";
}

/** 占位实现 */
export function compressPdf(_input: PdfCompressInput): PdfCompressResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
