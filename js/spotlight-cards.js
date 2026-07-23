import { EFFECTS } from "./config.js";
import { finePointer, clamp } from "./utils.js";

/* ============================================================
   EFFECT: SPOTLIGHT_CARDS

   The glow is a background-image on the card rather than a
   pseudo-element: .agenda-item::before is already the timeline dot,
   and a pseudo-element would need overflow:hidden to stay inside the
   rounded corners — which would clip that dot away.
   ============================================================ */
const SPOTLIGHT_SELECTOR = ".agenda-item, .about-card";

export function initSpotlightCards() {
  if (!EFFECTS.SPOTLIGHT_CARDS) return;
  const cards = [...document.querySelectorAll(SPOTLIGHT_SELECTOR)];
  if (!cards.length) return;
  document.documentElement.classList.add("fx-spotlight");

  if (finePointer()) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-a", "1");
      });
      card.addEventListener("pointerleave", () => card.style.setProperty("--spot-a", "0"));
    });
    return;
  }

  // Touch: no cursor to follow, so the glow tracks the card's progress
  // up the viewport and fades out as it leaves the middle band.
  let last = 0;
  function trackScroll() {
    const now = Date.now();
    if (now - last < 60) return; // cheap throttle; scroll fires hard on mobile
    last = now;
    const vh = window.innerHeight;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const progress = clamp((vh - r.top) / (vh + r.height), 0, 1);
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", `${(progress * 100).toFixed(1)}%`);
      // brightest when the card is near the middle of the screen
      const centre = 1 - Math.abs(progress - 0.5) * 2;
      card.style.setProperty("--spot-a", clamp(centre * 1.4, 0, 1).toFixed(2));
    }
  }
  window.addEventListener("scroll", trackScroll, { passive: true });
  window.addEventListener("resize", trackScroll);
  trackScroll();
}
