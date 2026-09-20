// P1-7②：明暗主题切换。head 阻塞执行的外部经典脚本（CSP 禁内联），localStorage["theme"] 持久化。
// 默认 = 亮色（未设置时显式写 data-theme="light"，不再跟随系统）。
// 用户手动切到 dark 后 localStorage 持久化为 "dark"，未来访问保持暗色。
// 详见 AI-IMPROVEMENT-PROMPT.md P1-7②。
(function () {
  "use strict";
  var root = document.documentElement;

  function stored() {
    try {
      var v = localStorage.getItem("theme");
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }
  function effective() {
    // 默认亮色；仅在用户显式设 dark 时为暗
    return stored() === "dark" ? "dark" : "light";
  }
  function syncButton() {
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.setAttribute("aria-pressed", effective() === "dark" ? "true" : "false");
  }
  function apply(value) {
    root.setAttribute("data-theme", value);
    try {
      localStorage.setItem("theme", value);
    } catch (e) {}
    syncButton();
  }
  // 阻塞阶段立即设置：未存值 → 显式锁 light（替代旧版跟随系统，避免新用户首访随机态）
  root.setAttribute("data-theme", effective());

  function bind() {
    var btn = document.getElementById("theme-toggle");
    if (btn)
      btn.addEventListener("click", function () {
        apply(effective() === "dark" ? "light" : "dark");
      });
    syncButton();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
