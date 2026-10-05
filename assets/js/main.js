/*
 * Renders the whole site from /data/*.json.
 * To change content, edit the JSON files. You should not need to touch this file.
 */
(function () {
  "use strict";

  const FILES = ["site", "overview", "contact", "news", "education", "publications", "projects", "skills"];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);

  const esc = (v) => String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const ext = (url) => /^https?:/i.test(url || "") ? ' target="_blank" rel="noopener noreferrer"' : "";

  const ICONS = {
    email: '<path d="M2 4h12v8H2z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="m2 4 6 5 6-5" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    scholar: '<path d="M8 2 1 6l7 4 7-4-7-4Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4 8v3c0 1.1 1.8 2 4 2s4-.9 4-2V8" fill="none" stroke="currentColor" stroke-width="1.3"/>',
    github: '<path fill="currentColor" d="M8 1a7 7 0 0 0-2.2 13.6c.4.1.5-.2.5-.4v-1.3c-2 .4-2.4-.9-2.4-.9-.3-.8-.8-1-.8-1-.6-.4.1-.4.1-.4.7 0 1.1.7 1.1.7.6 1.1 1.6.8 2 .6.1-.5.3-.8.5-.9-1.6-.2-3.2-.8-3.2-3.5 0-.8.3-1.4.7-1.9-.1-.2-.3-.9.1-1.9 0 0 .6-.2 1.9.7a6.6 6.6 0 0 1 3.5 0c1.3-.9 1.9-.7 1.9-.7.4 1 .1 1.7.1 1.9.4.5.7 1.1.7 1.9 0 2.7-1.6 3.3-3.2 3.5.3.2.5.7.5 1.3v2c0 .2.1.5.5.4A7 7 0 0 0 8 1Z"/>',
    linkedin: '<path fill="currentColor" d="M3.5 6h2v7h-2zM4.5 2.7a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM7 6h1.9v1c.3-.5 1-1.1 2.1-1.1 2.2 0 2.5 1.4 2.5 3.3V13h-2V9.6c0-.8 0-1.9-1.2-1.9S9 8.6 9 9.5V13H7z"/>',
    resume: '<path d="M4 1.5h5l3 3v10H4z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 8h4M6 10.5h4" stroke="currentColor" stroke-width="1.3"/>',
  };
  const icon = (k) => ICONS[k] ? `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[k]}</svg>` : "";

  async function load() {
    const out = {};
    await Promise.all(FILES.map(async (f) => {
      const res = await fetch(`data/${f}.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error(`data/${f}.json → HTTP ${res.status}`);
      try { out[f] = await res.json(); }
      catch (e) { throw new Error(`data/${f}.json is not valid JSON (${e.message})`); }
    }));
    return out;
  }

  /* ---------------- Hero ---------------- */
  function renderHero(d) {
    const name = d.contact.name || "";
    const h1 = $("#hero-name");
    h1.setAttribute("aria-label", name);
    let i = 0;
    h1.innerHTML = name.split(" ").map((w) =>
      `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`
    ).join(" ");
    if (!reduce) h1.classList.add("animate");

    const nx = d.overview.highlight;
    const next = $("#hero-next");
    if (nx && nx.text) {
      next.innerHTML = `<span class="lbl">${esc(nx.label || "Next")}</span><span class="txt">${esc(nx.text)}</span>`;
      if (nx.url) { next.href = nx.url; if (/^https?:/.test(nx.url)) { next.target = "_blank"; next.rel = "noopener noreferrer"; } }
    } else next.remove();

    const links = d.contact.links || [];
    const pick = (id) => links.find((l) => l.id === id);
    const r = d.site.resume;
    let html = r && r.path ? `<a class="btn primary" href="${esc(r.path)}" target="_blank" rel="noopener" data-open="resume">${icon("resume")}${esc(r.label || "Résumé")}</a>` : "";
    ["scholar", "github", "linkedin", "email"].forEach((id) => {
      const l = pick(id);
      if (l && l.url) html += `<a class="btn btn-${id}" href="${esc(l.url)}"${ext(l.url)}>${icon(id)}${esc(l.label)}</a>`;
    });
    $("#hero-actions").innerHTML = html;

    // typing roles start after the name has landed
    const roles = d.overview.roles || [];
    const el = $("#role");
    if (!roles.length) return;
    if (reduce) { el.textContent = roles[0]; return; }
    let ri = 0, ci = 0, del = false;
    const tick = () => {
      const word = roles[ri];
      ci += del ? -1 : 1;
      el.textContent = word.slice(0, ci);
      let wait = del ? 35 : 70;
      if (!del && ci === word.length) { del = true; wait = 1900; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 350; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 150 + i * 38 + 500);
  }

  function renderPet(d) {
    const cfg = d.overview.pet || {};
    const name = cfg.name || "Mochi";
    const moods = cfg.moods || {};
    $("#pet-name").textContent = name;
    $("#pet-caption").textContent = cfg.caption || "";
    const out = $("#pet-mood"), fig = $("#pet");
    const pet = window.Pet.init($("#pet-svg"), {
      lines: cfg.lines,
      onMood: (m) => { out.textContent = `${name} ${moods[m] || m}`; fig.dataset.mood = m; },
    });
    // "Free Mochi": she leaves the panel and roams the whole screen (assets/js/roam.js)
    const btn = $("#pet-toss");
    const freeLabel = cfg.freeLabel || `Free ${name}`, backLabel = cfg.recallLabel || `Call ${name} back`;
    btn.textContent = freeLabel;
    if (!window.Roamer) { btn.textContent = "Toss the yarn"; btn.addEventListener("click", () => pet.toss()); return; }
    const roamer = window.Roamer.make({ lines: cfg.lines });
    btn.addEventListener("click", () => {
      if (!roamer.isFree()) {
        const seat = pet.seat();
        pet.setAway(true, cfg.awayText || `${name} is out exploring`, cfg.awaySub || "");
        roamer.free(seat);
        btn.textContent = backLabel;
      } else {
        btn.disabled = true;
        roamer.recall(pet.seat(), () => { pet.setAway(false); btn.textContent = freeLabel; btn.disabled = false; });
      }
    });
  }


  /* ---------------- Sections ---------------- */
  const R = {
    news(d) {
      const items = d.news.news || [];
      return `<ul class="news">${items.map((n) => `
        <li><time>${esc(n.date)}</time>
          <p>${n.url ? `<a href="${esc(n.url)}"${ext(n.url)}>${esc(n.text)}</a>` : esc(n.text)}</p></li>`).join("")}</ul>`;
    },

    education(d) {
      const row = (k, v, first, cls = "") => v ? `<div class="row${first ? " first" : ""}"><span class="k">${k}:</span><span class="v ${cls}">${v}</span></div>` : "";
      const link = (t, u) => u ? `<a href="${esc(u)}"${ext(u)}>${esc(t)}</a>` : esc(t);
      const ed = (d.education.education || []).map((e) => `
        <div class="entry">
          ${row("degree", esc(e.degree), true)}
          ${row("school", link(e.school, e.schoolUrl))}
          ${row("unit", esc(e.unit))}
          ${row("advisor", e.advisor ? link(e.advisor, e.advisorUrl) : "")}
          ${row("group", esc(e.group))}
          ${row("focus", esc(e.focus))}
          ${row("when", esc(e.period), false, e.status === "incoming" ? "badge" : "")}
        </div>`).join("");
      const aw = (d.education.awards || []);
      const awards = aw.length ? `<div class="entry"><div class="row cmt"># awards</div>${aw.map((a) => `
          ${row("award", esc(a.title), true)}${row("result", esc(a.result))}${row("year", esc(a.year))}`).join("")}</div>` : "";
      return `<div class="yaml">${ed}${awards}</div>`;
    },

    publications(d) {
      const P = d.publications;
      const me = (P.me || []).map((s) => s.toLowerCase());
      const list = (P.publications || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
      const types = { all: list.length };
      list.forEach((p) => { types[p.type] = (types[p.type] || 0) + 1; });
      const first = list.filter((p) => me.includes((p.authors[0] || "").toLowerCase())).length;
      const label = { all: "All", journal: "Journal", conference: "Conference", preprint: "Preprint", workshop: "Workshop" };

      const chips = Object.keys(types).map((t, i) =>
        `<button type="button" class="chip" data-filter="${esc(t)}" aria-pressed="${i === 0}">${esc(label[t] || t)}<span class="n">${types[t]}</span></button>`).join("") +
        (first ? `<button type="button" class="chip" data-filter="first" aria-pressed="false">First author<span class="n">${first}</span></button>` : "");

      const years = [...new Set(list.map((p) => p.year))];
      const body = years.map((y) => `
        <div class="year"><h3>${esc(y)}</h3><ol class="pubs" reversed>
          ${list.filter((p) => p.year === y).map((p) => pubItem(p, me)).join("")}
        </ol></div>`).join("");

      return `<div class="pub-tools" role="group" aria-label="Filter publications">${chips}
          ${P.scholarUrl ? `<a class="scholar" href="${esc(P.scholarUrl)}"${ext(P.scholarUrl)}>View on Google Scholar</a>` : ""}
        </div>${body}`;
    },

    projects(d) {
      return `<ol class="projects">${(d.projects.projects || []).map((p) => `
        <li class="proj">
          <div class="proj-meta">${esc(p.period)}</div>
          <h3>${p.link ? `<a href="${esc(p.link)}"${ext(p.link)}>${esc(p.title)}</a>` : esc(p.title)} <span class="company">at ${esc(p.company)}</span></h3>
          <p>${esc(p.description)}</p>
          ${p.achievements && p.achievements.length ? `<ul class="diff" aria-label="Results">${p.achievements.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span>#${esc(t)}</span>`).join("")}</div>` : ""}
        </li>`).join("")}</ol>`;
    },

    skills(d) { return window.Keyboard.render(d.skills, esc); },

    contact(d) {
      const lines = (d.contact.links || []).map((l) => `
        <div class="ln"><span class="ps">$</span><span class="cmd">${esc(l.command || "echo")}</span>${
          l.url ? `<a href="${esc(l.url)}"${ext(l.url)}>${esc(l.value)}</a>` : `<span class="plain">${esc(l.value)}</span>`
        }<span class="lbl"># ${esc(l.label)}</span></div>`).join("");
      return `<div class="term">${lines}<div class="ln"><span class="ps">$</span><span class="cursor" aria-hidden="true"></span></div></div>`;
    },
  };

  function authorsHtml(list, me) {
    return list.map((a) => me.includes(a.toLowerCase()) ? `<span class="me">${esc(a)}</span>` : esc(a)).join(", ");
  }

  function bibtex(p) {
    const f = [];
    const add = (k, v) => { if (v) f.push(`  <span class="tok-key">${k}</span> = {<span class="tok-str">${esc(v)}</span>}`); };
    const isJ = p.type === "journal";
    add("title", p.title);
    add("author", p.authors.join(" and "));
    add(isJ ? "journal" : "booktitle", (p.venue || "").split(",")[0]);
    add("year", p.year);
    add("pages", p.pages && p.pages.replace("–", "--"));
    add("doi", p.doi);
    add("url", p.url);
    return `<span class="tok-fn">@${isJ ? "article" : "inproceedings"}</span>{<span class="tok-num">${esc(p.key)}</span>,\n${f.join(",\n")}\n}`;
  }

  function pubItem(p, me) {
    const href = p.doi ? `https://doi.org/${p.doi}` : p.url;
    const firstAuthor = me.includes((p.authors[0] || "").toLowerCase());
    const id = `pub-${esc(p.key)}`;
    return `<li class="pub" data-type="${esc(p.type)}" data-first="${firstAuthor}">
      <p class="pub-title">${href ? `<a href="${esc(href)}"${ext(href)}>${esc(p.title)}</a>` : esc(p.title)}</p>
      <p class="pub-authors">${authorsHtml(p.authors || [], me)}</p>
      <p class="pub-venue">${esc(p.venue)}${p.pages ? `, pp. ${esc(p.pages)}` : ""}<span class="kind">${esc(p.type)}</span></p>
      <div class="pub-actions">
        ${p.abstract ? `<button type="button" class="linkbtn" aria-expanded="false" aria-controls="${id}-abs">abstract</button>` : ""}
        <button type="button" class="linkbtn" aria-expanded="false" aria-controls="${id}-bib">bibtex</button>
        ${p.doi ? `<a class="linkbtn" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">doi</a>` : ""}
        ${!p.doi && p.url ? `<a class="linkbtn" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">link</a>` : ""}
      </div>
      ${p.abstract ? `<div class="drawer" id="${id}-abs"><div><p class="abstract">${esc(p.abstract)}</p></div></div>` : ""}
      <div class="drawer" id="${id}-bib"><div><div class="bib"><pre><code>${bibtex(p)}</code></pre><button type="button" class="copy">Copy</button></div></div></div>
    </li>`;
  }

  function wirePublications(root) {
    root.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (chip) {
        root.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        const f = chip.dataset.filter;
        root.querySelectorAll(".pub").forEach((p) => {
          const show = f === "all" || (f === "first" ? p.dataset.first === "true" : p.dataset.type === f);
          p.classList.toggle("hidden", !show);
        });
        root.querySelectorAll(".year").forEach((y) => { y.hidden = !y.querySelector(".pub:not(.hidden)"); });
        return;
      }
      const tog = e.target.closest("button.linkbtn[aria-controls]");
      if (tog) {
        const open = tog.getAttribute("aria-expanded") !== "true";
        tog.setAttribute("aria-expanded", String(open));
        document.getElementById(tog.getAttribute("aria-controls")).classList.toggle("open", open);
        return;
      }
      const copy = e.target.closest(".copy");
      if (copy) {
        const text = copy.parentElement.querySelector("code").textContent;
        const ok = () => { copy.textContent = "Copied"; copy.classList.add("done"); setTimeout(() => { copy.textContent = "Copy"; copy.classList.remove("done"); }, 1600); };
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(ok, () => {
          const r = document.createRange(); r.selectNodeContents(copy.parentElement.querySelector("code"));
          const s = getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent = "Press ⌘/Ctrl+C";
        });
      }
    });
  }

  function renderSections(d) {
    const wrap = $("#sections");
    const secs = d.site.sections.filter((s) => s.id !== "about" && R[s.id]);
    wrap.innerHTML = secs.map((s) => `
      <section class="sec${s.layout === "wide" ? " wide" : ""}" id="${esc(s.id)}" data-section aria-labelledby="${esc(s.id)}-h">
        <header class="sec-head">
          <span class="file">${esc(s.file)}</span>
          <h2 id="${esc(s.id)}-h">${esc(s.heading)}</h2>
          ${s.comment ? `<p>${esc(s.comment)}</p>` : ""}
        </header>
        <div class="sec-body">${R[s.id](d)}</div>
      </section>`).join("") +
      `<div class="site-foot"><span>© ${new Date().getFullYear()} ${esc(d.contact.name)}</span><span>${esc(d.site.footer || "")}</span></div>`;
    const pub = $("#publications"); if (pub) wirePublications(pub);
    const sk = $("#skills"); if (sk) window.Keyboard.wire(sk, d.skills, esc);
  }

  /* ---------------- Tabs + status bar ---------------- */
  function renderChrome(d) {
    document.title = d.site.title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && d.site.description) meta.content = d.site.description;
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const k = el.dataset.bind;
      el.textContent = d.site[k] ?? d.overview[k] ?? "";
    });

    const dot = { Markdown: "#66d9ef", YAML: "#e6db74", BibTeX: "#ae81ff", TypeScript: "#66d9ef", JSON: "#e6db74", Shell: "#a6e22e" };
    const tabs = $("#tabs");
    tabs.innerHTML = d.site.sections.map((s) =>
      `<a class="tab" href="#${esc(s.id)}" data-id="${esc(s.id)}" aria-current="false"><span class="ext" style="color:${dot[s.lang] || "#75715e"}" aria-hidden="true"></span>${esc(s.file)}</a>`
    ).join("") + '<span class="tab-marker" aria-hidden="true"></span>';

    const marker = $(".tab-marker", tabs);
    const meta2 = Object.fromEntries(d.site.sections.map((s) => [s.id, s]));
    let current = null;
    const setActive = (id) => {
      if (id === current) return;
      current = id;
      tabs.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-current", String(t.dataset.id === id)));
      const t = tabs.querySelector(`[data-id="${id}"]`);
      if (t) {
        marker.style.width = t.offsetWidth + "px";
        marker.style.transform = `translateX(${t.offsetLeft}px)`;
        const tr = t.getBoundingClientRect(), wr = tabs.getBoundingClientRect();
        if (tr.left < wr.left || tr.right > wr.right) tabs.scrollTo({ left: t.offsetLeft - 24, behavior: reduce ? "auto" : "smooth" });
      }
      $("#sb-file").textContent = meta2[id] ? meta2[id].file : "";
      $("#sb-lang").textContent = meta2[id] ? meta2[id].lang : "";
    };

    const secs = [...document.querySelectorAll("[data-section]")];
    const onScroll = () => {
      const sc = $("#main");
      const y = sc.scrollTop + sc.clientHeight * 0.35;
      let id = secs[0].id;
      for (const s of secs) if (s.offsetTop <= y) id = s.id;
      if (sc.clientHeight + sc.scrollTop >= sc.scrollHeight - 4) id = secs[secs.length - 1].id;
      setActive(id);
      const ln = Math.max(1, Math.round(sc.scrollTop / 26) + 1);
      $("#sb-pos").textContent = `Ln ${ln}, Col 1`;
    };
    $("#main").addEventListener("scroll", onScroll, { passive: true });
    new ResizeObserver(() => { const c = current; current = null; setActive(c); }).observe(tabs);
    onScroll();
    document.fonts && document.fonts.ready.then(() => { const c = current; current = null; setActive(c); });
  }

  load().then((d) => {
    renderHero(d);
    $("[data-bind=bio]").textContent = d.overview.bio || "";
    renderSections(d);
    renderChrome(d);
    try { window.Desktop && window.Desktop.init(d, icon, esc); } catch (e) { console.error(e); }
    try { renderPet(d); } catch (e) { console.error(e); $("#pet").hidden = true; }
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }).catch((err) => {
    console.error(err);
    const box = document.createElement("p");
    box.className = "load-error";
    box.textContent = location.protocol === "file:"
      ? "This page reads its content from data/*.json, and browsers block that when index.html is opened straight from disk. In this folder run:  python3 -m http.server 8000  then open http://localhost:8000"
      : `Could not load site content: ${err.message}`;
    const hero = document.getElementById("about");
    if (location.protocol === "file:" && hero) hero.hidden = true;
    document.getElementById("main").prepend(box);
  });
})();
