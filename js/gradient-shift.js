import { EFFECTS } from "./config.js";
import { clamp } from "./utils.js";

/* ============================================================
   EFFECT: GRADIENT_SHIFT

   Rotates the brand ramp's hue as the page scrolls. The tokens are
   authored in HSL around --hue-shift, so setting this one variable
   moves every gradient, button and accent together.
   ============================================================ */
const HUE_SHIFT_MAX = -20; // degrees by the time you reach the invite

export function initGradientShift() {
  if (!EFFECTS.GRADIENT_SHIFT) return;
  const root = document.documentElement;
  root.classList.add("fx-huedrift");

  function apply() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    root.style.setProperty("--hue-shift", `${(progress * HUE_SHIFT_MAX).toFixed(2)}deg`);
  }

  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("resize", apply);
  apply();
}
