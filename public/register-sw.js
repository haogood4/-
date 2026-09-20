// Service Worker 注册（外部文件，兼容 CSP script-src 'self'）
// 仅在安全上下文（HTTPS / localhost）注册
if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(function () {
        /* 注册失败不影响功能，静默降级 */
      });
  });
}
