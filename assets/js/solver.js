/*
 * Hero motion graphic: a 2-opt local search untangling a random tour.
 * Each tick applies the best 2-opt move it can find; replaced edges flash pink.
 * A traveller dot rides the current route. Click the canvas to add a city.
 */
(function () {
  const C = {
    edge: "rgba(248,248,242,0.55)",
    flash: "249,38,114",
    node: "#a6e22e",
    depot: "#e6db74",
    traveller: "#66d9ef",
    grid: "rgba(117,113,94,0.22)",
    ring: "#22231d",
  };

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function randomCities(n) {
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard++ < 5000) {
      const p = { x: 0.07 + Math.random() * 0.86, y: 0.08 + Math.random() * 0.84 };
      if (pts.every((q) => dist(p, q) > 0.09)) pts.push(p);
    }
    return pts;
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init(canvas, opts) {
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n0 = Math.max(6, Math.min(60, (opts && opts.cities) || 22));
    const onStat = (opts && opts.onStat) || function () {};

    let W = 0, H = 0, dpr = 1;
    let pts = [], tour = [], flashes = [];
    let iter = 0, startLen = 0, done = false, doneAt = 0;
    let travel = 0; // distance travelled along tour, in normalized units
    let visible = true, last = 0, lastStep = 0, raf = 0;
    const STEP_MS = 110;

    // Scale so the route is drawn in a square-ish area regardless of canvas ratio.
    const P = (p) => ({ x: p.x * W, y: p.y * H });

    function tourLen() {
      let s = 0;
      for (let i = 0; i < tour.length; i++) s += dist(P(pts[tour[i]]), P(pts[tour[(i + 1) % tour.length]]));
      return s / Math.max(W, 1) * 10; // a readable number
    }

    function reset(keepCities) {
      if (!keepCities) pts = randomCities(n0);
      tour = shuffle(pts.map((_, i) => i));
      iter = 0; done = false; flashes = []; travel = 0;
      startLen = tourLen();
      report();
      if (reduce) { while (step()) {} flashes = []; draw(); }
    }

    function report() {
      onStat({ iter, length: tourLen(), start: startLen, done, cities: pts.length });
    }

    // Best-improvement 2-opt. Returns true if a move was applied.
    function step() {
      const n = tour.length;
      if (n < 4) { done = true; return false; }
      let best = -1e-9, bi = -1, bj = -1;
      for (let i = 0; i < n - 1; i++) {
        const a = P(pts[tour[i]]), b = P(pts[tour[i + 1]]);
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const c = P(pts[tour[j]]), d = P(pts[tour[(j + 1) % n]]);
          const delta = dist(a, c) + dist(b, d) - dist(a, b) - dist(c, d);
          if (delta < best) { best = delta; bi = i; bj = j; }
        }
      }
      if (bi < 0) { done = true; doneAt = performance.now(); report(); return false; }
      // reverse tour[bi+1 .. bj]
      let l = bi + 1, r = bj;
      while (l < r) { [tour[l], tour[r]] = [tour[r], tour[l]]; l++; r--; }
      const t = performance.now();
      flashes.push({ a: tour[bi], b: tour[bi + 1], t });
      flashes.push({ a: tour[bj], b: tour[(bj + 1) % n], t });
      iter++;
      report();
      return true;
    }

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!startLen) startLen = tourLen();
      draw();
    }

    function pointAlong(d) {
      const n = tour.length;
      let total = 0;
      const seg = [];
      for (let i = 0; i < n; i++) {
        const a = P(pts[tour[i]]), b = P(pts[tour[(i + 1) % n]]);
        const L = dist(a, b); seg.push([a, b, L]); total += L;
      }
      if (!total) return null;
      d = ((d % total) + total) % total;
      for (const [a, b, L] of seg) {
        if (d <= L) { const k = d / L; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
        d -= L;
      }
      return null;
    }

    function draw(now) {
      now = now || performance.now();
      ctx.clearRect(0, 0, W, H);

      // dotted plot grid
      ctx.fillStyle = C.grid;
      const g = Math.max(22, Math.round(W / 22));
      for (let x = g / 2; x < W; x += g) for (let y = g / 2; y < H; y += g) ctx.fillRect(x, y, 1.2, 1.2);

      const n = tour.length;
      // route
      ctx.lineWidth = 1.4; ctx.strokeStyle = C.edge; ctx.lineJoin = "round";
      if (n > 1) {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const p = P(pts[tour[i % n]]);
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // flashes on newly created edges
      flashes = flashes.filter((f) => now - f.t < 900);
      for (const f of flashes) {
        const k = 1 - (now - f.t) / 900;
        const a = P(pts[f.a]), b = P(pts[f.b]);
        ctx.strokeStyle = `rgba(${C.flash},${k})`; ctx.lineWidth = 1.4 + 2.2 * k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      // cities
      for (let i = 0; i < pts.length; i++) {
        const p = P(pts[i]);
        const depot = i === tour[0];
        ctx.fillStyle = C.ring;
        ctx.beginPath(); ctx.arc(p.x, p.y, depot ? 7 : 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = depot ? C.depot : C.node;
        ctx.beginPath();
        if (depot) ctx.rect(p.x - 4, p.y - 4, 8, 8); else ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // traveller
      if (!reduce && n > 1) {
        const q = pointAlong(travel);
        if (q) {
          ctx.fillStyle = "rgba(102,217,239,0.18)";
          ctx.beginPath(); ctx.arc(q.x, q.y, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.traveller;
          ctx.beginPath(); ctx.arc(q.x, q.y, 3.6, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    function loop(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min(now - last, 60) : 16;
      last = now;
      travel += dt * 0.11 * (W / 500);
      if (!done && now - lastStep > STEP_MS) { lastStep = now; step(); }
      if (done && now - doneAt > 7000) reset(false);
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } }

    canvas.addEventListener("click", (e) => {
      if (pts.length >= 60) return;
      const r = canvas.getBoundingClientRect();
      pts.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
      // append to the tour so the solver has something to untangle
      const at = (Math.random() * tour.length) | 0;
      tour.splice(at, 0, pts.length - 1);
      done = false; startLen = tourLen(); iter = 0; report();
      if (reduce) { while (step()) {} flashes = []; draw(); } else start();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
    new ResizeObserver(resize).observe(canvas);

    pts = randomCities(n0);
    resize();
    reset(true);

    return {
      reset() { reset(false); draw(); start(); },
      start,
    };
  }

  window.Solver = { init };
})();
