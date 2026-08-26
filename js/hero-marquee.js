import { EFFECTS, HERO_IMAGES } from "./config.js";
import { reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: HERO_MARQUEE  (mobile only)

   The phone stand-in for the desktop rotator: a flat ribbon of summit
   photos scrolling sideways, between the tagline and the date. The set
   is printed twice into the track so wrapping the offset by one copy's
   width loops with no seam.

   The scroll is driven here rather than in CSS so the same position can
   be moved two ways: an auto-drift over time, and a finger drag. One rAF
   loop owns the transform; a drag adds to the offset directly and, on
   release, hands a little momentum back before the drift takes over.
   Speed/size/tint tuning still lives in the CSS under .fx-hero-marquee.
   ============================================================ */
export function initHeroMarquee() {
  if (!EFFECTS.HERO_MARQUEE) return;
  // Purely a phone treatment; desktop keeps the rotator.
  if (!window.matchMedia("(max-width: 700px)").matches) return;

  const host = document.getElementById("heroMarquee");
  if (!host) return;

  const items = HERO_IMAGES.map(
    (src) =>
      `<div class="hero-marquee__item"><img src="${src}" alt="" loading="lazy" decoding="async" draggable="false"></div>`
  ).join("");
  // Two copies: wrapping the offset by one copy's width loops seamlessly.
  host.innerHTML = `<div class="hero-marquee__track">${items}${items}</div>`;
  document.documentElement.classList.add("fx-hero-marquee");

  const track = host.querySelector(".hero-marquee__track");
  const reduce = reducedMotion();

  // pos = leftward offset in px, wrapped to [0, half). half = one copy's
  // width. velocity carries drag momentum (px/frame) that decays after
  // release. autoPxPerSec is derived from --marquee-speed once measured.
  let half = 0;
  let pos = 0;
  let velocity = 0;
  let autoPxPerSec = 0;
  let dragging = false;
  let lastX = 0;
  let last = performance.now();

  const measure = () => {
    half = track.scrollWidth / 2;
    const dur =
      parseFloat(getComputedStyle(host).getPropertyValue("--marquee-speed")) ||
      50;
    autoPxPerSec = half / dur; // one copy passes per --marquee-speed seconds
  };

  const wrap = (v) => (half ? ((v % half) + half) % half : v);

  const frame = (now) => {
    const dt = Math.min(now - last, 64) / 1000; // clamp tab-switch gaps
    last = now;

    if (!dragging) {
      // release momentum, decaying toward the steady auto-drift
      if (Math.abs(velocity) > 0.05) {
        pos -= velocity;
        velocity *= 0.9;
      } else {
        velocity = 0;
      }
      if (!reduce) pos += autoPxPerSec * dt;
    }

    pos = wrap(pos);
    track.style.transform = `translate3d(${-pos}px,0,0)`;
    requestAnimationFrame(frame);
  };

  // ---- drag (Pointer Events cover touch + mouse) ------------------
  const onDown = (e) => {
    dragging = true;
    velocity = 0;
    lastX = e.clientX;
    host.classList.add("is-dragging");
    if (e.pointerId != null) {
      try {
        host.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    }
  };

  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    pos -= dx; // drag right → images follow the finger right
    velocity = dx; // remembered for release momentum
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    host.classList.remove("is-dragging");
  };

  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  // vertical page scroll steals the gesture and fires pointercancel
  host.addEventListener("pointercancel", onUp);

  // Widths follow from the fixed height via the 3:2 aspect, so they're
  // known at layout time; re-measure on resize/rotate all the same.
  measure();
  window.addEventListener("resize", measure);
  requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(frame);
  });
}
