import { EFFECTS } from "./config.js";
import { finePointer, reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: LIQUID_GLASS

   Turns the CSBC "about" card into a frosted glass panel with a
   gradient rim and a glow that trails the cursor. The glow is a
   pseudo-element clipped to the rounded corners; all the visuals
   live in CSS, this only feeds it eased --lg-x / --lg-y and toggles
   presence with --lg-a.
   ============================================================ */
const LG_EASE = 0.12; // fraction of the remaining distance closed per frame

export function initLiquidGlass() {
  if (!EFFECTS.LIQUID_GLASS) return;
  const card = document.querySelector(".about-card--org");
  if (!card) return;

  const root = document.documentElement;
  root.classList.add("fx-liquidglass");

  // No cursor to follow (touch) or motion is unwelcome: the CSS keeps a
  // soft static sheen via the rim and default glow position — nothing to run.
  if (!finePointer() || reducedMotion()) return;

  const REST = { x: 50, y: 30 }; // parks up-left-ish when the pointer leaves
  let tx = REST.x, ty = REST.y;  // target, in % of the card box
  let cx = REST.x, cy = REST.y;  // current, eased toward the target
  let raf = null;

  function step() {
    cx += (tx - cx) * LG_EASE;
    cy += (ty - cy) * LG_EASE;
    card.style.setProperty("--lg-x", `${cx.toFixed(2)}%`);
    card.style.setProperty("--lg-y", `${cy.toFixed(2)}%`);
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
    }
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(step); };

  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 100;
    ty = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty("--lg-a", "1");
    start();
  }, { passive: true });

  card.addEventListener("pointerenter", () => card.style.setProperty("--lg-a", "1"));
  card.addEventListener("pointerleave", () => {
    tx = REST.x;
    ty = REST.y;
    card.style.setProperty("--lg-a", "0");
    start();
  });

  step();
}
