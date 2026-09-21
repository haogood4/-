// PDF 拆分工具 — 占位引擎
// 原因同 pdf-merge-cn.ts：依赖体积超项目硬门槛（每页 JS ≤8KB），完整功能暂不上线。

export type PdfSplitErrorCode = "NOT_IMPLEMENTED";

export interface PdfSplitError {
  code: PdfSplitErrorCode;
  message: string;
}

export type PdfSplitResult =
  | { ok: true; value: { placeholder: true } }
  | { ok: false; error: PdfSplitError };

export interface PdfSplitInput {
  /** 拆分模式：每 N 页一份 或 按页码列表 */
  mode: "every-n" | "ranges";
  /** 模式相关参数（页码或份数） */
  param: number | number[];
}

/** 占位实现：始终返回 NOT_IMPLEMENTED */
export function splitPdf(_input: PdfSplitInput): PdfSplitResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
