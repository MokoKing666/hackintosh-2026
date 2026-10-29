/* builder.js — 配置生成器：下拉联动、调用规则引擎、渲染结论、hash 分享 */
(function () {
  "use strict";

  var el = {};
  var state = {
    platform: "intel",
    cpu: "i5-10400",
    gpu: "rx6600",
    wifi: "bcm94360",
    audio: "simplehda",
    os: "26.7",
  };

  var OS_LIST = [
    { id: "26.7", label: "macOS 26.7 Tahoe（x86 上限）" },
    { id: "26", label: "macOS 26 Tahoe" },
    { id: "15", label: "macOS 15 Sequoia" },
    { id: "14", label: "macOS 14 Sonoma" },
    { id: "27", label: "macOS 27 Golden Gate（仅 ARM）" },
  ];

  var OS_ARM = [
    { id: "27", label: "macOS 27 Golden Gate（当前高度）" },
    { id: "26.7", label: "macOS 26.7 Tahoe" },
    { id: "26", label: "macOS 26 Tahoe" },
    { id: "15", label: "macOS 15 Sequoia" },
  ];

  var SHORT = { ok: "可行", patch: "需补丁", exp: "实验性", none: "不可行" };

  // 下拉里显示短名，避免长型号被截断
  function shortName(s) {
    return String(s).replace(/\s*[（(].*$/, "");
  }

  function opt(v, t) {
    return '<option value="' + v + '">' + t + "</option>";
  }

  function cpusFor(platform) {
    if (platform === "arm") return window.HW.arm;
    return window.HW.cpus.filter(function (c) {
      return c.vendor === platform;
    });
  }

  function fillCpu() {
    var list = cpusFor(state.platform);
    var isArm = state.platform === "arm";
    el.cpu.innerHTML = list
      .map(function (c) {
        return opt(c.id, isArm ? c.name : shortName(c.name));
      })
      .join("");
    if (!list.some(function (c) { return c.id === state.cpu; })) {
      state.cpu = list[0].id;
    }
    el.cpu.value = state.cpu;
  }

  function fillOs() {
    var list = state.platform === "arm" ? OS_ARM : OS_LIST;
    el.os.innerHTML = list
      .map(function (o) {
        return opt(o.id, o.label);
      })
      .join("");
    if (!list.some(function (o) { return o.id === state.os; })) {
      state.os = state.platform === "arm" ? "27" : "26.7";
    }
    el.os.value = state.os;
  }

  function fillGpu() {
    el.gpu.innerHTML = window.HW.gpus
      .map(function (g) {
        return opt(g.id, shortName(g.name));
      })
      .join("");
    el.gpu.value = state.gpu;
  }

  function fillStatic() {
    el.wifi.innerHTML = window.HW.wifi
      .map(function (w) { return opt(w.id, shortName(w.name)); })
      .join("");
    el.audio.innerHTML = window.HW.audio
      .map(function (a) { return opt(a.id, shortName(a.name)); })
      .join("");
  }

  function syncArmUi() {
    var isArm = state.platform === "arm";
    el.gpuField.hidden = isArm;
    el.cpuLabel.textContent = isArm ? "ARM 设备 / 平台" : "CPU";
  }

  function render() {
    var res = window.RULES.solve(state);

    el.verdict.className = "verdict";
    el.verdictBadge.className = "badge badge--" + res.verdict.level;
    el.verdictBadge.textContent = SHORT[res.verdict.level] || res.verdict.label;
    el.verdictTitle.textContent = res.verdict.label;
    el.verdictSub.textContent = res.verdict.note;
    el.osCap.textContent = res.osCap;

    el.countMust.textContent = res.mustTotal + " 项";
    el.countRisk.textContent = res.riskTotal + " 项";
    el.countBlock.textContent = res.blockTotal + " 项";

    el.listMust.innerHTML = res.must
      .map(function (i) {
        return "<li><span>" + i.text + "<em>" + i.ev + "</em></span></li>";
      })
      .join("");
    el.listRisk.innerHTML = res.risk
      .map(function (i) {
        return "<li><span>" + i.text + "<em>" + i.ev + "</em></span></li>";
      })
      .join("");
    el.listBlock.innerHTML = res.blocked
      .map(function (i) {
        return "<li><span>" + i.text + "<em>" + i.ev + "</em></span></li>";
      })
      .join("");

    el.blockCard.hidden = res.blockTotal === 0;
    el.mustCard.hidden = res.mustTotal === 0;
    el.riskCard.hidden = res.riskTotal === 0;

    syncHash();
  }

  function syncHash() {
    var parts = [
      "platform=" + state.platform,
      "cpu=" + state.cpu,
      "gpu=" + state.gpu,
      "wifi=" + state.wifi,
      "audio=" + state.audio,
      "os=" + state.os,
    ];
    history.replaceState(null, "", "#" + parts.join("&"));
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
    if (["intel", "amd", "arm"].indexOf(state.platform) === -1) state.platform = "intel";
  }

  function copySummary() {
    var res = window.RULES.solve(state);
    var lines = [];
    lines.push("【黑苹果配置评估】" + res.verdict.label);
    lines.push("系统上限：" + res.osCap);
    lines.push("");
    if (res.blocked.length) {
      lines.push("阻断项：");
      res.blocked.forEach(function (i) { lines.push("  × " + i.text); });
      lines.push("");
    }
    if (res.must.length) {
      lines.push("必做清单：");
      res.must.forEach(function (i) { lines.push("  · " + i.text); });
      lines.push("");
    }
    if (res.risk.length) {
      lines.push("风险：");
      res.risk.forEach(function (i) { lines.push("  ! " + i.text); });
    }
    var text = lines.join("\n");
    var btn = el.copyBtn;
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "已复制";
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  function bind() {
    el.platform.addEventListener("change", function () {
      state.platform = el.platform.value;
      fillCpu();
      fillOs();
      syncArmUi();
      render();
    });
    el.cpu.addEventListener("change", function () {
      state.cpu = el.cpu.value;
      render();
    });
    el.gpu.addEventListener("change", function () {
      state.gpu = el.gpu.value;
      render();
    });
    el.wifi.addEventListener("change", function () {
      state.wifi = el.wifi.value;
      render();
    });
    el.audio.addEventListener("change", function () {
      state.audio = el.audio.value;
      render();
    });
    el.os.addEventListener("change", function () {
      state.os = el.os.value;
      render();
    });
    el.copyBtn.addEventListener("click", copySummary);
    el.resetBtn.addEventListener("click", function () {
      state = {
        platform: "intel",
        cpu: "i5-10400",
        gpu: "rx6600",
        wifi: "bcm94360",
        audio: "simplehda",
        os: "26.7",
      };
      el.platform.value = "intel";
      fillCpu();
      fillGpu();
      fillOs();
      el.wifi.value = state.wifi;
      el.audio.value = state.audio;
      syncArmUi();
      render();
    });
  }

  function init() {
    el.platform = document.getElementById("f-platform");
    el.cpu = document.getElementById("f-cpu");
    el.cpuLabel = document.getElementById("l-cpu");
    el.gpu = document.getElementById("f-gpu");
    el.gpuField = document.getElementById("field-gpu");
    el.wifi = document.getElementById("f-wifi");
    el.audio = document.getElementById("f-audio");
    el.os = document.getElementById("f-os");

    el.verdict = document.getElementById("verdict");
    el.verdictBadge = document.getElementById("verdict-badge");
    el.verdictTitle = document.getElementById("verdict-title");
    el.verdictSub = document.getElementById("verdict-sub");
    el.osCap = document.getElementById("os-cap");

    el.listMust = document.getElementById("list-must");
    el.listRisk = document.getElementById("list-risk");
    el.listBlock = document.getElementById("list-block");
    el.countMust = document.getElementById("count-must");
    el.countRisk = document.getElementById("count-risk");
    el.countBlock = document.getElementById("count-block");
    el.mustCard = document.getElementById("card-must");
    el.riskCard = document.getElementById("card-risk");
    el.blockCard = document.getElementById("card-block");

    el.copyBtn = document.getElementById("btn-copy");
    el.resetBtn = document.getElementById("btn-reset");

    if (!window.HW || !window.RULES) return;

    readHash();
    el.platform.value = state.platform;
    fillStatic();
    fillCpu();
    fillGpu();
    fillOs();
    el.wifi.value = state.wifi;
    el.audio.value = state.audio;
    syncArmUi();
    bind();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
