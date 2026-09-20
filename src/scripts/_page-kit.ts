// src/scripts/_page-kit.ts — 计算器页面交互共享 kit
// 背景：9 个 public/scripts 页面脚本（受 Astro 7 内联 bug workaround 外置，见
// scripts/build-public-scripts.mjs）此前各自复制约 120 行样板（requireEl/状态机/
// 剪贴板/分享），esm+splitting 构建将其提取为单一共享 chunk，消除 9 份拷贝。
// 注意：本文件被全部 51 个页面脚本 import（含首页/搜索页），改动影响全站交互。

import {
  resolveTool,
  recordRecent,
  toggleFav,
  isFav,
  browserStore,
} from "../lib/tool-store";

export type ResultState = "empty" | "computed" | "stale";

/** 取元素，缺失即抛错（构建期页面结构错误应尽早暴露） */
export function requireEl<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`页面缺少元素：${selector}`);
  return el;
}

export function setFieldError(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  err: HTMLParagraphElement,
  message: string,
): void {
  err.textContent = message;
  err.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

export function clearFieldError(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  err: HTMLParagraphElement,
): void {
  err.textContent = "";
  err.hidden = true;
  input.removeAttribute("aria-invalid");
}

export interface ResultElements {
  resultEmpty: HTMLElement;
  resultContent: HTMLElement;
  staleHint: HTMLElement;
  /** B 方言页面提供 #result 容器，stale 时加 aria-disabled */
  resultBox?: HTMLElement;
  /** 仅 computed 状态可用的按钮（复制/分享） */
  buttons: HTMLButtonElement[];
}

/** 结果区状态机：empty/computed/stale 三态切换 */
export function createResultState(els: ResultElements): {
  setState: (next: ResultState) => void;
  goStaleIfComputed: () => void;
} {
  let state: ResultState = "empty";
  function setState(next: ResultState): void {
    state = next;
    els.resultEmpty.hidden = next !== "empty";
    els.resultContent.hidden = next === "empty";
    els.staleHint.hidden = next !== "stale";
    if (els.resultBox) {
      if (next === "stale") {
        els.resultBox.setAttribute("aria-disabled", "true");
      } else {
        els.resultBox.removeAttribute("aria-disabled");
      }
    }
    for (const b of els.buttons) b.disabled = next !== "computed";
  }
  function goStaleIfComputed(): void {
    if (state === "computed") setState("stale");
  }
  return { setState, goStaleIfComputed };
}

/** 剪贴板复制：secure context 走 Async API，否则 execCommand 兜底 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // ignore
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.className = "clipboard-helper";
  helper.setAttribute("readonly", "");
  document.body.appendChild(helper);
  helper.select();
  try {
    helper.setSelectionRange(0, text.length);
  } catch {
    // ignore
  }
  let ok: boolean;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(helper);
  return ok;
}

export function flashButton(btn: HTMLButtonElement, text: string): void {
  const original = btn.textContent ?? "";
  btn.textContent = text;
  window.setTimeout(() => {
    btn.textContent = original;
  }, 2000);
}

export function toolUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

/** 绑定复制按钮：点击复制 getText() 文本并闪烁反馈 */
export function bindCopyButton(
  btn: HTMLButtonElement,
  getText: () => string,
): void {
  btn.addEventListener("click", () => {
    void copyText(getText()).then((ok) => {
      flashButton(btn, ok ? "已复制" : "复制失败");
    });
  });
}

// ---------- P2-10：最近使用记录 + 收藏按钮（kit 加载即自动生效） ----------

/**
 * 计算器页自动初始化：记录最近使用、在 h1 后注入收藏按钮。
 * 非工具路径（首页/搜索页等也 import 本 kit）直接跳过。
 */
export function initToolTracking(
  doc: Document = document,
  path: string = window.location.pathname,
): void {
  const tool = resolveTool(path);
  if (!tool) return;
  const store = browserStore();
  recordRecent(store, path);
  const h1 = doc.querySelector("main h1") ?? doc.querySelector("h1");
  if (!h1 || !h1.parentNode) return;
  const btn = doc.createElement("button");
  btn.type = "button";
  btn.className = "fav-btn";
  const sync = (): void => {
    const f = isFav(store, tool.h);
    btn.textContent = f ? "★ 已收藏" : "☆ 收藏本工具";
    btn.setAttribute("aria-pressed", String(f));
  };
  btn.addEventListener("click", () => {
    toggleFav(store, tool.h, tool.l);
    sync();
  });
  h1.insertAdjacentElement("afterend", btn);
  sync();
}

initToolTracking();

/** 绑定分享按钮：Web Share API，失败/不支持时复制链接 */
export function bindShareButton(btn: HTMLButtonElement): void {
  btn.addEventListener("click", () => {
    const url = toolUrl();
    if (typeof navigator.share === "function") {
      navigator
        .share({ title: document.title, url })
        .then(() => undefined)
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          void copyText(url).then((ok) => {
            flashButton(btn, ok ? "链接已复制" : "复制失败");
          });
        });
      return;
    }
    void copyText(url).then((ok) => {
      flashButton(btn, ok ? "链接已复制" : "复制失败");
    });
  });
}
