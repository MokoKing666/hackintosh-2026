/* nav.js — 当前页高亮、移动端菜单、滚动渐显 */
(function () {
  "use strict";

  var path = location.pathname.split("/").pop() || "index.html";
  if (path === "") path = "index.html";

  document.querySelectorAll(".nav__link").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop();
    if (href === path) a.setAttribute("aria-current", "page");
  });

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) menu.classList.remove("is-open");
    });
  }

  var targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
})();
