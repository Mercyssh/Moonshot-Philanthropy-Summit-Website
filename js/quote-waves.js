import { EFFECTS } from "./config.js";
import { reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: QUOTE_WAVES

   Two flowing sine waves behind the pull-quote, drawn on a 2D canvas
   and animated in opposite phase so they weave past each other. The
   brand gradient runs along each line; overall subtlety is set by the
   canvas opacity in CSS (.pullquote__waves).

   Reduced motion: the two waves are drawn once, static.
   ---- tuning ----------------------------------------------------
   WAVE_AMP     peak height of each wave, capped to a share of the band
   WAVE_FREQ    number of full undulations across the width
   WAVE_SPEED   phase advance per millisecond (drift speed)
   WAVE_WIDTH   stroke thickness in CSS px
   ============================================================ */
const WAVE_FREQ = 1.4;
const WAVE_SPEED = 0.0006;
const WAVE_WIDTH = 2;

export function initQuoteWaves() {
  if (!EFFECTS.QUOTE_WAVES) return;
  const canvas = document.getElementById("quoteWaves");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const host = canvas.parentElement; // .pullquote
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = host.getBoundingClientRect();
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function grad() {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#DF5830");
    g.addColorStop(0.5, "#AE1E50");
    g.addColorStop(1, "#511C49");
    return g;
  }

  // One wave, drawn past both edges so its moving endpoints never show.
  function wave(phase, yBase, amp) {
    ctx.beginPath();
    for (let x = -40; x <= w + 40; x += 6) {
      const y = yBase + amp * Math.sin((x / w) * WAVE_FREQ * Math.PI * 2 + phase);
      x === -40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function paint(phase) {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = WAVE_WIDTH;
    ctx.strokeStyle = grad();
    const amp = Math.min(h * 0.16, 40);
    // two lines, opposite phase, anchored either side of the mid-line
    wave(phase, h * 0.42, amp);
    wave(phase + Math.PI, h * 0.58, amp);
  }

  resize();

  if (reducedMotion()) {
    paint(0);
    window.addEventListener("resize", () => {
      resize();
      paint(0);
    });
    return;
  }

  let raf = null;
  function frame(t) {
    paint(t * WAVE_SPEED);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  window.addEventListener("resize", resize);

  // Idle the loop while the section is off-screen.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && raf === null) {
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && raf !== null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      },
      { threshold: 0 }
    );
    io.observe(host);
  }
}
