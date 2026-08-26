/* ============================================================
   SHARED HELPERS
   Used across the effect and render modules.
   ============================================================ */

export const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
