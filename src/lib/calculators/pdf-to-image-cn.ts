// PDF 转图片工具 — 占位引擎
// 原因同 pdf-merge-cn.ts：依赖体积超项目硬门槛，完整功能暂不上线。

export type PdfToImageErrorCode = "NOT_IMPLEMENTED";

export interface PdfToImageError {
  code: PdfToImageErrorCode;
  message: string;
}

export type PdfToImageResult =
  | { ok: true; value: { placeholder: true } }
  | { ok: false; error: PdfToImageError };

export interface PdfToImageInput {
  /** 目标图片格式（仅契约） */
  format: "png" | "jpeg";
  /** 单页输出 DPI（72/96/144/300） */
  dpi: number;
}

/** 占位实现 */
export function pdfToImages(_input: PdfToImageInput): PdfToImageResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
