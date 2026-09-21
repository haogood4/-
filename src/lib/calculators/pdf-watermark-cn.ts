// PDF 加水印工具 — 占位引擎
// 原因同 pdf-merge-cn.ts：依赖体积超项目硬门槛，完整功能暂不上线。

export type PdfWatermarkErrorCode = "NOT_IMPLEMENTED";

export interface PdfWatermarkError {
  code: PdfWatermarkErrorCode;
  message: string;
}

export type PdfWatermarkResult =
  | { ok: true; value: { placeholder: true } }
  | { ok: false; error: PdfWatermarkError };

export interface PdfWatermarkInput {
  /** 水印文字 */
  text: string;
  /** 不透明度 0–1（仅契约） */
  opacity: number;
}

/** 占位实现 */
export function watermarkPdf(_input: PdfWatermarkInput): PdfWatermarkResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
