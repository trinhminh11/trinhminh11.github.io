/*
 * A small macOS-style desktop. The portfolio (#app) is a window on it.
 *   drag the title bar to move it, drag any edge or corner to resize it
 *   red    → close the window (reopen it from the dock)
 * The résumé opens in its own viewer window (dock icon, or any link with data-open="resume").
 *   yellow → minimize into the dock
 *   green  → full screen inside the browser tab (menu bar and dock slide away);
 *            double-clicking the title bar does the same
 * On narrow screens the window always fills the screen.
 * Dock links come from data/contact.json and data/site.json.
 */
(function () {
  "use strict";
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof Element.prototype.animate !== "function";
  const smallMQ = window.matchMedia("(max-width: 820px)");
  const PAL = ["#ae81ff", "#f92672", "#fd971f", "#e6db74", "#a6e22e", "#66d9ef"];
  const APP_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#272822"/><path d="M14 46 26 18l8 18 6-10 10 20" fill="none" stroke="#f8f8f2" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".6"/><circle cx="14" cy="46" r="5" fill="#e6db74"/><circle cx="26" cy="18" r="4.5" fill="#a6e22e"/><circle cx="34" cy="36" r="4.5" fill="#a6e22e"/><circle cx="40" cy="26" r="4.5" fill="#f92672"/><circle cx="50" cy="46" r="4.5" fill="#66d9ef"/></svg>';
  const MENU_H = 28, DOCK = 86, MIN_W = 460, MIN_H = 340;
  // The dock sits on the right in landscape and along the bottom in portrait (see .dock in style.css).
  const portraitMQ = window.matchMedia("(orientation: portrait)");
  const dockRight = () => (portraitMQ.matches ? 0 : DOCK);
  const dockBottom = () => (portraitMQ.matches ? DOCK : 0);

  function wallpaper() {
    const W = 1600, H = 1000;
    const layers = PAL.map((c, i) => {
      const base = 250 + i * 118, amp = 70 - i * 6, f = 1.2 + i * 0.35, ph = i * 1.7;
      let d = `M0 ${H} L0 ${base}`;
      for (let x = 0; x <= W; x += 40) {
        const y = base + Math.sin(x / W * Math.PI * 2 * f + ph) * amp + Math.sin(x / W * Math.PI * 5 + ph * 2) * amp * 0.25;
        d += ` L${x} ${y.toFixed(1)}`;
      }
      d += ` L${W} ${H} Z`;
      const o = (0.9 - i * 0.06).toFixed(2);
      return `<g class="wave" style="--k:${i}"><path d="${d}" fill="${c}" opacity="${o}"/><path d="${d}" fill="${c}" opacity="${o}" transform="translate(${W} 0)"/></g>`;
    }).join("");
    return `<svg class="wp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1f1c"/><stop offset=".6" stop-color="#272822"/><stop offset="1" stop-color="#3e3d32"/></linearGradient>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#sky)"/>${layers}<rect width="${W}" height="${H}" fill="url(#shade)"/>
    </svg>`;
  }

  function init(d, icon, esc) {
    const app = document.getElementById("app");
    const desk = document.getElementById("desktop");
    const root = document.documentElement;
    if (!app || !desk) return;

    /* ---------- desktop: wallpaper, menu bar, dock ---------- */
    const links = (d.contact.links || []).filter((l) => l.url && ["github", "scholar", "linkedin", "email"].includes(l.id));
    const resume = d.site.resume && d.site.resume.path;
    const tile = { github: "#3e3d32", scholar: "#66d9ef", linkedin: "#0a66c2", email: "#f92672", resume: "#a6e22e" };
    const appName = d.site.editorTitle || "Portfolio";
    const pdfName = resume ? resume.split("/").pop() : "";

    desk.innerHTML = `${wallpaper()}
      <div class="menubar">
        <span class="mb-logo" aria-hidden="true">◆</span><b>${esc(d.contact.name)}</b>
        <span class="mb-item">File</span><span class="mb-item">Edit</span><span class="mb-item">View</span><span class="mb-item">Window</span>
        <span class="mb-sp"></span><span id="mb-clock"></span>
      </div>
      <nav class="dock" aria-label="Dock">
        <button type="button" class="dock-app running" id="dock-app" aria-label="${esc(appName)}">
          <span class="tile">${APP_ICON}</span><span class="tip">${esc(appName)}</span><i class="run"></i>
        </button>
        ${resume ? `<button type="button" class="dock-app" id="dock-pdf" aria-label="Résumé">
          <span class="tile" style="--t:${tile.resume}">${icon("resume")}</span><span class="tip">Résumé</span><i class="run"></i>
        </button>` : ""}
        <span class="dock-sep" aria-hidden="true"></span>
        ${links.map((l) => `<a class="dock-app" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
          <span class="tile" style="--t:${tile[l.id] || "#49483e"}">${icon(l.id)}</span><span class="tip">${esc(l.label)}</span></a>`).join("")}
      </nav>`;

    const clock = desk.querySelector("#mb-clock");
    const tick = () => {
      const t = new Date();
      clock.textContent = t.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + "   " +
        t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    };
    tick(); setInterval(tick, 15000);

    const vw = () => window.innerWidth, vh = () => window.innerHeight;
    const small = () => smallMQ.matches;
    const wins = [];
    let zTop = 10;
    const syncDesktop = () => {
      root.classList.toggle("fullscreen", wins.some((w) => w.vis === "shown" && w.isFull()));
      root.classList.toggle("small", small());
    };
    const GENIE = [
      { transform: "none", opacity: 1 },
      { transform: "scale(.4, .62)", opacity: 1, offset: 0.45 },
      { transform: "scale(.015, .02)", opacity: 0.15 },
    ];

    /* ---------- one window ---------- */
    function makeWindow(el, dockBtn, opts) {
      const w = { el, vis: opts.startHidden ? "closed" : "shown", full: false, geom: null, busy: false };
      const green = el.querySelector(".light.max");

      function clampGeom(g) {
        g.w = Math.max(MIN_W, Math.min(g.w, vw() - 16));
        g.h = Math.max(MIN_H, Math.min(g.h, vh() - MENU_H - 8));
        g.x = Math.min(Math.max(g.x, 120 - g.w), vw() - 120);
        g.y = Math.min(Math.max(g.y, MENU_H), vh() - 48);
        return g;
      }
      w.isFull = () => w.full || small();
      const rect = () => (w.isFull() ? { x: 0, y: 0, w: vw(), h: vh() } : w.geom);
      function apply() {
        const r = rect();
        Object.assign(el.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
        el.classList.toggle("max", w.isFull());
        el.classList.toggle("hidden", w.vis !== "shown");
        if (green) green.setAttribute("aria-label", w.full ? "Exit full screen" : "Enter full screen");
        if (dockBtn) dockBtn.classList.toggle("running", w.vis !== "closed");
        syncDesktop();
      }
      w.apply = apply;
      w.relayout = () => { if (w.geom) clampGeom(w.geom); apply(); };
      const focus = () => { el.style.zIndex = ++zTop; };
      w.focus = focus;
      el.addEventListener("pointerdown", focus, true);

      function morph(from) {
        const to = rect();
        if (reduce()) return;
        el.style.transformOrigin = "0 0";
        el.animate([
          { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.w / to.w}, ${from.h / to.h})` },
          { transform: "none" },
        ], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
      }
      function dockOrigin() {
        const b = (dockBtn || desk.querySelector("#dock-app")).getBoundingClientRect(), r = rect();
        return `${b.left + b.width / 2 - r.x}px ${b.top + b.height / 2 - r.y}px`;
      }
      const run = (frames, o, end) => {
        if (reduce()) return end();
        el.animate(frames, o).finished.then(end, end);
      };

      w.toggleFull = () => {
        if (small() || w.vis !== "shown" || w.busy) return;
        const from = { ...rect() };
        w.full = !w.full; apply(); morph(from);
      };
      w.minimize = () => {
        if (w.vis !== "shown" || w.busy) return;
        w.busy = true; w.vis = "min"; syncDesktop();
        el.style.transformOrigin = dockOrigin();
        run(GENIE, { duration: 620, easing: "cubic-bezier(.55,.05,.45,1)", fill: "forwards" },
          () => { apply(); w.busy = false; if (dockBtn) dockBtn.focus({ preventScroll: true }); });
      };
      w.close = () => {
        if (w.vis !== "shown" || w.busy) return;
        w.busy = true; w.vis = "closed"; syncDesktop();
        el.style.transformOrigin = "50% 50%";
        run([{ transform: "none", opacity: 1 }, { transform: "scale(.94)", opacity: 0 }], { duration: 220, easing: "ease-in", fill: "forwards" },
          () => { apply(); w.busy = false; if (opts.onClose) opts.onClose(); });
      };
      w.open = () => {
        if (w.busy) return;
        if (w.vis === "shown") {
          focus();
          if (dockBtn) { dockBtn.classList.add("bounce"); setTimeout(() => dockBtn.classList.remove("bounce"), 650); }
          return;
        }
        const wasClosed = w.vis === "closed";
        w.busy = true;
        if (wasClosed) { w.geom = clampGeom(opts.geom()); w.full = false; if (opts.onOpen) opts.onOpen(); }
        w.vis = "shown";
        el.getAnimations().forEach((a) => a.cancel());
        focus(); apply();
        el.style.transformOrigin = dockOrigin();
        run([...GENIE].reverse(), { duration: 560, easing: "cubic-bezier(.2,.8,.2,1)" },
          () => { w.busy = false; const b = el.querySelector(".light.min"); if (b) b.focus({ preventScroll: true }); });
      };

      // drag by the title bar, resize by edges/corners
      const bar = el.querySelector(".titlebar");
      function track(e, onMove, cls) {
        e.preventDefault();
        const h = e.currentTarget;
        h.setPointerCapture(e.pointerId);
        el.classList.add(cls); root.classList.add("win-busy");
        const sx = e.clientX, sy = e.clientY, g0 = { ...w.geom };
        const move = (ev) => { onMove(ev.clientX - sx, ev.clientY - sy, g0); apply(); };
        const up = () => {
          h.removeEventListener("pointermove", move); h.removeEventListener("pointerup", up); h.removeEventListener("pointercancel", up);
          el.classList.remove(cls); root.classList.remove("win-busy");
        };
        h.addEventListener("pointermove", move); h.addEventListener("pointerup", up); h.addEventListener("pointercancel", up);
      }
      bar.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || w.isFull() || e.target.closest(".lights, a, button")) return;
        track(e, (dx, dy, g0) => {
          w.geom.x = Math.min(Math.max(g0.x + dx, 120 - w.geom.w), vw() - 120);
          w.geom.y = Math.min(Math.max(g0.y + dy, MENU_H), vh() - 48);
        }, "dragging");
      });
      bar.addEventListener("dblclick", (e) => { if (!e.target.closest(".lights, a, button")) w.toggleFull(); });
      el.querySelectorAll(".rs").forEach((h) => h.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || w.isFull()) return;
        const dir = h.dataset.rs;
        track(e, (dx, dy, g0) => {
          if (dir.includes("e")) w.geom.w = Math.max(MIN_W, Math.min(g0.w + dx, vw() - g0.x));
          if (dir.includes("s")) w.geom.h = Math.max(MIN_H, Math.min(g0.h + dy, vh() - g0.y));
          if (dir.includes("w")) { const nw = Math.max(MIN_W, g0.w - dx); w.geom.x = g0.x + g0.w - nw; w.geom.w = nw; }
          if (dir.includes("n")) { const y = Math.max(MENU_H, Math.min(g0.y + dy, g0.y + g0.h - MIN_H)); w.geom.h = g0.y + g0.h - y; w.geom.y = y; }
        }, "resizing");
      }));
      el.querySelector(".lights").addEventListener("click", (e) => {
        const b = e.target.closest("[data-win]");
        if (b) ({ close: w.close, minimize: w.minimize, fullscreen: w.toggleFull })[b.dataset.win]();
      });
      if (dockBtn) dockBtn.addEventListener("click", w.open);

      w.geom = clampGeom(opts.geom());
      apply();
      wins.push(w);
      return w;
    }

    /* ---------- the portfolio window ---------- */
    function mainGeom() {
      const availW = vw() - dockRight() - 32, availH = vh() - MENU_H - dockBottom() - 28;
      const ww = Math.max(MIN_W, Math.min(1280, Math.round(availW * 0.94)));
      const hh = Math.max(MIN_H, Math.min(920, Math.round(availH * 0.95)));
      return { x: Math.round(16 + (availW - ww) / 2), y: Math.round(MENU_H + 12 + (availH - hh) / 2), w: ww, h: hh };
    }
    const mainWin = makeWindow(app, desk.querySelector("#dock-app"), {
      geom: mainGeom,
      onOpen: () => { document.getElementById("main").scrollTop = 0; },
    });

    /* ---------- the résumé viewer window ---------- */
    let pdfWin = null;
    if (resume) {
      const v = document.createElement("div");
      v.className = "win viewer hidden";
      v.setAttribute("role", "dialog");
      v.setAttribute("aria-label", "Résumé");
      v.innerHTML = `
        <div class="titlebar">
          <span class="lights" role="group" aria-label="Window controls">
            <button type="button" class="light close" data-win="close" aria-label="Close résumé"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 3l4 4M7 3 3 7"/></svg></button>
            <button type="button" class="light min" data-win="minimize" aria-label="Minimize résumé"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 5h5"/></svg></button>
            <button type="button" class="light max" data-win="fullscreen" aria-label="Enter full screen"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 7V4.2L5.8 7zM7 3v2.8L4.2 3z" class="fill"/></svg></button>
          </span>
          <span class="titlebar-name">${esc(pdfName)}</span>
          <span class="viewer-actions">
            <a href="${esc(resume)}" target="_blank" rel="noopener">Open in new tab</a>
            <a href="${esc(resume)}" download>Download</a>
          </span>
        </div>
        <div class="viewer-body"><iframe title="Résumé (PDF)" loading="lazy"></iframe>
          <p class="viewer-fallback">Your browser can't show PDFs inline. <a href="${esc(resume)}" target="_blank" rel="noopener">Open the résumé</a> instead.</p></div>
        ${["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((x) => `<span class="rs ${x}" data-rs="${x}" aria-hidden="true"></span>`).join("")}`;
      document.body.appendChild(v);
      const frame = v.querySelector("iframe");
      pdfWin = makeWindow(v, desk.querySelector("#dock-pdf"), {
        startHidden: true,
        geom: () => {
          const hh = Math.min(vh() - MENU_H - dockBottom() - 40, 1000), ww = Math.min(Math.round(hh * 0.78), vw() - dockRight() - 40);
          return { x: Math.round((vw() - dockRight() - ww) / 2), y: MENU_H + 16, w: ww, h: hh };
        },
        onOpen: () => { if (!frame.src) frame.src = resume + "#view=FitH"; },
      });
    }

    // Browsers without a built-in PDF viewer (most phones) get the file in a new tab instead.
    const inlinePdf = navigator.pdfViewerEnabled !== false;
    if (pdfWin && !inlinePdf) {
      const b = desk.querySelector("#dock-pdf");
      const nb = b.cloneNode(true);             // drop the window listener
      b.replaceWith(nb);
      nb.addEventListener("click", () => window.open(resume, "_blank", "noopener"));
    }
    // Any link marked data-open="resume" (the hero button) opens the viewer instead of a new tab.
    document.addEventListener("click", (e) => {
      const a = e.target.closest('[data-open="resume"]');
      if (!a || !pdfWin || !inlinePdf || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      pdfWin.open();
    });

    window.addEventListener("resize", () => wins.forEach((w) => w.relayout()));
    smallMQ.addEventListener && smallMQ.addEventListener("change", () => wins.forEach((w) => w.apply()));
    // rotating the phone / reshaping the browser moves the dock, so re-fit the windows around it
    portraitMQ.addEventListener && portraitMQ.addEventListener("change", () => wins.forEach((w) => w.relayout()));

    mainWin.focus();
    // launch: the window zooms out of its dock icon on first load
    if (!reduce() && !small()) {
      const b = desk.querySelector("#dock-app").getBoundingClientRect(), r = mainWin.el.getBoundingClientRect();
      app.style.transformOrigin = `${b.left + b.width / 2 - r.left}px ${b.top + b.height / 2 - r.top}px`;
      app.animate([...GENIE].reverse(), { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
  }

  window.Desktop = { init };
})();
