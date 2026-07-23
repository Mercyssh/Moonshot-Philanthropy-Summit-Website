import { EFFECTS } from "./config.js";
import { finePointer } from "./utils.js";

/* ============================================================
   EFFECT: AMBIENT_GLOW

   Writes the cursor position to the root element; the CSS paints one
   viewport-anchored radial gradient onto every surface, so the light
   reads as a single sheet crossing the whole page rather than a
   separate highlight per card.
   ============================================================ */
export function initAmbientGlow() {
  if (!EFFECTS.AMBIENT_GLOW || !finePointer()) return;
  const root = document.documentElement;
  root.classList.add("fx-ambient");

  let x = window.innerWidth / 2;
  let y = window.innerHeight * 0.4;

  function write() {
    root.style.setProperty("--glow-x", `${x.toFixed(0)}px`);
    root.style.setProperty("--glow-y", `${y.toFixed(0)}px`);
  }

  // Writing the variable only invalidates style; the browser still
  // recalcs and paints once per frame, so no extra throttle is needed.
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    write();
  }, { passive: true });

  write();
}
