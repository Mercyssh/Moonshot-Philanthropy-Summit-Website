import { EFFECTS } from "./config.js";

/* ============================================================
   EFFECT: HERO_MARQUEE  (mobile only)

   The phone stand-in for the desktop rotator: a flat ribbon of summit
   photos scrolling sideways, between the tagline and the date. The set
   is printed twice into the track so the CSS -50% slide loops with no
   seam. Everything visual (size, speed, tint) lives in the CSS under
   .fx-hero-marquee — size is just the container height.
   ============================================================ */
const MARQUEE_IMAGES = [
  "assets/images to mask/1.jpg",
  "assets/images to mask/2.jpg",
  "assets/images to mask/3.jpg",
  "assets/images to mask/4.jpg",
  "assets/images to mask/5.jpg",
];

export function initHeroMarquee() {
  if (!EFFECTS.HERO_MARQUEE) return;
  // Purely a phone treatment; desktop keeps the rotator.
  if (!window.matchMedia("(max-width: 700px)").matches) return;

  const host = document.getElementById("heroMarquee");
  if (!host) return;

  const items = MARQUEE_IMAGES.map(
    (src) =>
      `<div class="hero-marquee__item"><img src="${src}" alt="" loading="lazy" decoding="async"></div>`
  ).join("");
  // Two copies: the animation slides one full copy's width, then repeats.
  host.innerHTML = `<div class="hero-marquee__track">${items}${items}</div>`;

  document.documentElement.classList.add("fx-hero-marquee");
}
