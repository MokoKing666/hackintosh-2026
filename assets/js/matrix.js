/* matrix.js — 资料库三 Tab：筛选、渲染、hash 深链、复制链接 */
(function () {
  "use strict";

  var LEVEL = {
    ok: { text: "开箱可用", cls: "ok" },
    patch: { text: "需补丁", cls: "patch" },
    kext: { text: "需 kext", cls: "patch" },
    exp: { text: "实验", cls: "exp" },
    partial: { text: "部分可用", cls: "partial" },
    none: { text: "无解", cls: "none" },
  };

  var STATUS = {
    active: { text: "活跃", cls: "active" },
    slow: { text: "放缓", cls: "slow" },
    stale: { text: "停滞", cls: "stale" },
    dead: { text: "已死", cls: "dead" },
  };

  var state = {
    tab: "matrix",
    plat: "all",
    level: "all",
    cat: "all",
    status: "all",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badge(level) {
    var m = LEVEL[level] || LEVEL.none;
    return '<span class="badge badge--' + m.cls + '">' + m.text + "</span>";
  }

  function statusCell(s) {
    var m = STATUS[s] || STATUS.slow;
    return '<span class="status status--' + m.cls + '">' + m.text + "</span>";
  }

  function fmtStars(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }

  /* ---------------- 渲染 ---------------- */

  function renderMatrix() {
    var rows = window.HW.matrix.filter(function (r) {
      return (
        (state.plat === "all" || r.plat === state.plat) &&
        (state.level === "all" || r.level === state.level)
      );
    });
    var tbody = document.getElementById("body-matrix");
    tbody.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          "<td><strong>" + esc(r.hw) + "</strong></td>" +
          "<td>" + esc(r.type) + "</td>" +
          "<td>" + esc(r.plat) + "</td>" +
          "<td>" + badge(r.level) + "</td>" +
          '<td class="mono">' + esc(r.os) + "</td>" +
          "<td>" + esc(r.note) + "</td>" +
          "</tr>"
        );
      })
      .join("");
    document.getElementById("count-matrix").textContent =
      rows.length + " / " + window.HW.matrix.length + " 条";
    document.getElementById("empty-matrix").hidden = rows.length > 0;
  }

  function renderProjects() {
    var rows = window.PROJECTS.list.filter(function (r) {
      return (
        (state.cat === "all" || r.cat === state.cat) &&
        (state.status === "all" || r.status === state.status)
      );
    });
    var tbody = document.getElementById("body-projects");
    tbody.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          "<td><strong>" + esc(r.name) + "</strong></td>" +
          '<td class="mono">' + esc(r.repo) + "</td>" +
          '<td class="num">' + fmtStars(r.stars) + "</td>" +
          '<td class="num">' + esc(r.updated) + "</td>" +
          "<td>" + statusCell(r.status) + "</td>" +
          "<td>" + esc(r.desc) + "</td>" +
          "</tr>"
        );
      })
      .join("");
    document.getElementById("count-projects").textContent =
      rows.length + " / " + window.PROJECTS.list.length + " 个";
    document.getElementById("empty-projects").hidden = rows.length > 0;
  }

  function renderDead() {
    var tbody = document.getElementById("body-dead");
    tbody.innerHTML = window.PROJECTS.dead
      .map(function (r) {
        return (
          "<tr>" +
          "<td><strong>" + esc(r.name) + "</strong></td>" +
          '<td class="mono">' + esc(r.repo) + "</td>" +
          '<td class="num">' + fmtStars(r.stars) + "</td>" +
          '<td class="num">' + esc(r.updated) + "</td>" +
          "<td>" + esc(r.why) + "</td>" +
          "</tr>"
        );
      })
      .join("");

    document.getElementById("corrections").innerHTML = window.PROJECTS.corrections
      .map(function (c) {
        return (
          '<div><div class="wrong">' + esc(c.wrong) + '</div>' +
          '<div class="right">' + esc(c.right) + "</div></div>"
        );
      })
      .join("");
  }

  /* ---------------- Tab ---------------- */

  var TAB_IDS = ["matrix", "projects", "dead"];

  function setTab(name, push) {
    if (TAB_IDS.indexOf(name) === -1) name = "matrix";
    state.tab = name;
    TAB_IDS.forEach(function (t) {
      var panel = document.getElementById("tab-" + t);
      var btn = document.getElementById("tab-btn-" + t);
      var on = t === name;
      if (panel) panel.hidden = !on;
      if (btn) btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (push !== false) syncHash(true);
  }

  /* ---------------- 筛选 ---------------- */

  function bindChips(group) {
    var wrap = document.querySelector('[data-filter="' + group + '"]');
    if (!wrap) return;
    wrap.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      wrap.querySelectorAll(".chip").forEach(function (c) {
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });
      state[group] = chip.dataset.value;
      if (group === "plat" || group === "level") renderMatrix();
      if (group === "cat" || group === "status") renderProjects();
      syncHash(true);
    });
  }

  /* ---------------- hash ---------------- */

  function syncHash(replace) {
    var parts = ["tab=" + state.tab];
    if (state.tab === "matrix") {
      if (state.plat !== "all") parts.push("plat=" + encodeURIComponent(state.plat));
      if (state.level !== "all") parts.push("level=" + state.level);
    }
    if (state.tab === "projects") {
      if (state.cat !== "all") parts.push("cat=" + encodeURIComponent(state.cat));
      if (state.status !== "all") parts.push("status=" + state.status);
    }
    var hash = "#" + parts.join("&");
    if (replace) {
      history.replaceState(null, "", hash);
    } else {
      location.hash = hash;
    }
  }

  function readHash() {
    var raw = location.hash.replace(/^#/, "");
    if (!raw) return;
    raw.split("&").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i < 0) return;
      var k = kv.slice(0, i);
      var v = decodeURIComponent(kv.slice(i + 1));
      if (k in state) state[k] = v;
    });
    if (TAB_IDS.indexOf(state.tab) === -1) state.tab = "matrix";
  }

  function applyChipState(group) {
    var wrap = document.querySelector('[data-filter="' + group + '"]');
    if (!wrap) return;
    var val = state[group];
    var found = false;
    wrap.querySelectorAll(".chip").forEach(function (c) {
      var on = c.dataset.value === val;
      if (on) found = true;
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (!found) {
      state[group] = "all";
      wrap.querySelector('.chip[data-value="all"]').setAttribute("aria-pressed", "true");
    }
  }

  /* ---------------- 复制链接 ---------------- */

  function copyLink(btn) {
    var url = location.href;
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "已复制";
      setTimeout(function () {
        btn.textContent = old;
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  /* ---------------- 初始化 ---------------- */

  function init() {
    if (!window.HW || !window.PROJECTS) return;

    readHash();

    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTab(btn.id.replace("tab-btn-", ""));
      });
    });

    ["plat", "level", "cat", "status"].forEach(function (g) {
      bindChips(g);
      applyChipState(g);
    });

    renderMatrix();
    renderProjects();
    renderDead();
    setTab(state.tab, false);

    var cm = document.getElementById("copy-matrix");
    var cp = document.getElementById("copy-projects");
    if (cm) cm.addEventListener("click", function () { copyLink(cm); });
    if (cp) cp.addEventListener("click", function () { copyLink(cp); });

    window.addEventListener("hashchange", function () {
      readHash();
      ["plat", "level", "cat", "status"].forEach(applyChipState);
      renderMatrix();
      renderProjects();
      setTab(state.tab, false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
