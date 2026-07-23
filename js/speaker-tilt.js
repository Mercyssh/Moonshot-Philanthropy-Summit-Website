import { EFFECTS } from "./config.js";
import { reducedMotion, finePointer } from "./utils.js";

/* ============================================================
   EFFECT: SPEAKER_TILT
   ============================================================ */
export function initSpeakerTilt() {
  if (!EFFECTS.SPEAKER_TILT || reducedMotion()) return;
  const cards = [...document.querySelectorAll(".speaker-card")];
  if (!cards.length) return;
  document.documentElement.classList.add("fx-tilt");

  // Touch devices get the idle sway defined in CSS; nothing to wire up.
  if (!finePointer()) {
    document.documentElement.classList.add("fx-tilt-idle");
    return;
  }

  const MAX = 13;      // degrees of rotation at the card's edge
  const LIFT = 1.035;  // slight scale so the photo reads as coming forward

  cards.forEach((card) => {
    const photo = card.querySelector(".speaker-card__photo");
    if (!photo) return;

    card.addEventListener("pointerenter", () => {
      card.classList.add("is-tilting");
      photo.style.setProperty("--tilt-scale", String(LIFT));
    });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      photo.style.setProperty("--tilt-x", `${(-py * MAX).toFixed(2)}deg`);
      photo.style.setProperty("--tilt-y", `${(px * MAX).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      photo.style.setProperty("--tilt-x", "0deg");
      photo.style.setProperty("--tilt-y", "0deg");
      photo.style.setProperty("--tilt-scale", "1");
    });
  });
}
