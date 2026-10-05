/*
 * "Free Mochi": the cat leaves her panel and roams the whole screen.
 * She stands on the top edges of things (headings, cards, keycaps, the window's
 * title bar, the bottom of the desktop) and walks, sits, naps and hops between them.
 * Scroll down and she jumps down to something lower; scroll up and she jumps up.
 * Drag her to pick her up, drop her and she falls; click her to say hi.
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const FUR = "#fd971f", DARK = "#c46d10", CREAM = "#ffe3b8";
  // Things she can stand on, inside the portfolio window.
  const PERCH = [
    ".hero-greet", ".hero-name", ".hero-next", ".hero-actions .btn", ".pet",
    ".sec-head h2", ".news li", ".yaml .entry", ".pub-tools", ".pub-title", ".proj h3", ".diff",
    ".screen", ".kb-filters", ".kb-row", ".term", ".site-foot",
  ].join(",");
  const GRAV = 2600, WALK = 74, CAT_W = 80;

  const catSVG = `
    <svg viewBox="0 0 80 60" width="80" height="60" aria-hidden="true" overflow="visible">
      <g class="r-tail"><path d="M18 36 C8 34 4 24 8 12" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round"/></g>
      <g class="r-legs-far" stroke="${DARK}" stroke-width="5" stroke-linecap="round">
        <path class="r-leg" data-hip="24,42" d="M24 42 V56"/><path class="r-leg" data-hip="50,42" d="M50 42 V56"/>
      </g>
      <g class="r-body">
        <ellipse cx="36" cy="38" rx="22" ry="12" fill="${FUR}"/>
        <path d="M30 27 q-3 6 0 10 M38 26 q-3 6 0 11" fill="none" stroke="${DARK}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="40" cy="45" rx="13" ry="5" fill="${CREAM}"/>
      </g>
      <g class="r-legs-near" stroke="${FUR}" stroke-width="5.5" stroke-linecap="round">
        <path class="r-leg" data-hip="28,42" d="M28 42 V56"/><path class="r-leg" data-hip="54,42" d="M54 42 V56"/>
      </g>
      <g class="r-head">
        <path d="M51 16 L53 3 L61 12 Z M63 12 L70 3 L72 16 Z" fill="${FUR}"/>
        <path d="M54 13 L55 7 L59 12 Z M65 12 L69 7 L70 13 Z" fill="#f78fb3"/>
        <circle cx="61" cy="24" r="13" fill="${FUR}"/>
        <path d="M57 13 v4 M61 12 v5 M65 13 v4" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="66" cy="30" rx="8" ry="5.5" fill="${CREAM}"/>
        <g class="r-eye-open"><ellipse cx="66" cy="22" rx="3.2" ry="3.6" fill="#a6e22e"/><ellipse cx="67" cy="22" rx="1.1" ry="2.8" fill="#1e1f1c"/></g>
        <path class="r-eye-shut" d="M63 23 q3 2.5 6 0" fill="none" stroke="#4a3215" stroke-width="1.6" stroke-linecap="round" opacity="0"/>
        <path d="M72 27 l2.5 -1 l-.5 2.5 Z" fill="#f92672"/>
        <path d="M68 30 l10 -2 M68 32 l10 1" stroke="rgba(248,248,242,.6)" stroke-width=".8" stroke-linecap="round"/>
      </g>
    </svg>`;

  function make(opts) {
    const lines = (opts && opts.lines) || ["meow!"];
    const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const app = document.getElementById("app");
    const main = document.getElementById("main");

    const root = document.createElement("div");
    root.className = "roamer";
    root.hidden = true;
    root.innerHTML = `<div class="roam-cat" role="img" aria-label="Mochi the cat, roaming the page">${catSVG}</div><div class="roam-say"></div>`;
    document.body.appendChild(root);
    const catEl = root.querySelector(".roam-cat");
    const sayEl = root.querySelector(".roam-say");
    const q = (s) => catEl.querySelector(s);
    const parts = {
      tail: q(".r-tail"), body: q(".r-body"), head: q(".r-head"),
      legs: [...catEl.querySelectorAll(".r-leg")], open: q(".r-eye-open"), shut: q(".r-eye-shut"),
      far: q(".r-legs-far"), near: q(".r-legs-near"),
    };

    const cat = { x: 0, y: 0, vx: 0, vy: 0, dir: 1, state: "fall", plat: null, off: 0, goal: null, jump: null, phase: 0 };
    let on = false, raf = 0, last = 0, nextThink = 0, idleSince = 0, sayUntil = 0;
    let scrollAcc = 0, lastScrollTop = 0, nextScrollJump = 0, perchEls = [], onRecalled = null, recallTo = null;

    /* ---------- platforms ---------- */
    const floor = { kind: "floor" };
    const dockTop = { kind: "dock" };
    const titleBar = { kind: "win" };
    function rectOf(p) {
      if (!p) return null;
      if (p.kind === "seat") return { x1: p.seat.x, x2: p.seat.x, y: p.seat.y };
      if (p.kind === "floor") return { x1: 12, x2: innerWidth - 12, y: innerHeight - 2 };
      if (p.kind === "dock") {                       // she can sit on top of the dock too
        const d = document.querySelector(".dock");
        if (!d || document.documentElement.classList.contains("fullscreen")) return null;
        const r = d.getBoundingClientRect();
        return r.width > 40 ? { x1: r.left + 10, x2: r.right - 10, y: r.top } : null;
      }
      if (p.kind === "win") {
        if (app.classList.contains("hidden") || app.classList.contains("max")) return null;
        const r = app.getBoundingClientRect();
        return r.top > 40 ? { x1: r.left + 70, x2: r.right - 20, y: r.top } : null;
      }
      if (app.classList.contains("hidden")) return null;
      const r = p.el.getBoundingClientRect(), m = main.getBoundingClientRect();
      if (r.width < 46 || r.top < m.top + 34 || r.top > m.bottom - 6) return null;
      const x1 = Math.max(r.left, m.left) + 10, x2 = Math.min(r.right, m.right) - 10;
      return x2 - x1 > 24 ? { x1, x2, y: r.top } : null;
    }
    function refreshPerches() {
      perchEls = [...main.querySelectorAll(PERCH)].filter((e) => e.offsetParent !== null).map((el) => ({ kind: "el", el }));
    }
    function visiblePlatforms() {
      const out = [];
      for (const p of [...perchEls, titleBar, dockTop, floor]) { const r = rectOf(p); if (r) out.push({ p, r }); }
      return out;
    }
    function pick(filter, score) {
      let best = null, bs = Infinity;
      for (const c of visiblePlatforms()) {
        if (c.p === cat.plat || !filter(c.r)) continue;
        const s = score(c.r);
        if (s < bs) { bs = s; best = c; }
      }
      return best;
    }
    const nearestX = (r) => Math.min(r.x2, Math.max(r.x1, cat.x));

    /* ---------- actions ---------- */
    function say(text, t) {
      sayEl.textContent = text;
      sayUntil = t + 1600;
    }
    function jumpTo(c, t) {
      if (!c) return false;
      const tx = Math.min(c.r.x2 - 6, Math.max(c.r.x1 + 6, nearestX(c.r) + (Math.random() - 0.5) * 60));
      const dx = tx - cat.x, dy = c.r.y - cat.y, dist = Math.hypot(dx, dy);
      cat.jump = {
        sx: cat.x, sy: cat.y, p: c.p, off: tx - c.r.x1, t0: t,
        dur: reduce() ? 1 : Math.min(820, Math.max(340, 240 + dist * 0.9)),
        h: Math.max(36, Math.min(200, (dy < 0 ? -dy : 0) + 36 + dist * 0.12)),
      };
      cat.dir = dx >= 0 ? 1 : -1;
      cat.state = "jump"; cat.plat = null;
      return true;
    }
    function land(p, r, t) {
      cat.plat = p; cat.off = cat.x - r.x1; cat.y = r.y; cat.vy = 0;
      cat.state = "sit"; nextThink = t + 500 + Math.random() * 900;
    }
    function think(t) {
      const r = rectOf(cat.plat);
      if (!r) return;
      const idle = t - idleSince;
      const roll = Math.random();
      if (idle > 30000 && cat.state !== "sleep") { cat.state = "sleep"; nextThink = t + 8000; return; }
      if (cat.state === "sleep") { nextThink = t + 4000; return; }
      if (roll < 0.42) {                 // stroll along the ledge
        cat.goal = r.x1 + Math.random() * (r.x2 - r.x1);
        cat.dir = cat.goal > cat.x ? 1 : -1; cat.state = "walk";
        nextThink = t + 6000;
      } else if (roll < 0.66) {          // hop to something nearby
        const c = pick((pr) => Math.abs(pr.y - cat.y) < 260 && Math.abs(nearestX(pr) - cat.x) < 340,
          (pr) => Math.random() * 300 + Math.abs(pr.y - cat.y) * 0.3);
        if (!jumpTo(c, t)) { cat.state = "sit"; nextThink = t + 1500; }
      } else {                           // sit and look around
        cat.state = "sit"; nextThink = t + 1800 + Math.random() * 2600;
        if (Math.random() < 0.2) cat.dir *= -1;
      }
    }

    /* ---------- scroll → jump in the same direction ---------- */
    main.addEventListener("scroll", () => {
      if (!on) return;
      const st = main.scrollTop, d = st - lastScrollTop;
      lastScrollTop = st;
      scrollAcc += d;
      idleSince = performance.now();
      if (cat.state === "sleep") cat.state = "sit";
    }, { passive: true });
    function scrollReact(t) {
      if (Math.abs(scrollAcc) < 50 || t < nextScrollJump || cat.state === "jump" || cat.state === "drag" || cat.state === "fall") {
        if (t > nextScrollJump + 400) scrollAcc *= 0.9;
        return;
      }
      const down = scrollAcc > 0;
      scrollAcc = 0;
      nextScrollJump = t + 420;
      const c = pick(
        (pr) => (down ? pr.y > cat.y + 26 : pr.y < cat.y - 26),
        (pr) => Math.abs(pr.y - cat.y) * 0.7 + Math.abs(nearestX(pr) - cat.x) * 0.5 + Math.abs(Math.abs(pr.y - cat.y) - 170) * 0.4,
      );
      jumpTo(c, t);
    }

    /* ---------- dragging ---------- */
    let drag = null;
    catEl.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      catEl.setPointerCapture(e.pointerId);
      drag = { sx: e.clientX, sy: e.clientY, moved: false, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0 };
      idleSince = performance.now();
    });
    catEl.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const t = performance.now();
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5) {
        drag.moved = true; cat.state = "drag"; cat.plat = null; cat.jump = null;
        say("mrrow!", t);
      }
      if (drag.moved) {
        const dt = Math.max(8, t - drag.lt) / 1000;
        drag.vx = (e.clientX - drag.lx) / dt; drag.vy = (e.clientY - drag.ly) / dt;
        drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = t;
        cat.x = e.clientX; cat.y = e.clientY + 26;
        cat.dir = drag.vx > 30 ? 1 : drag.vx < -30 ? -1 : cat.dir;
      }
    });
    const drop = () => {
      if (!drag) return;
      const t = performance.now();
      if (!drag.moved) {
        say(lines[(Math.random() * lines.length) | 0], t);
        if (cat.state === "sleep") cat.state = "sit";
      } else {
        cat.state = "fall";
        cat.vx = Math.max(-900, Math.min(900, drag.vx * 0.6));
        cat.vy = Math.max(-900, Math.min(600, drag.vy * 0.6));
      }
      drag = null; idleSince = t;
    };
    catEl.addEventListener("pointerup", drop);
    catEl.addEventListener("pointercancel", drop);

    /* ---------- simulation ---------- */
    function step(t, dt) {
      if (cat.state === "jump") {
        const j = cat.jump, r = rectOf(j.p);
        if (!r) { cat.state = "fall"; cat.vx = 0; cat.vy = 0; }
        else {
          const k = Math.min(1, (t - j.t0) / j.dur), e = k;
          const tx = r.x1 + Math.min(j.off, r.x2 - r.x1), ty = r.y;
          cat.x = j.sx + (tx - j.sx) * e;
          cat.y = j.sy + (ty - j.sy) * e - j.h * 4 * k * (1 - k);
          cat.vy = k < 0.5 ? -1 : 1;
          if (k >= 1) land(j.p, r, t);
        }
      } else if (cat.state === "fall") {
        const py = cat.y;
        cat.vy += GRAV * dt; cat.x += cat.vx * dt; cat.y += cat.vy * dt;
        cat.vx *= Math.pow(0.6, dt);
        if (cat.x < 20) { cat.x = 20; cat.vx = Math.abs(cat.vx) * 0.5; }
        if (cat.x > innerWidth - 20) { cat.x = innerWidth - 20; cat.vx = -Math.abs(cat.vx) * 0.5; }
        if (cat.vy > 0) {
          for (const c of visiblePlatforms()) {
            if (c.r.y >= py - 1 && c.r.y <= cat.y && cat.x >= c.r.x1 && cat.x <= c.r.x2) { cat.y = c.r.y; land(c.p, c.r, t); break; }
          }
        }
        if (cat.state === "fall" && cat.y > innerHeight - 2) { cat.y = innerHeight - 2; land(floor, rectOf(floor), t); }
      } else if (cat.state !== "drag") {
        const r = rectOf(cat.plat);
        if (!r) {
          // the ledge scrolled away or vanished: jump the way it went, or drop
          const goneUp = cat.plat && cat.plat.kind === "el" && cat.plat.el.getBoundingClientRect().top < cat.y;
          const c = pick((pr) => (goneUp ? pr.y > cat.y - 10 : pr.y < cat.y + 10), (pr) => Math.abs(pr.y - cat.y) + Math.abs(nearestX(pr) - cat.x) * 0.5);
          if (!jumpTo(c, t)) { cat.state = "fall"; cat.vx = 0; cat.vy = 0; cat.plat = null; }
        } else {
          if (cat.state === "walk") {
            cat.off += cat.dir * WALK * dt;
            const x = r.x1 + cat.off;
            if ((cat.dir > 0 && x >= cat.goal) || (cat.dir < 0 && x <= cat.goal) || x <= r.x1 || x >= r.x2) {
              cat.state = "sit"; nextThink = t + 900 + Math.random() * 1500;
            }
            cat.phase += dt * 11;
          }
          cat.off = Math.max(0, Math.min(cat.off, r.x2 - r.x1));
          cat.x = r.x1 + cat.off; cat.y = r.y;
          if (t > nextThink && !reduce()) think(t);
        }
        scrollReact(t);
      }
      if (recallTo && cat.state !== "jump" && cat.state !== "drag") finishRecall();
      draw(t);
    }

    function draw(t) {
      const sec = t / 1000, s = cat.state;
      catEl.style.transform = `translate(${(cat.x - CAT_W / 2).toFixed(1)}px, ${(cat.y - 56).toFixed(1)}px)`;
      catEl.firstElementChild.style.transform = cat.dir < 0 ? "scaleX(-1)" : "none";
      catEl.classList.toggle("held", s === "drag");
      // legs
      parts.legs.forEach((leg, i) => {
        const [hx, hy] = leg.dataset.hip.split(",").map(Number);
        let a = 0;
        if (s === "walk") a = Math.sin(cat.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 28;
        else if (s === "jump" || s === "fall") a = (i % 2 ? -1 : 1) * (cat.vy < 0 ? 38 : 22) * (i > 1 ? 1 : -1);
        else if (s === "drag") a = Math.sin(sec * 8 + i) * 12;
        leg.setAttribute("transform", `rotate(${a.toFixed(1)} ${hx} ${hy})`);
      });
      const loaf = s === "sleep" || s === "sit";
      const tuck = s === "sleep" ? 0.15 : s === "sit" ? 0.55 : 1;
      const drop = (1 - tuck) * 14;            // body sinks as the legs fold, feet stay on the ledge
      const legT = `translate(0 ${(drop + 42 * (1 - tuck)).toFixed(2)}) scale(1 ${tuck})`;
      parts.far.setAttribute("transform", legT);
      parts.near.setAttribute("transform", legT);
      const tilt = s === "jump" || s === "fall" ? (cat.vy < 0 ? -14 : 14) : s === "drag" ? 0 : 0;
      parts.body.setAttribute("transform", `translate(0 ${drop.toFixed(1)}) rotate(${tilt} 36 38)`);
      const bob = s === "walk" ? Math.sin(cat.phase * 2) * 1.2 : s === "sleep" ? drop + 2 + Math.sin(sec * 1.5) * 0.6 : loaf ? drop * 0.35 : 0;
      parts.head.setAttribute("transform", `translate(0 ${bob.toFixed(1)}) rotate(${(tilt * 0.6).toFixed(1)} 61 24)`);
      parts.tail.setAttribute("transform", `translate(0 ${drop.toFixed(1)}) rotate(${(Math.sin(sec * (s === "walk" ? 6 : 2)) * (s === "sleep" ? 3 : 12)).toFixed(1)} 18 36)`);
      const blink = (sec % 4.2) < 0.12;
      const closed = s === "sleep" || blink;
      parts.open.setAttribute("opacity", closed ? 0 : 1);
      parts.shut.setAttribute("opacity", closed ? 1 : 0);
      // speech bubble / zzz
      const zz = s === "sleep" && t > sayUntil;
      sayEl.textContent = zz ? "z z z" : sayEl.textContent;
      sayEl.classList.toggle("show", t < sayUntil || zz);
      sayEl.classList.toggle("zz", zz);
      sayEl.style.transform = `translate(${(cat.x - 10).toFixed(1)}px, ${(cat.y - 92).toFixed(1)}px)`;
    }

    function loop(t) {
      raf = 0;
      if (!on) return;
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      step(t, dt);
      raf = requestAnimationFrame(loop);
    }

    /* ---------- public ---------- */
    function free(seat) {
      refreshPerches();
      lastScrollTop = main.scrollTop; scrollAcc = 0;
      on = true; root.hidden = false; recallTo = null;
      const t = performance.now();
      idleSince = t;
      cat.x = Math.min(innerWidth - 40, Math.max(40, seat.x)); cat.y = Math.min(innerHeight - 2, Math.max(60, seat.y));
      cat.dir = 1; cat.plat = null;
      // leap out of the panel onto something above it
      const c = pick((pr) => pr.y < cat.y - 40, (pr) => Math.abs(nearestX(pr) - cat.x) + Math.abs(pr.y - (cat.y - 220)));
      if (!jumpTo(c, t)) { cat.state = "fall"; cat.vx = -200; cat.vy = -700; }
      say("freedom!", t);
      last = 0; raf = raf || requestAnimationFrame(loop);
    }
    function recall(seat, done) {
      onRecalled = done;
      if (seat && seat.visible) {
        recallTo = seat;
        cat.jump = null;
        const t = performance.now();
        cat.dir = seat.x > cat.x ? 1 : -1;
        cat.jump = { sx: cat.x, sy: cat.y, p: { kind: "seat", seat }, off: 0, t0: t, dur: reduce() ? 1 : 620, h: Math.max(60, cat.y - seat.y + 60) };
        cat.state = "jump";
      } else finishRecall(true);
    }
    function finishRecall() {
      on = false; recallTo = null; root.hidden = true;
      if (raf) cancelAnimationFrame(raf), raf = 0;
      if (onRecalled) { const f = onRecalled; onRecalled = null; f(); }
    }
    window.addEventListener("resize", () => { if (on) refreshPerches(); });

    return { free, recall, isFree: () => on };
  }

  window.Roamer = { make };
})();
