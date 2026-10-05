/*
 * Skills as 3D keycaps. Every skill in data/skills.json becomes one key, in file order.
 * The small keys above the board are group filters (press again to clear).
 * Hover raises a key, click pins it (pressed down).
 * While the section is on screen, typing a letter on your real keyboard jumps to a skill.
 */
(function () {
  "use strict";
  const GROUP_COLORS = ["#f92672", "#a6e22e", "#66d9ef", "#e6db74", "#ae81ff", "#fd971f"];
  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function groupsOf(S) {
    return S.groups && S.groups.length ? S.groups : [...new Set(S.skills.map((s) => s.group || "Other"))];
  }

  function render(S, esc) {
    const skills = S.skills || [];
    const groups = groupsOf(S);
    const gColor = (g) => GROUP_COLORS[groups.indexOf(g) % GROUP_COLORS.length] || "#75715e";

    const keys = skills.map((s, i) => `<button type="button" class="key sk" style="--c:${esc(s.color || gColor(s.group))};--i:${i}" data-i="${i}" data-g="${esc(s.group || "Other")}"
        aria-pressed="false" aria-label="${esc(s.name)}: ${esc(s.proficiency)} out of 5">
        <span class="cap"><span class="ico" aria-hidden="true">${esc(s.icon || "")}</span><span class="lbl">${esc(s.name)}</span></span></button>`).join("");

    const filters = groups.map((g) => `<button type="button" class="key grp" style="--c:${gColor(g)}" data-group="${esc(g)}" aria-pressed="false">
        <span class="cap"><span class="lbl">${esc(g)}</span></span></button>`).join("");

    return `<div class="kbx">
      <div class="screen">
        <div class="screen-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>skill_details.py</span></div>
        <div class="screen-body" id="sk-screen" aria-live="polite">
          <p class="sk-idle"><span class="tok-comment"># Hover a key to read about a skill.</span><br><span class="tok-comment"># Press it to keep it on screen, or type a letter.</span><br><span class="tok-fn">help</span>(<span class="tok-str">skills</span>)<span class="sk-caret"></span></p>
        </div>
      </div>
      <div class="kb-stage"><div class="kb" id="kb">
        <div class="kb-filters" role="group" aria-label="Filter skills by group">${filters}</div>
        <div class="kb-grid" role="group" aria-label="Skills">${keys}</div>
      </div></div>
    </div>`;
  }

  function stars(v) {
    let h = "";
    for (let i = 1; i <= 5; i++) h += `<i class="${v >= i ? "on" : v > i - 1 ? "half" : ""}"></i>`;
    return `<span class="stars" aria-label="${v} out of 5">${h}</span>`;
  }

  function wire(root, S, esc) {
    const kb = root.querySelector("#kb");
    const screen = root.querySelector("#sk-screen");
    const skills = S.skills || [];
    const keys = [...kb.querySelectorAll(".sk")];
    let pinned = null, shown = -1, typer = 0, group = null;

    function show(i) {
      if (i === shown) return;
      shown = i;
      clearTimeout(typer);
      const s = skills[i];
      if (!s) return;
      const c = esc(s.color || "#a6e22e");
      screen.style.setProperty("--c", s.color || "#a6e22e");
      screen.innerHTML = `
        <div class="sk-head">
          <span class="sk-ico" aria-hidden="true">${esc(s.icon || "")}</span>
          <h3 class="sk-name" style="color:${c}">${esc(s.name)}</h3>
          ${stars(+s.proficiency || 0)}
        </div>
        <p class="sk-meta"><span class="tok-key">group</span> = <span class="tok-str">"${esc(s.group || "Other")}"</span>   <span class="tok-key">level</span> = <span class="tok-num">${esc(s.proficiency)}</span><span class="tok-comment"> / 5</span></p>
        <p class="sk-desc"><span class="txt"></span><span class="sk-caret"></span></p>`;
      const txt = screen.querySelector(".txt");
      const full = s.description || "";
      if (reduce()) { txt.textContent = full; return; }
      let n = 0;
      const step = () => { n += 2; txt.textContent = full.slice(0, n); if (n < full.length) typer = setTimeout(step, 14); };
      step();
    }

    function pin(i) {
      pinned = pinned === i ? null : i;
      keys.forEach((k) => k.setAttribute("aria-pressed", String(+k.dataset.i === pinned)));
      if (pinned !== null) { shown = -1; show(pinned); }
    }

    function setGroup(g) {
      group = group === g ? null : g;
      kb.classList.toggle("filtering", !!group);
      root.querySelectorAll(".grp").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.group === group)));
      keys.forEach((k) => k.classList.toggle("match", k.dataset.g === group));
    }

    kb.addEventListener("pointerover", (e) => { const k = e.target.closest(".sk"); if (k) show(+k.dataset.i); });
    kb.addEventListener("pointerleave", () => { if (pinned !== null) show(pinned); });
    kb.addEventListener("focusin", (e) => { const k = e.target.closest(".sk"); if (k) show(+k.dataset.i); });
    kb.addEventListener("click", (e) => {
      const k = e.target.closest(".sk"); if (k) return pin(+k.dataset.i);
    });
    root.querySelector(".kb-filters").addEventListener("click", (e) => {
      const g = e.target.closest(".grp"); if (g) setGroup(g.dataset.group);
    });

    // Typing on a physical keyboard while the section is visible
    /* ---------- brick layout ----------
       Rows alternate N and N-1 keys. N is picked from the board width so the last row is as full as possible. */
    const grid = kb.querySelector(".kb-grid");
    const MAX_KEY = 106;
    function plan(n, maxN) {
      let best = null;
      for (let N = maxN; N >= Math.max(3, maxN - 3); N--) {
        const rows = []; let left = n, i = 0;
        while (left > 0) { const cap = i % 2 ? N - 1 : N; rows.push(Math.min(cap, left)); left -= cap; i++; }
        const cap = (rows.length - 1) % 2 ? N - 1 : N;
        const score = (cap - rows[rows.length - 1]) + (maxN - N) * 1.5;
        if (!best || score < best.score) best = { N, rows, score };
      }
      return best;
    }
    let lastKey = "";
    function layout() {
      const w = grid.clientWidth;
      if (!w) return;
      const maxN = w >= 900 ? 10 : w >= 680 ? 8 : w >= 460 ? 6 : 5;
      const p = plan(keys.length, maxN);
      const u = Math.min(MAX_KEY, Math.floor(w / p.N));
      kb.style.setProperty("--u", u + "px");
      const sig = p.rows.join(",");
      if (sig === lastKey) return;
      lastKey = sig;
      let k = 0;
      grid.replaceChildren(...p.rows.map((count) => {
        const row = document.createElement("div");
        row.className = "kb-row";
        row.append(...keys.slice(k, k += count));
        return row;
      }));
    }
    layout();
    if ("ResizeObserver" in window) new ResizeObserver(layout).observe(grid);

    let inView = false;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => {
        inView = es[0].isIntersecting;
        if (inView && !kb.classList.contains("landed")) {
          kb.classList.add("landed");
          setTimeout(() => kb.classList.add("settled"), keys.length * 18 + 600);
        }
      }, { threshold: 0.35 });
      io.observe(kb);
    } else kb.classList.add("landed", "settled");

    document.addEventListener("keydown", (e) => {
      if (!inView || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "Escape") { if (group) setGroup(group); if (pinned !== null) pin(pinned); return; }
      if (e.key.length !== 1 || !/[a-z0-9]/i.test(e.key)) return;
      const ch = e.key.toLowerCase();
      const from = pinned === null ? -1 : pinned;
      for (let s = 1; s <= skills.length; s++) {
        const i = (from + s) % skills.length;
        if ((skills[i].name || "").toLowerCase().startsWith(ch)) {
          const key = keys[i];
          key.classList.add("tap"); setTimeout(() => key.classList.remove("tap"), 160);
          if (pinned !== i) pin(i);
          break;
        }
      }
    });
  }

  window.Keyboard = { render, wire };
})();
