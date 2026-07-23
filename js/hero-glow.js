import { EFFECTS } from "./config.js";
import { finePointer, reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: HERO_GLOW
   Entirely CSS — this just opens the gate.
   ============================================================ */
const HERO_GLOW_EASE = 0.075; // fraction of the remaining distance per frame

export function initHeroGlow() {
  if (!EFFECTS.HERO_GLOW) return;
  const hero = document.querySelector(".hero");
  const glow = hero && hero.querySelector(".hero__glow");
  if (!glow) return;

  const root = document.documentElement;
  root.classList.add("fx-heroglow");

  // Touch devices and reduced-motion get the CSS drift instead; there is
  // no cursor to follow and no per-frame work to do.
  if (!finePointer() || reducedMotion()) {
    root.classList.add("fx-heroglow-idle");
    return;
  }

  const REST = { x: 30, y: 42 }; // where it parks when the pointer leaves
  let tx = REST.x, ty = REST.y;  // target, in % of the hero box
  let cx = REST.x, cy = REST.y;  // current, eased toward the target
  let raf = null;

  function step() {
    cx += (tx - cx) * HERO_GLOW_EASE;
    cy += (ty - cy) * HERO_GLOW_EASE;
    glow.style.setProperty("--hgx", `${cx.toFixed(2)}%`);
    glow.style.setProperty("--hgy", `${cy.toFixed(2)}%`);
    // Stop once it has effectively arrived, so an idle page costs nothing.
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
    }
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(step); };

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 100;
    ty = ((e.clientY - r.top) / r.height) * 100;
    start();
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    tx = REST.x;
    ty = REST.y;
    start();
  });

  step();
}
