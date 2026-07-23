/* ============================================================
   SCROLL REVEAL

   Elements fade in as they enter the viewport, travelling from
   whichever side of the page they sit on. Wide or centred blocks
   have no meaningful side, so they lift instead.
   ============================================================ */
const REVEAL_SELECTOR = [
  ".section .eyebrow",
  ".section__title",
  ".section__lede",
  ".speaker-card",
  ".agenda-item",
  ".about-card",
  ".invite__intro",
  ".invite__form",
  ".footer__brand",
  ".footer__powered",
  ".invite .corner-motif",
].join(",");

function revealDirection(rect) {
  const vw = window.innerWidth;
  // A block spanning most of the viewport doesn't read as "left" or
  // "right" — sliding it sideways just looks like the page is shifting.
  if (rect.width > vw * 0.72) return "up";
  const offset = (rect.left + rect.width / 2 - vw / 2) / vw;
  if (Math.abs(offset) < 0.08) return "up";
  return offset < 0 ? "left" : "right";
}

export function initScrollReveal() {
  const all = [...document.querySelectorAll(REVEAL_SELECTOR)];
  // Drop nested targets (e.g. .section__title inside .invite__intro) —
  // animating both stacks two transforms on the same content.
  const els = all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
  if (!els.length || !("IntersectionObserver" in window)) return;

  // Measure everything first, then write — otherwise the transform we
  // apply to element N shifts the measurement of element N+1.
  // data-reveal-mode opts an element out of position-derived direction.
  const dirs = els.map(
    (el) => el.dataset.revealMode || revealDirection(el.getBoundingClientRect())
  );
  document.documentElement.classList.add("js-reveal");
  els.forEach((el, i) => {
    el.dataset.reveal = dirs[i];
    // Stagger siblings so grid rows cascade rather than snapping in together.
    const idx = [...el.parentElement.children].indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 60, 240)}ms`;
  });

  const settle = (el) => {
    // Drop the attribute once revealed so the reveal transform stops
    // overriding other rules (e.g. .speaker-card:hover's lift).
    el.removeAttribute("data-reveal");
    el.style.transitionDelay = "";
  };

  // Failsafe: a working IntersectionObserver delivers an initial batch for
  // every observed element almost immediately — even ones out of view. If
  // nothing has arrived, the observer isn't running (odd embedded webviews,
  // prerenderers, some headless contexts) and the content would be stranded
  // at opacity 0. Drop the whole effect rather than hide the page.
  let delivered = false;
  setTimeout(() => {
    if (!delivered) document.documentElement.classList.remove("js-reveal");
  }, 3000);

  const io = new IntersectionObserver(
    (entries) => {
      delivered = true;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add("is-visible");
        io.unobserve(el);
        el.addEventListener("transitionend", (e) => {
          if (e.propertyName === "transform") settle(el);
        }, { once: true });
        // Fallback in case transitionend never fires (element already
        // at its resting transform, interrupted transition, etc.)
        setTimeout(() => settle(el), 1200);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );

  els.forEach((el) => io.observe(el));

  // Column layouts change with viewport width, so re-derive the
  // direction of anything still waiting to appear.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const pending = els.filter((el) => el.hasAttribute("data-reveal") && !el.classList.contains("is-visible"));
      if (!pending.length) return;
      // Neutralise the offset transform first, or we'd measure the
      // element 38px away from where it actually sits.
      pending.forEach((el) => el.classList.add("is-measuring"));
      const rects = pending.map((el) => el.getBoundingClientRect());
      pending.forEach((el, i) => {
        el.classList.remove("is-measuring");
        el.dataset.reveal = el.dataset.revealMode || revealDirection(rects[i]);
      });
    }, 150);
  });
}
