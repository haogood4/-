// PDF 提取文字工具 — 占位引擎
// 原因同 pdf-merge-cn.ts：依赖体积超项目硬门槛，完整功能暂不上线。

export type PdfExtractTextErrorCode = "NOT_IMPLEMENTED";

export interface PdfExtractTextError {
  code: PdfExtractTextErrorCode;
  message: string;
}

export type PdfExtractTextResult =
  | { ok: true; value: { placeholder: true } }
  | { ok: false; error: PdfExtractTextError };

export interface PdfExtractTextInput {
  /** 是否按页拆分输出（仅契约） */
  perPage: boolean;
}

/** 占位实现 */
export function extractPdfText(
  _input: PdfExtractTextInput,
): PdfExtractTextResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
