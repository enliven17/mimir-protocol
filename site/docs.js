// Docs: search, mobile menu, active heading in "On this page".
(() => {
  const $ = (s) => document.querySelector(s);

  // Mobile menu
  const menu = $(".menu"), side = $("#sidebar");
  menu?.addEventListener("click", () => {
    const open = side.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });

  // Search: a small JSON index built with the site, loaded on first focus.
  const q = $("#q"), box = $("#results");
  let index = null, sel = -1;
  const load = async () => { index ??= await fetch("/search.json").then((r) => r.json()).catch(() => []); };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const run = () => {
    const term = q.value.trim().toLowerCase();
    if (!term || !index) { box.hidden = true; return; }
    const words = term.split(/\s+/);
    const hits = index
      .map((p) => {
        const hay = (p.title + " " + p.text).toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const score = (p.title.toLowerCase().includes(term) ? 10 : 0) + words.reduce((n, w) => n + hay.split(w).length - 1, 0);
        const at = p.text.toLowerCase().indexOf(words[0]);
        const snip = at < 0 ? "" : p.text.slice(Math.max(0, at - 40), at + 80).trim();
        return { p, score, snip };
      })
      .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 8);
    sel = -1;
    box.innerHTML = hits.length
      ? hits.map((h) => `<a href="/docs/${h.p.slug}">${esc(h.p.title)}<span>${esc(h.p.group)}${h.snip ? " · …" + esc(h.snip) + "…" : ""}</span></a>`).join("")
      : "<p>No results</p>";
    box.hidden = false;
  };
  q?.addEventListener("focus", load);
  q?.addEventListener("input", async () => { await load(); run(); });
  q?.addEventListener("keydown", (e) => {
    const items = [...box.querySelectorAll("a")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((a, i) => a.classList.toggle("on", i === sel));
    } else if (e.key === "Enter" && items[Math.max(sel, 0)]) {
      location.href = items[Math.max(sel, 0)].href;
    } else if (e.key === "Escape") { box.hidden = true; q.blur(); }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) box.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== q && !/input|textarea/i.test(document.activeElement?.tagName)) { e.preventDefault(); q?.focus(); }
  });

  // Highlight the heading in view
  const links = new Map([...document.querySelectorAll(".toc a")].map((a) => [a.hash.slice(1), a]));
  if (links.size) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) {
        links.forEach((a) => a.classList.remove("on"));
        links.get(en.target.id)?.classList.add("on");
      }
    }, { rootMargin: "-80px 0px -70% 0px" });
    document.querySelectorAll("article h2[id], article h3[id]").forEach((h) => io.observe(h));
  }
})();
