import { EFFECTS } from "./config.js";

/* ============================================================
   EFFECT: TIMELINE_GLOW  (mobile only)

   As the agenda timeline scrolls past, the card nearest the
   vertical centre of the viewport lights up (masked glow + border
   highlight, styled in CSS). Rather than snap between cards, each
   card's `--glow` is set from how close it is to the centre, so the
   light lerps smoothly from one card to the next.

   `p` is a fractional card index: the position along the list that
   is currently centred. It is clamped to [0, n-1], so at the top the
   first card stays lit and — the part that matters — once the centre
   passes the last card, the light settles there instead of fading.
   ============================================================ */
export function initTimelineGlow() {
  if (!EFFECTS.TIMELINE_GLOW) return;
  // Purely a small-screen treatment; the desktop timeline has hover.
  if (!window.matchMedia("(max-width: 700px)").matches) return;

  const list = document.getElementById("agendaList");
  if (!list) return;
  const cards = [...list.querySelectorAll(".agenda-item")];
  if (cards.length < 2) return;

  document.documentElement.classList.add("fx-timeline-glow");

  let ticking = false;
  function update() {
    ticking = false;
    const vc = window.innerHeight / 2;
    const n = cards.length;
    const centers = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return r.top + r.height / 2;
    });

    let p;
    if (vc <= centers[0]) p = 0;
    else if (vc >= centers[n - 1]) p = n - 1; // settle on the last card
    else {
      p = n - 1;
      for (let i = 0; i < n - 1; i++) {
        if (vc >= centers[i] && vc <= centers[i + 1]) {
          p = i + (vc - centers[i]) / (centers[i + 1] - centers[i]);
          break;
        }
      }
    }

    // The single most-centred card carries the text shimmer; --glow still
    // lerps the ring across all cards for a smooth handoff.
    const focusIdx = Math.round(p);
    cards.forEach((c, i) => {
      c.style.setProperty("--glow", Math.max(0, 1 - Math.abs(i - p)).toFixed(3));
      c.classList.toggle("is-focused", i === focusIdx);
    });
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}
