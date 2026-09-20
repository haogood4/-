// P1-7②：明暗主题切换。head 阻塞执行的外部经典脚本（CSP 禁内联），localStorage["theme"] 持久化，
// 未设置 = 跟随系统（不写 data-theme，交给 CSS @media）。详见 AI-IMPROVEMENT-PROMPT.md P1-7②。
(function () {
  "use strict";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      var v = localStorage.getItem("theme");
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null; // 隐私模式不可用 → 跟随系统
    }
  }
  function isDark() {
    var s = stored();
    return s ? s === "dark" : mq.matches;
  }
  function syncButton() {
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", isDark() ? "true" : "false");
  }
  function bind() {
    var btn = document.getElementById("theme-toggle");
    if (btn)
      btn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        try {
          localStorage.setItem("theme", next);
        } catch (e) {}
        root.setAttribute("data-theme", next);
        syncButton();
      });
    syncButton();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bind);
  else bind();
  mq.addEventListener("change", function () {
    if (!stored()) syncButton();
  });
  var initial = stored();
  if (initial) root.setAttribute("data-theme", initial);
})();
