/* ============================================================
   PILLAR STEPS

   The three "Why Attend" cards form a descending staircase, and each
   card sits on a subtle grey step. The steps all rest on one floor, so
   the higher a card sits, the taller its step — measured here and fed
   back to CSS as a per-card --step-h.

   Re-runs on resize and once web fonts settle (both change the cards'
   heights). Off below 760px, where the staircase collapses to a stack.
   ============================================================ */
const GAP = 10; // must match the `top: calc(100% + 10px)` on .pillar::before
const BASE = 44; // height of the shortest step (under the lowest card)

export function initPillarSteps() {
  const grid = document.querySelector(".pillars");
  if (!grid) return;
  const pillars = [...grid.querySelectorAll(".pillar")];
  if (pillars.length < 2) return;

  const fit = () => {
    if (window.matchMedia("(max-width: 760px)").matches) {
      pillars.forEach((p) => p.style.removeProperty("--step-h"));
      return;
    }
    // Bottom edge of each card relative to the shared offset parent.
    const bottoms = pillars.map((p) => p.offsetTop + p.offsetHeight);
    const floor = Math.max(...bottoms) + BASE;
    pillars.forEach((p, i) => {
      p.style.setProperty("--step-h", `${Math.max(floor - bottoms[i] - GAP, 0)}px`);
    });
  };

  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(fit, 150);
  });
}
