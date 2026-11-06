// Hero ASCII wave field, ported from mimir-markets components/hero-ascii/field.ts.
// Cream glyphs that turn coral at the wave peaks. A glyph atlas makes each frame only drawImage calls.
// 20fps, paused off screen, in background tabs and while scrolling; one still frame for reduced motion.
(() => {
  const canvas = document.querySelector(".hero-ascii");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const CHARS = ".:-=+*#%@";
  const ALPHA_STEPS = 6, MIX_STEPS = 4, FADE_STEPS = 6;
  const base = [243, 234, 214], peak = [255, 81, 72];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cols = 0, rows = 0, cell = 16, cw = 9.6, gw = 0, gh = 0, gain = 0.55;
  let atlas = null, dist, fade, colNoise, rowNoise, xs, ys;

  function buildAtlas() {
    const a = document.createElement("canvas");
    a.width = gw * CHARS.length;
    a.height = gh * ALPHA_STEPS * MIX_STEPS;
    const g = a.getContext("2d");
    g.font = `${cell * dpr}px ui-monospace, monospace`;
    for (let ai = 0; ai < ALPHA_STEPS; ai++) for (let mi = 0; mi < MIX_STEPS; mi++) {
      const mix = mi / (MIX_STEPS - 1);
      const alpha = 0.18 + (ai / (ALPHA_STEPS - 1)) * 0.42;
      const c = base.map((v, i) => Math.round(v * (1 - mix) + peak[i] * mix));
      g.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
      const row = ai * MIX_STEPS + mi;
      for (let ci = 0; ci < CHARS.length; ci++) g.fillText(CHARS[ci], ci * gw, row * gh + gh * 0.85);
    }
    return a;
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    cell = width < 640 ? 18 : 16;
    gain = width < 640 ? 0.32 : 0.55;
    cw = cell * 0.6;
    gw = Math.ceil(cw * dpr);
    gh = Math.ceil(cell * dpr);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    cols = Math.ceil(width / cw);
    rows = Math.ceil(height / cell);
    dist = new Float32Array(cols * rows);
    fade = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      const cy = y / rows - 0.5, ey = (y / rows - 0.46) / 0.62;
      for (let x = 0; x < cols; x++) {
        const cx = x / cols - 0.5, ex = (x / cols - 0.5) / 0.72;
        dist[y * cols + x] = Math.sqrt(cx * cx + cy * cy) * 12;
        // Clear around the centre (where the headline sits), full towards the edges.
        const f = Math.min(1, Math.max(0, (Math.sqrt(ex * ex + ey * ey) - 0.18) / 0.6));
        fade[y * cols + x] = Math.round(f * FADE_STEPS);
      }
    }
    colNoise = new Float32Array(cols);
    rowNoise = new Float32Array(rows);
    xs = Int32Array.from({ length: cols }, (_, x) => Math.round(x * cw * dpr));
    ys = Int32Array.from({ length: rows }, (_, y) => Math.round(y * cell * dpr));
    atlas = buildAtlas();
  }

  function paint(frame) {
    if (!atlas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const phase = frame * 0.03, last = CHARS.length - 1;
    for (let x = 0; x < cols; x++) colNoise[x] = Math.sin(x * 0.3 + frame * 0.01) * 0.3;
    for (let y = 0; y < rows; y++) rowNoise[y] = Math.cos(y * 0.3 + frame * 0.02);
    let alphaLevel = -1;
    for (let y = 0; y < rows; y++) {
      const rn = rowNoise[y], dy = ys[y], off = y * cols;
      for (let x = 0; x < cols; x++) {
        const level = fade[off + x];
        if (level === 0) continue;
        if (level !== alphaLevel) { alphaLevel = level; ctx.globalAlpha = (level / FADE_STEPS) * gain; }
        const wave = Math.sin(dist[off + x] - phase) * 0.5 + 0.5;
        let val = wave * 0.7 + colNoise[x] * rn;
        val = val < 0 ? 0 : val > 1 ? 1 : val;
        const ci = (val * last) | 0;
        const ai = Math.round(val * (ALPHA_STEPS - 1));
        const m = (wave - 0.6) * 2.5;
        const mi = m <= 0 ? 0 : Math.round((m > 1 ? 1 : m) * (MIX_STEPS - 1));
        ctx.drawImage(atlas, ci * gw, (ai * MIX_STEPS + mi) * gh, gw, gh, xs[x], dy, gw, gh);
      }
    }
  }

  resize();
  let frame = 0;
  paint(frame);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    addEventListener("resize", () => { resize(); paint(frame); });
    return;
  }

  const frameMs = 1000 / 20;
  let visible = true, scrolling = false, scrollTimer = 0, raf = 0, last = 0;
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (now - last < frameMs) return;
    last = now;
    frame += 1.4 * (frameMs / (1000 / 24));
    paint(frame);
  };
  const sync = () => {
    const run = visible && !scrolling && !document.hidden;
    if (run && !raf) raf = requestAnimationFrame(tick);
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(canvas);
  document.addEventListener("visibilitychange", sync);
  addEventListener("scroll", () => {
    scrolling = true; sync();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling = false; sync(); }, 160);
  }, { passive: true });
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); paint(frame); }, 120); });
  sync();
})();
