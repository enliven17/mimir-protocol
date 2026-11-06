// Landing motion. The page reads fine without it (no JS, no CDN, reduced motion).
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (reduced || !gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, ...(SplitText ? [SplitText] : []));
  document.documentElement.classList.add("motion");

  // Smooth scroll on desktop pointers only.
  if (Lenis && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
    }));
  }

  const ease = "power3.out";
  const inView = (el, start = "top 88%") => ({ trigger: el, start, once: true });

  $$("[data-reveal]").forEach((el) => gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease, scrollTrigger: inView(el) }));
  $$("[data-stagger]").forEach((el) => gsap.fromTo(el.children, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.08, scrollTrigger: inView(el) }));
  $$("[data-row]").forEach((el) => gsap.fromTo(el, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.8, ease, scrollTrigger: inView(el, "top 92%") }));

  // Headlines: masked line reveal once the fonts have loaded.
  document.fonts.ready.then(() => {
    if (!SplitText) return;
    $$("[data-split]").forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines" });
      const hero = el.tagName === "H1";
      gsap.from(split.lines, { yPercent: 110, duration: hero ? 1.25 : 1, ease: "power4.out", stagger: 0.1, delay: hero ? 0.05 : 0, scrollTrigger: hero ? undefined : inView(el) });
    });
    ScrollTrigger.refresh();
  });

  // Hero rail: the line draws in, then the stops light up one by one.
  const stops = $$(".rail li");
  gsap.timeline({ delay: 0.5 })
    .from(".rail-fill", { scaleX: 0, duration: 1.6, ease: "power2.inOut" })
    .from(stops, { opacity: 0, y: 10, duration: 0.6, ease, stagger: 0.14 }, 0.15);

  // Architecture: draw the edges with the scroll and fade the nodes in.
  // Opacity only on nodes: a GSAP transform would replace their SVG translate().
  const dg = document.querySelector(".diagram");
  if (dg) {
    const paths = $$(".edges path", dg);
    paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    const nodes = $$(".node", dg);
    gsap.set(nodes, { opacity: 0 });
    gsap.set(".packets", { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: dg, start: "top 78%", end: "bottom 65%", scrub: 0.8 } })
      .to(nodes, { opacity: 1, stagger: 0.1, duration: 0.4 }, 0)
      .to(paths, { strokeDashoffset: 0, stagger: 0.08, duration: 0.6, ease: "none" }, 0.3)
      .to(".packets", { opacity: 1, duration: 0.2 });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
