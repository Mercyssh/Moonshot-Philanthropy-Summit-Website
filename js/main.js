/* ============================================================
   ENTRY POINT

   Each feature lives in its own module under js/. This file only
   wires them together on DOMContentLoaded — to work on one feature,
   open its file rather than pulling the whole codebase into memory.

   Effect on/off switches and the shared config live in config.js;
   shared helpers (finePointer, reducedMotion, clamp, seededRandom)
   in utils.js.
   ============================================================ */
import { initScrollStart } from "./scroll-start.js";
import { renderSpeakers } from "./speakers.js";
import { renderAgenda } from "./agenda.js";
import { initNav } from "./nav.js";
import { initCountdown } from "./countdown.js";
import { initHeroStars } from "./hero-stars.js";
import { initScrollReveal } from "./scroll-reveal.js";
import { initInviteForm } from "./invite-form.js";
import { initMagneticButtons } from "./magnetic-buttons.js";
import { initAmbientGlow } from "./ambient-glow.js";
import { initGradientShift } from "./gradient-shift.js";
import { initHeroGlow } from "./hero-glow.js";
import { initCoinCurtain } from "./coin-curtain.js";
import { initHeroRotator } from "./hero-rotator.js";
import { initHeroMarquee } from "./hero-marquee.js";
import { initSpotlightCards } from "./spotlight-cards.js";
import { initSweepBorders } from "./sweep-borders.js";
import { initSpeakerTilt } from "./speaker-tilt.js";
import { initScrambleText } from "./scramble-text.js";
import { initLiquidGlass } from "./liquid-glass.js";
import { initTimelineGlow } from "./timeline-glow.js";

document.addEventListener("DOMContentLoaded", () => {
  initScrollStart();
  renderSpeakers();
  renderAgenda();
  initNav();
  initCountdown();
  initHeroStars();
  initScrollReveal();
  initInviteForm();
  initMagneticButtons();
  initAmbientGlow();
  initGradientShift();
  initHeroGlow();
  initCoinCurtain();
  initHeroRotator();
  initHeroMarquee();
  initSpotlightCards();
  initSweepBorders();
  initSpeakerTilt();
  initScrambleText();
  initLiquidGlass();
  initTimelineGlow();
});
