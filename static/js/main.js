/* OpenVTON-Bench project page: tables, charts and small interactions. All numbers come from the paper. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ data */
  const MODELS = ["OOTD", "UNO", "EasyControl", "FLUX.1-Kontext-dev", "FLUX.2-dev", "NanobananaPro", "Qwen-Editor", "HuiWa", "YingHui"];
  // per model: [VLM, Human] for bg, id, tex, shape, real, avg
  const SEM = {
    "OOTD":               [[4.074, 4.608], [3.685, 3.832], [3.278, 3.217], [3.898, 3.697], [3.794, 3.595], [3.746, 3.790]],
    "UNO":                [[4.167, 3.220], [3.749, 2.308], [3.577, 2.364], [4.141, 2.907], [4.067, 3.913], [3.940, 2.942]],
    "EasyControl":        [[4.273, 4.459], [3.824, 3.496], [3.506, 3.163], [4.105, 3.824], [4.055, 3.900], [3.953, 3.768]],
    "FLUX.1-Kontext-dev": [[4.428, 4.406], [3.957, 3.535], [3.574, 3.122], [4.158, 3.768], [4.137, 4.060], [4.051, 3.778]],
    "FLUX.2-dev":         [[4.593, 4.734], [4.226, 4.460], [4.007, 3.914], [4.446, 4.494], [4.409, 4.582], [4.336, 4.437]],
    "NanobananaPro":      [[4.610, 4.722], [4.253, 4.689], [4.019, 4.225], [4.457, 4.646], [4.418, 4.694], [4.351, 4.595]],
    "Qwen-Editor":        [[4.617, 4.729], [4.270, 4.606], [4.046, 4.132], [4.472, 4.590], [4.431, 4.666], [4.367, 4.545]],
    "HuiWa":              [[4.611, 4.682], [4.256, 4.538], [4.050, 4.018], [4.465, 4.546], [4.424, 4.664], [4.361, 4.490]],
    "YingHui":            [[4.624, 4.735], [4.277, 4.685], [4.050, 4.252], [4.473, 4.675], [4.437, 4.693], [4.372, 4.608]],
  };
  // S_global, S_rep^(0..3), mean S_rep, S-bar
  const REP = {
    "OOTD": [0.844, 0.797, 0.755, 0.701, 0.669, 0.731, 0.788], "UNO": [0.737, 0.763, 0.730, 0.674, 0.628, 0.699, 0.718],
    "EasyControl": [0.854, 0.830, 0.807, 0.765, 0.729, 0.783, 0.818], "FLUX.1-Kontext-dev": [0.849, 0.813, 0.778, 0.731, 0.694, 0.754, 0.802],
    "FLUX.2-dev": [0.928, 0.886, 0.863, 0.823, 0.793, 0.841, 0.885], "NanobananaPro": [0.936, 0.894, 0.865, 0.827, 0.807, 0.848, 0.892],
    "Qwen-Editor": [0.936, 0.903, 0.876, 0.840, 0.819, 0.859, 0.898], "HuiWa": [0.933, 0.882, 0.859, 0.821, 0.793, 0.839, 0.886],
    "YingHui": [0.936, 0.904, 0.882, 0.847, 0.823, 0.864, 0.900],
  };
  // PSNR, SSIM, LPIPS, FID
  const PIX = {
    "OOTD": [16.534, 0.794, 0.255, 55.216], "UNO": [12.096, 0.726, 0.417, 110.534], "EasyControl": [15.731, 0.779, 0.277, 39.079],
    "FLUX.1-Kontext-dev": [15.389, 0.747, 0.280, 36.555], "FLUX.2-dev": [22.884, 0.873, 0.117, 12.562],
    "NanobananaPro": [24.681, 0.890, 0.089, 7.989], "Qwen-Editor": [26.343, 0.905, 0.082, 13.037],
    "HuiWa": [23.045, 0.875, 0.100, 8.619], "YingHui": [22.593, 0.870, 0.101, 7.372],
  };
  const CORR = [
    { n: "Representation \\(\\bar S\\)", sub: "ours", k: .833, s: .933, p: .701, ours: 1, col: "var(--accent)" },
    { n: "VLM judge \\(s_{avg}\\)", sub: "ours", k: .722, s: .850, p: .828, ours: 1, col: "var(--accent-2)" },
    { n: "−FID", k: .722, s: .867, p: .588 }, { n: "−LPIPS", k: .667, s: .833, p: .782 },
    { n: "PSNR", k: .611, s: .767, p: .819 }, { n: "SSIM", k: .611, s: .767, p: .801 },
  ];
  const DATASETS = [ // name, year, pairs, resolution text, open, megapixels (or range)
    ["VITON", 2018, 16253, "256 × 192", true, 256 * 192 / 1e6],
    ["VITON-HD", 2021, 13679, "1024 × 768", true, 1024 * 768 / 1e6],
    ["DressCode", 2022, 53792, "1024 × 768", true, 1024 * 768 / 1e6],
    ["SHHQ", 2022, 231176, "1024 × 768", true, 1024 * 768 / 1e6],
    ["StreetTryOn", 2024, 14453, "512 × 320", true, 512 * 320 / 1e6],
    ["LH-400K", 2024, 409270, "512 × 512", true, 512 * 512 / 1e6],
    ["VTBench", 2025, 2933, "–", false, null],
    ["VTONQA", 2026, 8132, "256² – 4096²", false, [256 * 256 / 1e6, 4096 * 4096 / 1e6]],
    ["OpenVTON-Bench (ours)", 2026, 99925, "1024² – 1536²", true, [1024 * 1024 / 1e6, 1536 * 1536 / 1e6]],
  ];
  const QCOLS = [["person", "Person (masked)", "in"], ["garment", "Garment", "in g"], null, ["ootd", "OOTD"], ["uno", "UNO"],
    ["easycontrol", "Easy<wbr>Control"], ["flux1", "FLUX.1-<wbr>Kontext-<wbr>dev"], ["flux2", "FLUX.2-<wbr>dev"], ["nanobanana", "Nanobanana<wbr>Pro"],
    ["qwen", "Qwen-<wbr>Editor"], ["huiwa", "HuiWa"], ["yinghui", "YingHui"]];
  const N_EXAMPLES = 12;

  const $ = s => document.querySelector(s);
  const fmt = (v, d = 3) => v.toFixed(d);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // rank helper: returns "b1" for best, "b2" for second-best distinct value
  function ranker(values, higherIsBetter = true) {
    const uniq = [...new Set(values)].sort((a, b) => higherIsBetter ? b - a : a - b);
    return v => (v === uniq[0] ? "b1" : v === uniq[1] ? "b2" : "");
  }

  /* ------------------------------------------------------------ explorer */
  function explorer() {
    const picks = $("#picks"), grid = $("#qgrid");
    if (!picks || !grid) return;
    const pad = e => String(e).padStart(2, "0");
    for (let e = 0; e < N_EXAMPLES; e++) {
      const b = document.createElement("button");
      b.className = "pick"; b.type = "button"; b.setAttribute("aria-pressed", e === 0);
      b.setAttribute("aria-label", "Example " + (e + 1));
      b.innerHTML = `<img src="static/img/qual/ex${pad(e)}_garment.webp" alt="" loading="lazy">`;
      b.addEventListener("click", () => show(e));
      picks.appendChild(b);
    }
    function show(e) {
      [...picks.children].forEach((b, i) => b.setAttribute("aria-pressed", i === e));
      grid.innerHTML = QCOLS.map(c => c === null ? `<div class="sep"></div>` :
        `<div class="qcell ${c[2] || ""}"><div class="im"><img src="static/img/qual/ex${pad(e)}_${c[0]}.webp" alt="${c[1].replace(/<wbr>/g, "")}"></div><span>${c[1]}</span></div>`).join("");
    }
    show(0);
  }

  /* -------------------------------------------------------------- tables */
  function tables() {
    // dataset comparison
    $("#tab-datasets").innerHTML = `<thead><tr><th>Dataset</th><th>Year</th><th>Pairs</th><th>Resolution</th><th>Open</th></tr></thead><tbody>` +
      DATASETS.map(d => `<tr class="${d[0].includes("ours") ? "ours" : ""}"><td>${d[0]}</td><td>${d[1]}</td><td>${d[2].toLocaleString("en-US")}</td><td>${d[3]}</td><td>${d[4] ? "✓" : "✗"}</td></tr>`).join("") + `</tbody>`;

    // semantic (VLM + human)
    const dims = ["\\(s_{bg}\\)", "\\(s_{id}\\)", "\\(s_{tex}\\)", "\\(s_{shape}\\)", "\\(s_{real}\\)", "\\(s_{avg}\\)"];
    const rk = [];
    for (let d = 0; d < 6; d++) for (let h = 0; h < 2; h++) rk.push(ranker(MODELS.map(m => SEM[m][d][h])));
    $("#tab-vlm").innerHTML = `<thead><tr class="grp"><th rowspan="2">Method</th>${dims.map(d => `<th colspan="2">${d}</th>`).join("")}</tr>
      <tr>${dims.map(() => `<th>VLM</th><th>Human</th>`).join("")}</tr></thead><tbody>` +
      MODELS.map(m => `<tr><td>${m}</td>${SEM[m].map((pair, d) => pair.map((v, h) => `<td class="${h ? "hum " : ""}${rk[d * 2 + h](v)}">${fmt(v)}</td>`).join("")).join("")}</tr>`).join("") + `</tbody>`;

    // representation
    const rc = [0, 1, 2, 3, 4, 5, 6].map(i => ranker(MODELS.map(m => REP[m][i])));
    $("#tab-rep").innerHTML = `<thead><tr><th>Method</th><th>\\(S_{\\text{global}}\\)</th><th>\\(S_{\\text{rep}}^{(0)}\\)</th><th>\\(S_{\\text{rep}}^{(1)}\\)</th><th>\\(S_{\\text{rep}}^{(2)}\\)</th><th>\\(S_{\\text{rep}}^{(3)}\\)</th><th>\\(\\bar S_{\\text{rep}}\\)</th><th>\\(\\bar S\\)</th></tr></thead><tbody>` +
      MODELS.map(m => `<tr><td>${m}</td>${REP[m].map((v, i) => `<td class="${rc[i](v)}">${fmt(v)}</td>`).join("")}</tr>`).join("") + `</tbody>`;

    // pixel
    const pc = [ranker(MODELS.map(m => PIX[m][0])), ranker(MODELS.map(m => PIX[m][1])), ranker(MODELS.map(m => PIX[m][2]), false), ranker(MODELS.map(m => PIX[m][3]), false)];
    $("#tab-pix").innerHTML = `<thead><tr><th>Method</th><th>PSNR ↑</th><th>SSIM ↑</th><th>LPIPS ↓</th><th>FID ↓</th></tr></thead><tbody>` +
      MODELS.map(m => `<tr><td>${m}</td>${PIX[m].map((v, i) => `<td class="${pc[i](v)}">${fmt(v)}</td>`).join("")}</tr>`).join("") + `</tbody>`;
  }

  /* -------------------------------------------------------------- charts */
  function corr() {
    const c = $("#corr");
    const best = k => Math.max(...CORR.map(r => r[k]));
    c.innerHTML = `<div class="h">Metric</div><div class="h">Kendall τ ↑</div><div class="h r">τ</div><div class="h r">Spearman</div><div class="h r">Pearson</div>` +
      CORR.map(r => `<div class="n ${r.ours ? "ours" : ""}">${r.n}${r.sub ? `<small>${r.sub}</small>` : ""}</div>
        <div class="tr"><div class="bar" style="width:${r.k * 100}%;${r.col ? `background:${r.col}` : ""}"></div></div>
        <div class="v k ${r.ours ? "ours" : ""}">${fmt(r.k)}</div>
        <div class="v ${r.s === best("s") ? "best" : ""}">${fmt(r.s)}${r.s === best("s") ? " ▲" : ""}</div>
        <div class="v ${r.p === best("p") ? "best" : ""}">${fmt(r.p)}${r.p === best("p") ? " ▲" : ""}</div>`).join("");
  }

  function gap() {
    const g = $("#gap"), lo = 3.2, hi = 4.6, X = v => ((v - lo) / (hi - lo) * 100).toFixed(2) + "%";
    g.innerHTML = MODELS.map(m => {
      const t = SEM[m][2][0], r = SEM[m][4][0], f = m === "FLUX.1-Kontext-dev" ? "flag" : "";
      return `<div class="n ${f}">${m}</div><div class="tr"><i style="left:${X(t)};width:calc(${X(r)} - ${X(t)})"></i>
        <b style="left:${X(t)};background:var(--d-tex)"></b><b style="left:${X(r)};background:var(--d-real)"></b></div>
        <div class="d ${f}">Δ${(r - t).toFixed(2)}</div>`;
    }).join("") + `<div></div><div class="ax">${[3.5, 4.0, 4.5].map(v => `<span style="left:${X(v)}">${v.toFixed(1)}</span>`).join("")}</div><div></div>`;
  }

  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, attrs) { const t = el("text", Object.assign({ x, y }, attrs || {}), parent); t.textContent = s; return t; }

  function landscape() {
    const W = 640, H = 400, m = { l: 62, r: 14, t: 16, b: 58 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": "Dataset size versus image resolution" }, $("#landscape"));
    const x0 = Math.log10(0.03), x1 = Math.log10(30), y0 = Math.log10(2200), y1 = Math.log10(700000);
    const X = v => m.l + (Math.log10(v) - x0) / (x1 - x0) * (W - m.l - m.r);
    const Y = v => H - m.b - (Math.log10(v) - y0) / (y1 - y0) * (H - m.t - m.b);
    const muted = css("--muted"), ink2 = css("--ink-2"), acc = css("--accent");
    el("rect", { x: X(1.048576), y: m.t, width: W - m.r - X(1.048576), height: H - m.t - m.b, fill: css("--accent-soft") }, svg);
    [[0.065536, "256²"], [0.262144, "512²"], [1.048576, "1024²"], [4.194304, "2048²"], [16.777216, "4096²"]].forEach(([v, l]) => {
      el("line", { x1: X(v), x2: X(v), y1: m.t, y2: H - m.b, stroke: "#E8E4DA" }, svg);
      txt(svg, X(v), H - m.b + 20, l, { "text-anchor": "middle", "font-size": 13, fill: muted });
    });
    [3e3, 1e4, 3e4, 1e5, 3e5].forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "#E8E4DA" }, svg);
      txt(svg, m.l - 8, Y(v) + 4, (v / 1e3) + "K", { "text-anchor": "end", "font-size": 13, fill: muted });
    });
    el("rect", { x: W - m.r - 128, y: m.t + 4, width: 124, height: 22, fill: css("--accent-soft") }, svg);
    txt(svg, W - m.r - 8, m.t + 20, "≥ 1024² per image", { "text-anchor": "end", "font-size": 13, "font-weight": 700, fill: acc });
    el("line", { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: ink2, "stroke-width": 1.4 }, svg);
    txt(svg, (m.l + W - m.r) / 2, H - 10, "Pixels per image (log scale, as equivalent square)", { "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: ink2 });
    const yl = txt(svg, 0, 0, "Image pairs (log)", { "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: ink2 });
    yl.setAttribute("transform", `translate(14 ${(m.t + H - m.b) / 2}) rotate(-90)`);
    const lab = { "VITON": [0, -12, "middle"], "VITON-HD": [11, 4, "start"], "DressCode": [-11, 4, "end"], "SHHQ": [-11, 4, "end"],
      "StreetTryOn": [0, -12, "middle"], "LH-400K": [11, 4, "start"] };
    DATASETS.forEach(d => {
      if (d[5] === null) return;
      const y = Y(d[2]);
      if (Array.isArray(d[5])) {
        const xa = X(d[5][0]), xb = X(d[5][1]);
        if (d[0].includes("ours")) {
          el("rect", { x: xa - 6, y: y - 10, width: xb - xa + 12, height: 20, rx: 10, fill: acc }, svg);
          txt(svg, xb + 14, y - 1, "OpenVTON-Bench", { "font-size": 16, "font-weight": 800, fill: acc });
          txt(svg, xb + 14, y + 15, "99,925 pairs · open", { "font-size": 12, "font-weight": 600, fill: acc });
        } else {
          el("line", { x1: xa, x2: xb, y1: y, y2: y, stroke: ink2, "stroke-width": 2, "stroke-dasharray": "1 5", "stroke-linecap": "round" }, svg);
          [xa, xb].forEach(xx => el("circle", { cx: xx, cy: y, r: 5.5, fill: "#fff", stroke: ink2, "stroke-width": 2 }, svg));
          txt(svg, X(Math.sqrt(d[5][0] * d[5][1])), y + 20, d[0] + " (closed)", { "text-anchor": "middle", "font-size": 13, "font-weight": 600, fill: ink2 });
        }
      } else {
        const x = X(d[5]), [dx, dy, an] = lab[d[0]];
        el("circle", { cx: x, cy: y, r: 7, fill: ink2 }, svg);
        txt(svg, x + dx, y + dy, d[0], { "text-anchor": an, "font-size": 13, "font-weight": 600, fill: ink2 });
      }
    });
  }

  function erodeChart() {
    const HL = { "YingHui": [css("--accent"), "YingHui", -2], "FLUX.2-dev": ["#2FA39A", "FLUX.2-dev", 3],
      "FLUX.1-Kontext-dev": ["#7B5CD6", "FLUX.1-Kontext", -3], "OOTD": [css("--warm"), "OOTD", 4] };
    const W = 560, H = 330, m = { l: 40, r: 112, t: 8, b: 30 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart", role: "img", "aria-label": "Representation similarity versus erosion level" }, $("#erode-chart"));
    const lo = 0.6, hi = 0.92, X = k => m.l + k / 3 * (W - m.l - m.r), Y = v => H - m.b - (v - lo) / (hi - lo) * (H - m.t - m.b);
    const muted = css("--muted");
    [0.6, 0.7, 0.8, 0.9].forEach(v => {
      el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: "#ECE8DF" }, svg);
      txt(svg, m.l - 8, Y(v) + 4, v.toFixed(1), { "text-anchor": "end", "font-size": 12, fill: muted });
    });
    [0, 1, 2, 3].forEach(k => txt(svg, X(k), H - m.b + 20, "k = " + k, { "text-anchor": "middle", "font-size": 12, fill: muted }));
    const series = MODELS.map(n => [n, REP[n].slice(1, 5)]).sort((a, b) => (a[0] in HL) - (b[0] in HL));
    series.forEach(([n, v]) => {
      const h = HL[n];
      el("polyline", { points: v.map((s, k) => `${X(k)},${Y(s)}`).join(" "), fill: "none", stroke: h ? h[0] : "#D3D0C8",
        "stroke-width": h ? 3 : 1.6, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      if (!h) return;
      v.forEach((s, k) => el("circle", { cx: X(k), cy: Y(s), r: 4, fill: h[0] }, svg));
      txt(svg, X(3) + 9, Y(v[3]) + 4 + h[2], h[1], { "font-size": 12, "font-weight": 800, fill: h[0] });
    });
  }

  /* ---------------------------------------------------------- erosion slider */
  function slider() {
    const s = $("#kslider"); if (!s) return;
    const imgs = document.querySelectorAll("#erode-view img");
    const desc = ["Full mask — the score reflects both boundary alignment and texture.",
      "Thin boundary band removed — small misalignments stop dominating.",
      "Most of the outline removed — the score shifts to fabric and prints.",
      "Interior only — measures whether the garment's texture was reproduced."];
    s.addEventListener("input", () => {
      const k = +s.value;
      imgs.forEach(im => { im.style.opacity = +im.dataset.k === k ? 1 : 0; });
      $("#kval").textContent = k; $("#kdesc").textContent = desc[k];
    });
  }

  /* --------------------------------------------------------- misc */
  function copyBib() {
    const b = $("#copy"); if (!b) return;
    b.addEventListener("click", async () => {
      const text = $("#bib").textContent.replace(/^Copy(ied!)?/, "").trim();
      try { await navigator.clipboard.writeText(text); b.textContent = "Copied!"; }
      catch (e) { b.textContent = "Select & copy"; }
      setTimeout(() => { b.textContent = "Copy"; }, 1600);
    });
  }
  function navSpy() {
    const links = [...document.querySelectorAll(".nav a.l")];
    const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(a => a.classList.remove("on")); const a = map.get(e.target.id); if (a) a.classList.add("on"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    explorer(); tables(); corr(); gap(); landscape(); erodeChart(); slider(); copyBib(); navSpy();
    if (window.renderMathInElement) {
      renderMathInElement(document.body, { delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }] });
    }
    document.body.dataset.ready = "1";
  });
})();
