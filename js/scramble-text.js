import { EFFECTS } from "./config.js";
import { reducedMotion } from "./utils.js";

/* ============================================================
   EFFECT: SCRAMBLE_TEXT
   ============================================================ */
const SCRAMBLE_SELECTOR = ".hero__tagline, .section__title";

export function initScrambleText() {
  if (!EFFECTS.SCRAMBLE_TEXT || reducedMotion()) return;
  const targets = [...document.querySelectorAll(SCRAMBLE_SELECTOR)];
  if (!targets.length) return;
  document.documentElement.classList.add("fx-scramble");

  const GLYPHS = "!<>-_\\/[]{}=+*^?#01x";
  const STEP_MS = 34;
  const PER_STEP = 2.2; // characters resolved per frame

  function scramble(el) {
    if (el.dataset.scrambled) return;
    el.dataset.scrambled = "1";

    // Walk text nodes rather than swapping innerHTML, so inline children
    // survive: the styled × and = in the tagline, and the envelope icon
    // in "Reserve your seat" would both be destroyed by a text swap.
    const parts = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue.trim()) parts.push({ node: n, text: n.nodeValue });
    }
    if (!parts.length) return;
    const total = parts.reduce((sum, p) => sum + p.text.length, 0);

    // Substituted glyphs have different widths and can rewrap a heading,
    // shifting the page beneath it. Pin the box for the duration.
    el.style.height = `${el.getBoundingClientRect().height}px`;
    el.classList.add("is-scrambling");

    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const resolved = Math.floor(frame * PER_STEP);

      if (resolved >= total) {
        clearInterval(id);
        parts.forEach((p) => { p.node.nodeValue = p.text; });
        el.classList.remove("is-scrambling");
        el.style.height = "";
        return;
      }

      let seen = 0;
      for (const p of parts) {
        let out = "";
        for (let i = 0; i < p.text.length; i++, seen++) {
          const ch = p.text[i];
          out += seen < resolved || /\s/.test(ch)
            ? ch
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        p.node.nodeValue = out;
      }
    }, STEP_MS);
  }

  if (!("IntersectionObserver" in window)) {
    targets.forEach(scramble);
    return;
  }

  let delivered = false;
  const io = new IntersectionObserver((entries) => {
    delivered = true;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      scramble(entry.target);
      io.unobserve(entry.target);
    }
  }, { threshold: 0.25 });
  targets.forEach((el) => io.observe(el));

  // Failsafe only if the observer never reports at all — otherwise this
  // would resolve headings that are still far below the fold.
  setTimeout(() => {
    if (!delivered) targets.forEach(scramble);
  }, 3000);
}
