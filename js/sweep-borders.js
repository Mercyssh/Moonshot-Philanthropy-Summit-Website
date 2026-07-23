import { EFFECTS } from "./config.js";
import { reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: SWEEP_BORDERS
   Entirely CSS — this just opens the gate.
   ============================================================ */
export function initSweepBorders() {
  if (!EFFECTS.SWEEP_BORDERS || reducedMotion()) return;
  document.documentElement.classList.add("fx-sweep");
}
