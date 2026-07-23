/* ============================================================
   SHARED HELPERS
   Used across the effect and render modules.
   ============================================================ */

export const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* Deterministic pseudo-random generator (mulberry32). Given the same
   seed it always produces the same sequence, which is what lets a
   scattered layout be pinned down once you like it. Returns a function
   that behaves like Math.random(). */
export function seededRandom(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
