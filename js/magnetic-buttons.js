import { EFFECTS } from "./config.js";
import { reducedMotion, finePointer, clamp } from "./utils.js";

/* ============================================================
   EFFECT: MAGNETIC_BUTTONS
   ============================================================ */
export function initMagneticButtons() {
  if (!EFFECTS.MAGNETIC_BUTTONS || reducedMotion() || !finePointer()) return;
  document.documentElement.classList.add("fx-magnetic");

  const PULL = 0.3;  // fraction of the cursor's offset from centre
  const LIMIT = 9;   // px, so large buttons don't wander far

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) * PULL, -LIMIT, LIMIT);
      const y = clamp((e.clientY - (r.top + r.height / 2)) * PULL, -LIMIT, LIMIT);
      btn.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
      btn.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
    });
    const release = () => {
      btn.style.setProperty("--mag-x", "0px");
      btn.style.setProperty("--mag-y", "0px");
    };
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("blur", release);
  });
}
