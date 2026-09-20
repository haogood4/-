/**
 * menu.js — 移动端汉堡菜单开合逻辑（SiteHeader 的外链脚本）
 *
 * 背景：站点 CSP 为 script-src 'self'，禁止内联脚本。Astro 组件内的 <script>
 * 块会被构建内联为 <script type="module">，生产环境将被 CSP 拦截，故迁移为
 * 本外部普通脚本，由 SiteHeader 以 <script is:inline defer src="/menu.js"> 引入。
 *
 * 实现说明：
 * - 以 IIFE 包裹，避免全局变量泄漏；
 * - 虽以 defer 引入，但为兼容非 defer 场景，事件注册统一延迟到 DOMContentLoaded；
 * - 元素查询全部使用 class / id；任一目标元素缺失时静默退出，不报错。
 */
(function () {
  "use strict";

  /** 初始化：绑定汉堡菜单的全部交互行为 */
  function initMenu() {
    var nav = document.querySelector(".site-nav");
    var toggleBtn = document.querySelector(".nav-toggle");
    var navList = document.getElementById("site-nav-list");

    // 元素缺失（如桌面端未渲染或结构变更）时静默退出
    if (!nav || !toggleBtn || !navList) return;

    /** 当前面板是否处于展开状态 */
    function isOpen() {
      return nav.classList.contains("is-open");
    }

    /** 展开面板：加 .is-open、更新 aria-expanded，并把焦点移到首个菜单链接 */
    function openMenu() {
      nav.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      var firstLink = navList.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    /** 收起面板；restoreFocus=true 时（Esc 关闭）把焦点还给汉堡按钮 */
    function closeMenu(restoreFocus) {
      nav.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      if (restoreFocus) toggleBtn.focus();
    }

    // 点击汉堡按钮：开 / 合切换
    toggleBtn.addEventListener("click", function () {
      if (isOpen()) closeMenu(false);
      else openMenu();
    });

    // Esc：关闭菜单并把焦点归还给汉堡按钮
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) closeMenu(true);
    });

    // 点击菜单区域之外关闭（按钮位于 nav 内部，不会误伤自身的开合点击）
    document.addEventListener("click", function (event) {
      if (isOpen() && !nav.contains(event.target)) closeMenu(false);
    });

    // 点击任一菜单链接后收起面板
    navList.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a") : null;
      if (link) closeMenu(false);
    });

    // 视口放大超过 1024px 桌面断点时，清除移动面板展开状态
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && isOpen()) closeMenu(false);
    });
  }

  // DOM 就绪后再注册（readyState 已 complete 时直接初始化，避免错过事件）
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenu);
  } else {
    initMenu();
  }
})();
