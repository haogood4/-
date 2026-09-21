// PDF 合并工具 — 占位引擎
// 原因：PDF 解析/合并需 pdf-lib（≥300KB minified）或 pdf.js（≥1MB），静态站点若
// 内联进页面 JS 体积会爆表，与项目每页 JS ≤8KB 硬约束架构性冲突；走 CDN 又违反
// 「禁止外部库」硬门槛。因此完整功能暂不实现，仅暴露接口契约供 UI 提示未来行为。
// 页面侧 src/scripts/pdf-merge-cn-page.ts 拿到 { ok: false, NOT_IMPLEMENTED } 后展示
// 「完整功能即将上线」+ 未来接口说明。

export type PdfMergeErrorCode = "NOT_IMPLEMENTED";

export interface PdfMergeError {
  code: PdfMergeErrorCode;
  message: string;
}

export type PdfMergeResult =
  | { ok: true; value: { /** 暂无可用字段（占位保留） */ placeholder: true } }
  | { ok: false; error: PdfMergeError };

/** 合并参数契约（仅声明，未实际生效；与未来真实现保持一致） */
export interface PdfMergeInput {
  /** 待合并 PDF 数量（≥2） */
  count: number;
  /** 输出文件名（不含扩展名） */
  outputName: string;
}

/**
 * 占位实现：始终返回 NOT_IMPLEMENTED。
 * 备注：原始 PDF 文件流不会经过本函数（页面脚本也只在调用入口做参数收集）。
 */
export function mergePdfs(_input: PdfMergeInput): PdfMergeResult {
  return {
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "PDF 处理依赖体积过大，完整功能暂未上线",
    },
  };
}
