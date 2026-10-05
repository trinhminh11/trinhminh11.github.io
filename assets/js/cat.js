/*
 * Hero companion: an interactive SVG cat.
 *   - her eyes and head follow your pointer
 *   - stroke her head or back to pet her (she purrs, hearts float up)
 *   - drag and throw the yarn ball; if it rolls close she bats it with a paw
 *   - click her to say hi; leave her alone and she falls asleep
 * Name, caption and speech lines come from data/overview.json → "pet".
 * Drawn in SVG, so it stays sharp at any window size.
 */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 400, H = 300, FLOOR = 262, R = 17;
  const C = {
    fur: "#fd971f", furDark: "#c46d10", cream: "#ffe3b8", eye: "#a6e22e", pupil: "#1e1f1c",
    nose: "#f92672", earIn: "#f78fb3", line: "#4a3215", whisker: "rgba(248,248,242,.55)",
    yarn: "#ae81ff", yarnDark: "#7d58d1", heart: "#f92672", rug: "#2c2d26",
  };

  const svgMarkup = () => `
    <defs>
      <radialGradient id="pet-rug" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#34352d"/><stop offset="1" stop-color="${C.rug}"/></radialGradient>
    </defs>
    <ellipse cx="200" cy="268" rx="178" ry="20" fill="url(#pet-rug)"/>
    <ellipse cx="200" cy="264" rx="98" ry="9" fill="rgba(0,0,0,.35)"/>

    <g id="pc-tail"><path d="M246 250 C300 262 336 236 326 196 C318 166 292 160 296 136" fill="none" stroke="${C.fur}" stroke-width="17" stroke-linecap="round"/></g>

    <g id="pc-body">
      <path d="M200 122 C150 122 128 176 130 215 C132 251 156 263 200 263 C244 263 268 251 270 215 C272 176 250 122 200 122 Z" fill="${C.fur}"/>
      <path d="M140 190 q14 4 22 -4 M137 214 q16 4 26 -5 M260 190 q-14 4 -22 -4 M263 214 q-16 4 -26 -5" fill="none" stroke="${C.furDark}" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="200" cy="222" rx="38" ry="38" fill="${C.cream}"/>
    </g>

    <g id="pc-legL"><path d="M176 205 L172 252" stroke="${C.fur}" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="172" cy="256" rx="16" ry="9" fill="${C.cream}"/><path d="M166 252 v6 M172 251 v7 M178 252 v6" stroke="${C.line}" stroke-width="1.5" stroke-linecap="round" opacity=".45"/></g>
    <g id="pc-legR"><path d="M224 205 L228 252" stroke="${C.fur}" stroke-width="22" stroke-linecap="round"/>
      <ellipse cx="228" cy="256" rx="16" ry="9" fill="${C.cream}"/><path d="M222 252 v6 M228 251 v7 M234 252 v6" stroke="${C.line}" stroke-width="1.5" stroke-linecap="round" opacity=".45"/></g>

    <g id="pc-head">
      <g id="pc-earL"><path d="M148 94 L156 36 L192 70 Z" fill="${C.fur}"/><path d="M157 84 L161 52 L182 71 Z" fill="${C.earIn}"/></g>
      <g id="pc-earR"><path d="M252 94 L244 36 L208 70 Z" fill="${C.fur}"/><path d="M243 84 L239 52 L218 71 Z" fill="${C.earIn}"/></g>
      <ellipse cx="200" cy="106" rx="60" ry="50" fill="${C.fur}"/>
      <path d="M190 62 v12 M200 60 v14 M210 62 v12" stroke="${C.furDark}" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="200" cy="128" rx="30" ry="20" fill="${C.cream}"/>
      <ellipse id="pc-blushL" cx="164" cy="122" rx="10" ry="6" fill="${C.nose}" opacity="0"/>
      <ellipse id="pc-blushR" cx="236" cy="122" rx="10" ry="6" fill="${C.nose}" opacity="0"/>

      <g id="pc-eyes">
        <g id="pc-eyeL"><ellipse cx="178" cy="102" rx="13" ry="14" fill="${C.eye}"/><ellipse class="pupil" cx="178" cy="102" rx="4" ry="11" fill="${C.pupil}"/><circle class="glint" cx="182" cy="96" r="3" fill="#fff"/></g>
        <g id="pc-eyeR"><ellipse cx="222" cy="102" rx="13" ry="14" fill="${C.eye}"/><ellipse class="pupil" cx="222" cy="102" rx="4" ry="11" fill="${C.pupil}"/><circle class="glint" cx="226" cy="96" r="3" fill="#fff"/></g>
      </g>
      <g id="pc-happy" opacity="0" fill="none" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round">
        <path d="M166 106 Q178 92 190 106"/><path d="M210 106 Q222 92 234 106"/>
      </g>
      <g id="pc-sleepy" opacity="0" fill="none" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round">
        <path d="M166 102 Q178 112 190 102"/><path d="M210 102 Q222 112 234 102"/>
      </g>

      <path d="M194 118 h12 l-6 7 Z" fill="${C.nose}" stroke="${C.nose}" stroke-width="2" stroke-linejoin="round"/>
      <path id="pc-mouth" d="M200 125 Q195 133 188 129 M200 125 Q205 133 212 129" fill="none" stroke="${C.line}" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse id="pc-mouthO" cx="200" cy="132" rx="5" ry="0" fill="#7a2140"/>
      <g stroke="${C.whisker}" stroke-width="1.6" stroke-linecap="round">
        <path d="M170 124 L136 118 M170 129 L134 131 M230 124 L264 118 M230 129 L266 131"/>
      </g>
    </g>

    <g id="pc-fx"></g>
    <g id="pc-away" opacity="0" font-family="IBM Plex Sans, system-ui, sans-serif" text-anchor="middle">
      <text x="200" y="140" font-size="17" fill="#f8f8f2" id="pc-away-text"></text>
      <text x="200" y="166" font-size="13" fill="#75715e" id="pc-away-sub"></text>
      <path d="M150 238 q6 -10 12 0 M176 250 q6 -10 12 0 M214 236 q6 -10 12 0 M240 248 q6 -10 12 0" fill="none" stroke="#c46d10" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    </g>

    <g id="pc-bubble" opacity="0">
      <rect x="248" y="22" width="120" height="38" rx="12" fill="#f8f8f2"/>
      <path d="M262 58 l-10 14 l22 -14 Z" fill="#f8f8f2"/>
      <text id="pc-say" x="308" y="47" text-anchor="middle" font-family="Martian Mono, ui-monospace, monospace" font-size="15" fill="#272822"></text>
    </g>

    <g id="pc-yarn" style="cursor:grab">
      <path id="pc-thread" d="" fill="none" stroke="${C.yarn}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      <g id="pc-ball">
        <circle r="${R}" fill="${C.yarn}"/>
        <g fill="none" stroke="${C.yarnDark}" stroke-width="2" stroke-linecap="round">
          <path d="M-14 -6 Q0 -16 14 -6"/><path d="M-16 2 Q0 -8 16 2"/><path d="M-12 10 Q0 2 12 10"/><path d="M-6 -15 Q4 0 -4 15"/>
        </g>
        <circle r="${R + 6}" fill="transparent"/>
      </g>
    </g>`;

  function init(svg, opts) {
    opts = opts || {};
    const lines = opts.lines && opts.lines.length ? opts.lines : ["mrrp?", "meow!", "hi :3", "prrr…", "nya"];
    const onMood = opts.onMood || function () {};
    const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = svgMarkup();
    const $ = (id) => svg.querySelector("#" + id);
    const el = {
      head: $("pc-head"), body: $("pc-body"), tail: $("pc-tail"), legL: $("pc-legL"), legR: $("pc-legR"),
      earL: $("pc-earL"), earR: $("pc-earR"), eyes: $("pc-eyes"), happy: $("pc-happy"), sleepy: $("pc-sleepy"),
      pupils: [...svg.querySelectorAll(".pupil")], glints: [...svg.querySelectorAll(".glint")],
      blushL: $("pc-blushL"), blushR: $("pc-blushR"), mouthO: $("pc-mouthO"),
      bubble: $("pc-bubble"), say: $("pc-say"), fx: $("pc-fx"), yarn: $("pc-yarn"), ball: $("pc-ball"), thread: $("pc-thread"),
    };

    const ball = { x: 330, y: FLOOR - R, vx: 0, vy: 0, rot: 0, drag: false };
    const look = { x: 200, y: 160, tx: 200, ty: 160 };
    let pointer = null, lastPointerT = 0, lastActive = performance.now();
    let mood = "", purrUntil = 0, petDist = 0, petDecayT = 0, blinkAt = 0, blinkT = -1;
    let restSwats = 0;
    let sayUntil = 0, swipe = null, swipeCool = 0, flick = 0, nextHeart = 0, nextZ = 0;
    const fx = [];
    let visible = true, raf = 0, last = 0, away = false;
    const catParts = ["pc-tail", "pc-body", "pc-legL", "pc-legR", "pc-head", "pc-bubble"].map((id) => svg.querySelector("#" + id));

    const toLocal = (e) => {
      const m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return { x: p.x, y: p.y };
    };
    const asleep = () => mood === "asleep";
    const wake = (t) => {
      lastActive = t; restSwats = 0;
      if (asleep()) { setMood("curious"); say("mrrp?", t); }
    };
    function setMood(m) { if (m !== mood) { mood = m; onMood(m); } }
    function say(text, t) {
      el.say.textContent = text;
      const w = Math.max(70, text.length * 10 + 28);
      el.bubble.querySelector("rect").setAttribute("width", w);
      el.say.setAttribute("x", 248 + w / 2);
      sayUntil = t + 1700;
      el.mouthO.setAttribute("ry", "5");
      setTimeout(() => el.mouthO.setAttribute("ry", "0"), 380);
    }
    function spawn(kind, x, y) {
      const n = document.createElementNS(NS, kind === "heart" ? "path" : "text");
      if (kind === "heart") {
        n.setAttribute("d", "M0 3 C-6 -3 -12 2 -6 8 L0 13 L6 8 C12 2 6 -3 0 3 Z");
        n.setAttribute("fill", C.heart);
      } else {
        n.textContent = "z";
        n.setAttribute("font-family", "Martian Mono, ui-monospace, monospace");
        n.setAttribute("font-size", "16"); n.setAttribute("fill", "#cfcfc2");
      }
      el.fx.appendChild(n);
      fx.push({ n, x, y, vx: (Math.random() - 0.5) * 30, vy: kind === "heart" ? -45 : -22, life: 0, max: kind === "heart" ? 1.4 : 2.4, kind });
    }

    /* ---------- pointer ---------- */
    let dragPrev = null;
    svg.addEventListener("pointermove", (e) => {
      const t = performance.now(), p = toLocal(e);
      if (pointer && !ball.drag) {
        // stroking her head or back counts as petting
        const onCat = (Math.hypot(p.x - 200, p.y - 105) < 62) || (Math.hypot(p.x - 200, p.y - 200) < 68);
        if (onCat) { petDist += Math.hypot(p.x - pointer.x, p.y - pointer.y); petDecayT = t; }
      }
      pointer = p; lastPointerT = t;
      if (ball.drag) {
        const now = t;
        if (dragPrev) {
          const dt = Math.max(1, now - dragPrev.t) / 1000;
          ball.vx = ball.vx * 0.5 + ((p.x - dragPrev.x) / dt) * 0.5;
          ball.vy = ball.vy * 0.5 + ((p.y - dragPrev.y) / dt) * 0.5;
        }
        dragPrev = { x: p.x, y: p.y, t: now };
        ball.x = Math.min(W - R, Math.max(R, p.x)); ball.y = Math.min(FLOOR - R, Math.max(R, p.y));
      }
      wake(t);
      start();
    });
    svg.addEventListener("pointerleave", () => { pointer = null; });
    el.yarn.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      el.yarn.setPointerCapture(e.pointerId);
      ball.drag = true; ball.vx = ball.vy = 0; dragPrev = null;
      el.yarn.style.cursor = "grabbing";
      wake(performance.now()); start();
    });
    const release = () => {
      if (!ball.drag) return;
      ball.drag = false; el.yarn.style.cursor = "grab";
      const sp = Math.hypot(ball.vx, ball.vy), max = 1400;
      if (sp > max) { ball.vx *= max / sp; ball.vy *= max / sp; }
    };
    el.yarn.addEventListener("pointerup", release);
    el.yarn.addEventListener("pointercancel", release);
    svg.addEventListener("click", (e) => {
      if (e.target.closest("#pc-yarn")) return;
      const p = toLocal(e), t = performance.now();
      const onCat = Math.hypot(p.x - 200, p.y - 105) < 66 || Math.hypot(p.x - 200, p.y - 200) < 72 || Math.hypot(p.x - 310, p.y - 200) < 40;
      const wasAsleep = asleep();
      wake(t);
      if (onCat && !wasAsleep) { say(lines[(Math.random() * lines.length) | 0], t); flick = 1; }
      start();
    });

    function toss() {
      const t = performance.now();
      ball.drag = false;
      ball.x = R + 4; ball.y = 120; ball.vx = 520 + Math.random() * 240; ball.vy = -260;
      wake(t); start();
    }

    /* ---------- simulation + drawing ---------- */
    const lerp = (a, b, k) => a + (b - a) * k;
    function step(t, dt) {
      // ball physics
      if (!ball.drag) {
        ball.vy += 1500 * dt;
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.y > FLOOR - R) { ball.y = FLOOR - R; ball.vy = Math.abs(ball.vy) > 60 ? -ball.vy * 0.5 : 0; ball.vx *= 0.985; }
        if (ball.x < R) { ball.x = R; ball.vx = Math.abs(ball.vx) * 0.7; }
        if (ball.x > W - R) { ball.x = W - R; ball.vx = -Math.abs(ball.vx) * 0.7; }
        if (ball.y < R) { ball.y = R; ball.vy = Math.abs(ball.vy) * 0.6; }
        // bounce off the cat's body
        const dx = ball.x - 200, dy = ball.y - 205, dist = Math.hypot(dx, dy), min = 66 + R;
        if (dist < min && dist > 0) {
          const nx = dx / dist, ny = dy / dist, dot = ball.vx * nx + ball.vy * ny;
          ball.x = 200 + nx * min; ball.y = 205 + ny * min;
          if (dot < 0) { ball.vx -= 1.6 * dot * nx; ball.vy -= 1.6 * dot * ny; }
        }
        if (ball.y >= FLOOR - R - 0.5) ball.vx *= Math.pow(0.35, dt);
        if (Math.abs(ball.vx) < 4) ball.vx = 0;
      }
      ball.rot += (ball.vx * dt) / R;
      const moving = ball.drag || Math.hypot(ball.vx, ball.vy) > 40;
      if (moving) lastActive = t;

      // swat the ball when it rolls close
      // (a ball resting next to her gets at most two lazy swats until you interact again)
      if (!away && !asleep() && !swipe && t > swipeCool && !ball.drag && ball.y > 205 && Math.abs(ball.x - 200) < 95 && (moving || restSwats < 2)) {
        if (!moving) restSwats++;
        swipe = { side: ball.x < 200 ? -1 : 1, t0: t, hit: false };
        swipeCool = t + (moving ? 700 : 2500);
      }
      if (swipe) {
        const k = (t - swipe.t0) / 340;
        if (!swipe.hit && k > 0.35) {
          swipe.hit = true;
          ball.vx = swipe.side * (420 + Math.random() * 360); ball.vy = -(280 + Math.random() * 260);
          if (Math.random() < 0.35) say("!", t);
        }
        if (k >= 1) swipe = null;
      }

      // petting → purring
      if (t - petDecayT > 700) petDist = Math.max(0, petDist - 600 * dt);
      if (!away && petDist > 240) { purrUntil = t + 2200; petDist = 120; lastActive = t; }
      const purring = t < purrUntil;

      // mood
      if (away) setMood("away");
      else if (purring) setMood("purring");
      else if (moving || swipe) setMood("playing");
      else if (t - lastActive > 16000) setMood("asleep");
      else if (!asleep()) setMood("curious");

      // where to look
      let tx = 200, ty = 170;
      if (moving) { tx = ball.x; ty = ball.y; }
      else if (pointer && t - lastPointerT < 4000) { tx = pointer.x; ty = pointer.y; }
      else { tx = ball.x; ty = ball.y; }
      look.x = lerp(look.x, tx, Math.min(1, dt * 9)); look.y = lerp(look.y, ty, Math.min(1, dt * 9));

      // effects
      if (purring && t > nextHeart) { spawn("heart", 200 + (Math.random() - 0.5) * 60, 60); nextHeart = t + 320; }
      if (asleep() && t > nextZ) { spawn("z", 236, 74); nextZ = t + 1100; }
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i];
        f.life += dt; f.x += f.vx * dt + (f.kind === "z" ? Math.sin(f.life * 3) * 0.4 : 0); f.y += f.vy * dt;
        const a = 1 - f.life / f.max, s = f.kind === "heart" ? 0.7 + f.life * 0.4 : 0.8 + f.life * 0.3;
        f.n.setAttribute("transform", `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${s.toFixed(2)})`);
        f.n.setAttribute("opacity", Math.max(0, a).toFixed(2));
        if (f.life >= f.max) { f.n.remove(); fx.splice(i, 1); }
      }

      // blink every few seconds
      if (t > blinkAt) { blinkT = t; blinkAt = t + 2500 + Math.random() * 3500; }
      flick = Math.max(0, flick - dt * 2.2);

      draw(t, purring);
    }

    function draw(t, purring) {
      const still = reduce();
      const sec = t / 1000;
      const sleeping = asleep();
      // head follows the look target
      const hx = Math.max(-1, Math.min(1, (look.x - 200) / 200)), hy = Math.max(-1, Math.min(1, (look.y - 150) / 150));
      const nod = sleeping ? 6 + Math.sin(sec * 1.6) * 1.5 : 0;
      el.head.setAttribute("transform", `translate(${(hx * 7).toFixed(2)} ${(hy * 5 + nod).toFixed(2)}) rotate(${(hx * 7 + (purring ? Math.sin(sec * 9) * 1.2 : 0)).toFixed(2)} 200 150)`);
      // pupils
      const px = hx * 5.5, py = hy * 4.5, dil = (mood === "playing" ? 1.9 : 1) * 4;
      el.pupils.forEach((p) => { p.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`); p.setAttribute("rx", dil.toFixed(1)); });
      el.glints.forEach((g) => g.setAttribute("transform", `translate(${(px * 0.4).toFixed(2)} ${(py * 0.4).toFixed(2)})`));
      // eye state
      const bk = blinkT > 0 ? (t - blinkT) / 160 : 2;
      const lid = bk < 1 ? Math.abs(1 - bk * 2) : 1;
      const showOpen = !purring && !sleeping;
      el.eyes.setAttribute("opacity", showOpen ? 1 : 0);
      el.eyes.setAttribute("transform", `translate(0 ${102 * (1 - lid)}) scale(1 ${Math.max(0.08, lid)})`);
      el.happy.setAttribute("opacity", purring ? 1 : 0);
      el.sleepy.setAttribute("opacity", sleeping ? 1 : 0);
      el.blushL.setAttribute("opacity", purring ? 0.45 : 0); el.blushR.setAttribute("opacity", purring ? 0.45 : 0);
      // ears twitch toward a moving ball
      const tw = mood === "playing" ? Math.sin(sec * 14) * 3 : 0;
      el.earL.setAttribute("transform", `rotate(${(-tw - (purring ? 6 : 0)).toFixed(2)} 170 80)`);
      el.earR.setAttribute("transform", `rotate(${(tw + (purring ? 6 : 0)).toFixed(2)} 230 80)`);
      // breathing + tail
      const br = still ? 0 : Math.sin(sec * (sleeping ? 1.6 : 2.6)) * (sleeping ? 0.02 : 0.01);
      el.body.setAttribute("transform", `translate(0 263) scale(1 ${(1 + br).toFixed(4)}) translate(0 -263)`);
      const sway = still ? 0 : Math.sin(sec * (mood === "playing" ? 5 : sleeping ? 0.8 : 1.8)) * (sleeping ? 3 : 9);
      el.tail.setAttribute("transform", `rotate(${(sway + flick * 18 * Math.sin(sec * 30)).toFixed(2)} 246 250)`);
      // paw swipe
      let aL = 0, aR = 0;
      if (swipe) {
        const k = Math.min(1, (t - swipe.t0) / 340), a = Math.sin(k * Math.PI) * 62;
        if (swipe.side < 0) aL = a; else aR = -a;
      }
      el.legL.setAttribute("transform", `rotate(${aL.toFixed(2)} 176 205)`);
      el.legR.setAttribute("transform", `rotate(${aR.toFixed(2)} 224 205)`);
      // speech bubble
      el.bubble.setAttribute("opacity", t < sayUntil ? 1 : 0);
      // yarn + loose thread trailing behind
      el.ball.setAttribute("transform", `translate(${ball.x.toFixed(1)} ${ball.y.toFixed(1)}) rotate(${(ball.rot * 57.3).toFixed(1)})`);
      const ex = ball.x - Math.sign(ball.vx || 1) * 34;
      el.thread.setAttribute("d", `M${ball.x.toFixed(1)} ${(ball.y + R - 3).toFixed(1)} Q${((ball.x + ex) / 2).toFixed(1)} ${(FLOOR + 4).toFixed(1)} ${ex.toFixed(1)} ${(FLOOR - 1).toFixed(1)}`);
    }

    function loop(t) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
      last = t;
      step(t, dt);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start(); }).observe(svg);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });

    setMood("curious");
    blinkAt = performance.now() + 1800;
    draw(performance.now(), false);
    start();
    setTimeout(() => say(lines[0], performance.now()), 1200);
    function setAway(on, text, sub) {
      away = on;
      catParts.forEach((g) => g.setAttribute("display", on ? "none" : "inline"));
      svg.querySelector("#pc-away").setAttribute("opacity", on ? 1 : 0);
      svg.querySelector("#pc-away-text").textContent = text || "";
      svg.querySelector("#pc-away-sub").textContent = sub || "";
      if (!on) { lastActive = performance.now(); mood = ""; setMood("curious"); }
      start();
    }
    // where the cat sits on screen, so the free-roaming cat can jump out of (and back into) the panel
    function seat() {
      const r = svg.getBoundingClientRect();
      return { x: r.left + r.width * 0.5, y: r.top + r.height * (262 / H), w: r.width, visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight };
    }
    return { toss, setAway, seat };
  }

  window.Pet = { init };
})();
