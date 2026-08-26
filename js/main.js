/* ============================================================
   ENTRY POINT

   Each feature lives in its own module under js/. This file only
   wires them together on DOMContentLoaded — to work on one feature,
   open its file rather than pulling the whole codebase into memory.

   Effect on/off switches and the shared config live in config.js;
   shared helpers (finePointer, reducedMotion, clamp) in utils.js.
   ============================================================ */
import { initScrollStart } from "./scroll-start.js";
import { renderSpeakers } from "./speakers.js";
import { renderAgenda, initAgendaRail } from "./agenda.js";
import { initPillarSteps } from "./pillars.js";
import { initQuoteWaves } from "./quote-waves.js";
import { initNav } from "./nav.js";
import { initHeroStars } from "./hero-stars.js";
import { initScrollReveal } from "./scroll-reveal.js";
import { initInviteForm } from "./invite-form.js";
import { initMagneticButtons } from "./magnetic-buttons.js";
import { initHeroGlow } from "./hero-glow.js";
import { initHeroRotator } from "./hero-rotator.js";
import { initHeroMarquee } from "./hero-marquee.js";
import { initScrambleText } from "./scramble-text.js";
import { initLiquidGlass } from "./liquid-glass.js";
import { initTimelineGlow } from "./timeline-glow.js";
import { initFloatingCta } from "./floating-cta.js";

document.addEventListener("DOMContentLoaded", () => {
  initScrollStart();
  renderSpeakers();
  renderAgenda();
  initNav();
  initHeroStars();
  initScrollReveal();
  initInviteForm();
  initMagneticButtons();
  initHeroGlow();
  initHeroRotator();
  initHeroMarquee();
  initScrambleText();
  initLiquidGlass();
  initTimelineGlow();
  initFloatingCta();
  initAgendaRail();
  initPillarSteps();
  initQuoteWaves();
});
