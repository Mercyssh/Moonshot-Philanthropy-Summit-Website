import { EFFECTS } from "./config.js";
import { finePointer, clamp } from "./utils.js";

/* ============================================================
   HERO: drifting specks

   Each speck is anchored at a fixed %-position and wanders around it
   via `transform` only. Motion is a damped random walk (brownian) with
   a weak spring pulling it home, so specks jitter in place instead of
   slowly migrating off-screen.

   The cursor repulsion / scroll-drift behaviour is gated behind
   EFFECTS.CURSOR_SPECKS.
   ============================================================ */
export function initHeroStars() {
  const field = document.getElementById("heroStars");
  if (!field) return;

  const COUNT = 26;
  const JITTER = 0.15; // random impulse per frame
  const DAMPING = 0.98; // velocity decay
  const SPRING = 0.0008; // pull back toward the anchor point

  /* EFFECT: CURSOR_SPECKS — repulsion constants.
     A speck is pushed until it leaves the radius, so REPEL_R is roughly
     how far one travels on a direct hit. MAX_SPEED is what stops it
     rocketing far past that: without a cap the per-frame impulse
     compounds and specks shoot hundreds of px off-screen. */
  const REPEL_R = 130;    // px bubble the cursor clears around itself
  const REPEL_F = 0.28;   // impulse at the centre of that bubble
  const MAX_SPEED = 1.4;  // px/frame ceiling per axis
  const SCROLL_F = 0.03;  // scroll delta -> impulse (touch devices)
  const SCROLL_MAX = 1.2; // ceiling on that impulse

  const specks = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    const size = 2 + Math.random() * 3;
    const topPct = Math.random() * 90;
    const leftPct = Math.random() * 100;
    el.style.top = `${topPct}%`;
    el.style.left = `${leftPct}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
    frag.appendChild(el);
    // topPct/leftPct are kept so the anchor can be recomputed on resize
    specks.push({ el, topPct, leftPct, ax: 0, ay: 0, dx: 0, dy: 0, vx: 0, vy: 0 });
  }
  field.appendChild(frag);

  // Honour reduced-motion: place the specks, but leave them still.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  const repelOn = EFFECTS.CURSOR_SPECKS;
  const pointer = { x: 0, y: 0, active: false };
  let scrollVel = 0;

  // Anchor positions in viewport px, so cursor distance can be measured.
  function measure() {
    const r = field.getBoundingClientRect();
    for (const s of specks) {
      s.ax = r.left + (s.leftPct / 100) * r.width;
      s.ay = r.top + (s.topPct / 100) * r.height;
    }
  }
  measure();

  if (repelOn) {
    document.documentElement.classList.add("fx-specks");
    if (finePointer()) {
      field.closest(".hero").addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
        measure(); // the hero can move under the cursor while scrolling
      });
      field.closest(".hero").addEventListener("pointerleave", () => {
        pointer.active = false;
      });
    } else {
      // No cursor: the specks get shoved by how fast the page is moving.
      let lastY = window.scrollY;
      window.addEventListener("scroll", () => {
        const y = window.scrollY;
        scrollVel = clamp((y - lastY) * SCROLL_F, -SCROLL_MAX, SCROLL_MAX);
        lastY = y;
      }, { passive: true });
    }
    window.addEventListener("resize", measure);
  }

  let frame = null;
  function step() {
    for (const s of specks) {
      s.vx = (s.vx + (Math.random() - 0.5) * JITTER - s.dx * SPRING) * DAMPING;
      s.vy = (s.vy + (Math.random() - 0.5) * JITTER - s.dy * SPRING) * DAMPING;

      if (repelOn && pointer.active) {
        // Push directly away from the cursor, falling off to nothing at
        // the edge of REPEL_R so there is no hard boundary.
        const px = s.ax + s.dx - pointer.x;
        const py = s.ay + s.dy - pointer.y;
        const d2 = px * px + py * py;
        if (d2 < REPEL_R * REPEL_R && d2 > 0.5) {
          const d = Math.sqrt(d2);
          const force = (1 - d / REPEL_R) * REPEL_F;
          s.vx += (px / d) * force;
          s.vy += (py / d) * force;
        }
      }

      if (repelOn && scrollVel) s.vy += scrollVel;

      s.vx = clamp(s.vx, -MAX_SPEED, MAX_SPEED);
      s.vy = clamp(s.vy, -MAX_SPEED, MAX_SPEED);

      s.dx += s.vx;
      s.dy += s.vy;
      s.el.style.transform = `translate3d(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px, 0)`;
    }
    scrollVel *= 0.86; // bleed the scroll impulse away over a few frames
    if (Math.abs(scrollVel) < 0.01) scrollVel = 0;
    frame = requestAnimationFrame(step);
  }
  const start = () => { if (!frame) frame = requestAnimationFrame(step); };
  const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = null; } };

  // Don't burn frames while the hero is scrolled out of view.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    ).observe(field);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start()
  );
}
