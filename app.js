// Progressive enhancement: the page reads fine without this file, without the CDN, and with reduced motion.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Copy buttons
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
    const label = b.querySelector("span") || b;
    const old = label.textContent;
    label.textContent = "Copied";
    setTimeout(() => (label.textContent = old), 1400);
  }));

  // Hero countdown (illustration): ticks down from its starting value.
  const cd = $("[data-countdown]");
  if (cd) {
    let [h, m, s] = cd.textContent.split(":").map(Number);
    let left = h * 3600 + m * 60 + s;
    setInterval(() => {
      left = left > 0 ? left - 1 : 86399;
      const p = (n) => String(n).padStart(2, "0");
      cd.textContent = `${p(Math.floor(left / 3600))}:${p(Math.floor(left / 60) % 60)}:${p(left % 60)}`;
    }, 1000);
  }

  // Cursor glow on product cards
  if (finePointer) $$(".glow").forEach((el) => el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (reduced || !gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, ...(SplitText ? [SplitText] : []));
  document.documentElement.classList.add("motion");

  // Smooth scroll on desktop only; touch scrolls natively.
  let lenis = null;
  if (Lenis && finePointer) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // With Lenis, in-page links glide; without it the browser jumps natively.
  if (lenis) $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id === "#top" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -72 });
  }));

  // Reading progress
  gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  // Fades and staggers
  $$("[data-fade]").forEach((el) => gsap.fromTo(el, { opacity: 0, y: 24 }, {
    opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true },
  }));
  $$("[data-stagger]").forEach((el) => gsap.fromTo(el.children, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true },
  }));

  // Count-ups
  $$("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 92%", once: true } });
  });

  // Hero card: entrance, then 3D tilt with the pointer
  const card = $(".verdict");
  gsap.from(".hero-card", { opacity: 0, y: 40, rotate: 3, duration: 1.2, ease: "power3.out", delay: 0.3 });
  gsap.from(".split-a", { width: "0%", duration: 1.6, ease: "power3.out", delay: 0.8 });
  gsap.from(".float", { opacity: 0, scale: 0.6, duration: 0.8, ease: "back.out(2)", stagger: 0.15, delay: 1.1 });
  if (card && finePointer) {
    const tilt = $("[data-tilt]");
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
    tilt.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 14);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    tilt.addEventListener("pointerleave", () => { rx(0); ry(0); });
  }

  // Headings: line-by-line masked reveal once fonts are in
  document.fonts.ready.then(() => {
    if (!SplitText) return;
    $$("[data-split]").forEach((el, i) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line-inner" });
      const isHero = el.tagName === "H1";
      gsap.from(split.lines, {
        yPercent: 110, duration: isHero ? 1.2 : 1, ease: "power4.out", stagger: 0.1, delay: isHero ? 0.1 : 0,
        scrollTrigger: isHero ? undefined : { trigger: el, start: "top 88%", once: true },
      });
    });
    ScrollTrigger.refresh();
  });

  // How it works: pin and scrub through the steps (desktop)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1001px)", () => {
    const how = $(".how");
    const steps = $$(".how-step");
    const n = steps.length;
    how.setAttribute("data-pinned", "");
    gsap.set(steps.slice(1), { yPercent: 40, opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut", duration: 1 },
      scrollTrigger: { trigger: how, start: "top top", end: `+=${(n - 1) * 100}%`, scrub: 1.1, pin: true, anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), directional: false, delay: 0.15, duration: { min: 0.4, max: 0.9 }, ease: "power2.inOut" } },
    });
    for (let i = 1; i < n; i++) {
      tl.to(".how-digits", { yPercent: (-100 / n) * i }, i - 1)
        .to(steps[i - 1], { yPercent: -40, opacity: 0 }, i - 1)
        .to(steps[i], { yPercent: 0, opacity: 1 }, i - 0.8);
    }
    ScrollTrigger.refresh();
    return () => { how.removeAttribute("data-pinned"); gsap.set(steps, { clearProps: "all" }); };
  });
  mm.add("(max-width: 1000px)", () => {
    gsap.utils.toArray(".how-step").forEach((el) => gsap.from(el, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  });

  // Architecture: draw the edges with the scroll, pop the nodes in order
  const dg = $(".diagram");
  if (dg) {
    const paths = $$(".edges path", dg);
    paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    const nodes = $$(".node", dg);
    // Opacity only: GSAP transforms would replace the nodes' SVG translate().
    gsap.set(nodes, { opacity: 0 });
    gsap.set(".packets", { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: dg, start: "top 75%", end: "bottom 60%", scrub: 0.8 } });
    tl.to(nodes, { opacity: 1, stagger: 0.12, duration: 0.4, ease: "power2.out" }, 0)
      .to(paths, { strokeDashoffset: 0, stagger: 0.1, duration: 0.6, ease: "none" }, 0.3)
      .to(".packets", { opacity: 1, duration: 0.2 });
  }

  // Trust: each card shrinks and dims as the next one stacks over it
  const stack = $$(".stack-card");
  stack.forEach((c, i) => {
    if (i === stack.length - 1) return;
    gsap.to(c, { scale: 0.94 - (stack.length - i) * 0.01, filter: "brightness(0.7)", ease: "none",
      scrollTrigger: { trigger: stack[i + 1], start: "top bottom", end: "top 30%", scrub: true } });
  });

  // Terminal: lines appear one by one when it scrolls into view
  const term = $("[data-term]");
  if (term) {
    const lines = term.innerHTML.split("\n");
    term.innerHTML = "";
    ScrollTrigger.create({ trigger: term, start: "top 75%", once: true, onEnter: () => {
      term.classList.add("typing");
      let i = 0;
      const next = () => {
        if (i >= lines.length) { term.classList.remove("typing"); return; }
        const line = lines[i++];
        term.innerHTML += (i > 1 ? "\n" : "") + line;
        const isCommand = /class="p"/.test(line);
        setTimeout(next, isCommand ? 520 : line.trim() ? 140 : 90);
      };
      next();
    } });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
