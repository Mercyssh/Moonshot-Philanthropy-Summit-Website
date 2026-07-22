/* ============================================================
   CONFIG
   Paste your Google Apps Script Web App URL here once deployed.
   See README.md → "Connecting the form to Google Sheets".
   ============================================================ */
const GOOGLE_SHEETS_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

/* ============================================================
   INTERACTION EFFECTS — ON/OFF SWITCHES

   Flip any of these to false to remove that effect completely.
   Each one is gated behind an `fx-*` class that this file adds to
   <html>, so switching it off disables the CSS as well as the JS —
   nothing is left behind and nothing needs deleting.

   MAGNETIC_BUTTONS  Buttons drift toward the cursor, snap back on
                     leave. Desktop pointers only.
   SPOTLIGHT_CARDS   Soft radial glow tracks the cursor across the
                     agenda and about cards. On touch devices the
                     glow follows scroll position instead.
   SWEEP_BORDERS     A light streak travels around the card edge on
                     hover (agenda + about cards).
   SPEAKER_TILT      Speaker photos rotate slightly toward the
                     cursor. On touch devices they sway gently.
   SCRAMBLE_TEXT     Headings resolve out of random glyphs the first
                     time each one comes into view.
   AMBIENT_GLOW      One soft light follows the cursor across the whole
                     page — sections and cards alike — instead of
                     lighting each card on its own. Desktop only.
   CURSOR_SPECKS     The hero specks scatter away from the cursor. On
                     touch devices they drift with scroll velocity.
   GRADIENT_SHIFT    The brand ramp rotates hue slightly as you scroll
                     from the hero down to the invite section.
   HERO_GLOW         A soft pool of light follows the cursor across the
                     hero's gradient, with easing. Touch devices and
                     reduced-motion get a slow automatic drift instead.
   COIN_CURTAIN      3D coins rise across the hero/speakers seam,
                     wiping the gradient away to the paper surface
                     beneath. Fewer coins on small screens.
   ============================================================ */
const EFFECTS = {
  MAGNETIC_BUTTONS: true,
  SPOTLIGHT_CARDS: false,
  SWEEP_BORDERS: false,
  SPEAKER_TILT: true,
  SCRAMBLE_TEXT: true,
  AMBIENT_GLOW: false,
  CURSOR_SPECKS: true,
  GRADIENT_SHIFT: false,
  HERO_GLOW: true,
  COIN_CURTAIN: true,
};

/* Shared helpers for the effects below. */
const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* ============================================================
   SPEAKERS DATA
   Add/remove/edit speakers here — the grid updates automatically.
   `photo` is optional; leave blank to show initials on a gradient.
   ============================================================ */
const SPEAKERS = [
  { name: "Pramath Sinha", role: "Founder, Ashoka University", photo: "../assets/pramath.png" },
  { name: "Sharon Barnhardt", role: "Director, CSBC, Ashoka University", photo: "../assets/sharon.png" },
  { name: "Dr. Pavan Mamidi", role: "Director, CSBC, Ashoka University", photo: "../assets/pavan.png" },
  { name: "Pooja Haldea", role: "Senior Advisor, CSBC, Ashoka University", photo: "../assets/pooja.png" },
  { name: "Lorem Ipsum", role: "Chief AI Officer, Example Foundation", photo: "../assets/placeholder.png" },
  { name: "Amit Placeholder", role: "Partner, Sample Capital", photo: "../assets/placeholder.png" },
];

/* ============================================================
   AGENDA DATA
   Add/remove/edit agenda stages here.
   ============================================================ */
const AGENDA = [
  {
    time: "11:00",
    end: "11:30",
    title: "Arrival & Registration",
    desc: "Lorem ipsum dolor sit amet — coffee, check-in and informal introductions before the working sessions begin.",
  },
  {
    time: "11:30",
    end: "12:15",
    title: "Framing the Moonshot",
    desc: "Why behavioural science and AI need each other to move interventions from pilot to population scale.",
  },
  {
    time: "12:15",
    end: "13:00",
    title: "Panel: Evidence to Impact",
    desc: "A working panel on translating rigorous trials into deployable, AI-assisted programmes.",
  },
  {
    time: "13:00",
    end: "14:00",
    title: "Lunch & Working Groups",
    desc: "Small-group discussions on funding models, measurement and the risks of scaling too fast.",
  },
  {
    time: "14:00",
    end: "14:45",
    title: "Case Studies @ Scale",
    desc: "Short presentations from organisations that have taken a behavioural intervention nationwide.",
  },
  {
    time: "14:45",
    end: "15:00",
    title: "Closing & Next Steps",
    desc: "Committing to a shared agenda for the next twelve months, and how to stay involved.",
  },
];

/* ============================================================
   RENDER: SPEAKERS
   ============================================================ */
// Photos are supplied already framed, so they render as a plain <img>.
const SPEAKER_PLACEHOLDER = "assets/speaker-placeholder.png";

function renderSpeakers() {
  const grid = document.getElementById("speakersGrid");
  if (!grid) return;
  grid.innerHTML = SPEAKERS.map(
    (s) => `
    <article class="speaker-card">
      <img class="speaker-card__photo" src="${s.photo || SPEAKER_PLACEHOLDER}"
           alt="${s.name}" width="400" height="380" loading="lazy">
      <p class="speaker-card__name">${s.name}</p>
      <p class="speaker-card__role">${s.role}</p>
    </article>`
  ).join("");
}

/* ============================================================
   RENDER: AGENDA
   ============================================================ */
function renderAgenda() {
  const list = document.getElementById("agendaList");
  if (!list) return;
  list.innerHTML = AGENDA.map(
    (a) => `
    <div class="agenda-item">
      <p class="agenda-item__time">${a.time}${a.end ? ` – ${a.end}` : ""}</p>
      <div class="agenda-item__body">
        <p class="agenda-item__title">${a.title}</p>
        <p class="agenda-item__desc">${a.desc}</p>
      </div>
    </div>`
  ).join("");
}

/* ============================================================
   COUNTDOWN

   Explicit +05:30 offset so the target is the event's local start
   time in Mumbai regardless of where the visitor is.
   ============================================================ */
const EVENT_START = new Date("2026-08-26T11:00:00+05:30");

function initCountdown() {
  const root = document.getElementById("heroCountdown");
  if (!root) return;

  const fields = {
    days: root.querySelector('[data-cd="days"]'),
    hours: root.querySelector('[data-cd="hours"]'),
    minutes: root.querySelector('[data-cd="minutes"]'),
    seconds: root.querySelector('[data-cd="seconds"]'),
  };
  if (Object.values(fields).some((f) => !f)) return;

  let timer = null;

  // Retrigger the glitch animation on a digit whose value just changed.
  // The class has to come off and go back on with a reflow between, or
  // the browser treats it as the same running animation and skips it.
  function flicker(el) {
    const tile = el.closest(".cd__unit");
    el.classList.remove("is-tick");
    if (tile) tile.classList.remove("is-tick");
    void el.offsetWidth;
    el.classList.add("is-tick");
    if (tile) tile.classList.add("is-tick");
  }

  function set(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    flicker(el);
  }

  function tick() {
    const diff = EVENT_START.getTime() - Date.now();

    if (diff <= 0) {
      // Past the start time — replace the tiles with a single message
      // rather than counting up into negative numbers.
      root.classList.add("is-live");
      root.innerHTML =
        '<div class="cd__unit cd__unit--live">' +
        '<span class="cd__num cd__num--live">The Event is Live!</span>' +
        "</div>";
      if (timer) clearInterval(timer);
      timer = null;
      return;
    }

    const total = Math.floor(diff / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    set(fields.days, String(Math.floor(total / 86400)));
    set(fields.hours, pad(Math.floor((total % 86400) / 3600)));
    set(fields.minutes, pad(Math.floor((total % 3600) / 60)));
    set(fields.seconds, pad(total % 60));
  }

  tick();
  root.hidden = false; // only revealed once it holds real numbers
  timer = setInterval(tick, 1000);

  // Drop the interval while the tab is hidden, then resync on return.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (timer) { clearInterval(timer); timer = null; }
    } else if (!timer && !root.classList.contains("is-live")) {
      tick();
      timer = setInterval(tick, 1000);
    }
  });
}

/* ============================================================
   NAV: scroll state + mobile menu
   ============================================================ */
function initNav() {
  const nav = document.getElementById("siteNav");
  const burger = document.getElementById("navBurger");
  const mobile = document.getElementById("navMobile");

  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    },
    { passive: true }
  );

  const setMenu = (open) => {
    mobile.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  burger.addEventListener("click", () => {
    setMenu(!mobile.classList.contains("is-open"));
  });
  mobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  // the drawer is display:none above 860px — make sure state can't get stuck
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 860) setMenu(false);
  });
}

/* ============================================================
   HERO: drifting specks

   Each speck is anchored at a fixed %-position and wanders around it
   via `transform` only. Motion is a damped random walk (brownian) with
   a weak spring pulling it home, so specks jitter in place instead of
   slowly migrating off-screen.
   ============================================================ */
function initHeroStars() {
  const field = document.getElementById("heroStars");
  if (!field) return;

  const COUNT = 26;
  const JITTER = 0.15; // random impulse per frame
  const DAMPING = 0.98; // velocity decay
  const SPRING = 0.0008; // pull back toward the anchor point

  /* EFFECT: CURSOR_SPECKS — repulsion constants.
     A speck is pushed until it leaves the radius, so REPEL_R is roughly
     how far one travels on a direct hit. MAX_SPEED is what stops it
     rocketing far past that: without a cap the per-frame impulse
     compounds and specks shoot hundreds of px off-screen. */
  const REPEL_R = 130;    // px bubble the cursor clears around itself
  const REPEL_F = 0.28;   // impulse at the centre of that bubble
  const MAX_SPEED = 1.4;  // px/frame ceiling per axis
  const SCROLL_F = 0.03;  // scroll delta -> impulse (touch devices)
  const SCROLL_MAX = 1.2; // ceiling on that impulse

  const specks = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    const size = 2 + Math.random() * 3;
    const topPct = Math.random() * 90;
    const leftPct = Math.random() * 100;
    el.style.top = `${topPct}%`;
    el.style.left = `${leftPct}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
    frag.appendChild(el);
    // topPct/leftPct are kept so the anchor can be recomputed on resize
    specks.push({ el, topPct, leftPct, ax: 0, ay: 0, dx: 0, dy: 0, vx: 0, vy: 0 });
  }
  field.appendChild(frag);

  // Honour reduced-motion: place the specks, but leave them still.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  const repelOn = EFFECTS.CURSOR_SPECKS;
  const pointer = { x: 0, y: 0, active: false };
  let scrollVel = 0;

  // Anchor positions in viewport px, so cursor distance can be measured.
  function measure() {
    const r = field.getBoundingClientRect();
    for (const s of specks) {
      s.ax = r.left + (s.leftPct / 100) * r.width;
      s.ay = r.top + (s.topPct / 100) * r.height;
    }
  }
  measure();

  if (repelOn) {
    document.documentElement.classList.add("fx-specks");
    if (finePointer()) {
      field.closest(".hero").addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
        measure(); // the hero can move under the cursor while scrolling
      });
      field.closest(".hero").addEventListener("pointerleave", () => {
        pointer.active = false;
      });
    } else {
      // No cursor: the specks get shoved by how fast the page is moving.
      let lastY = window.scrollY;
      window.addEventListener("scroll", () => {
        const y = window.scrollY;
        scrollVel = clamp((y - lastY) * SCROLL_F, -SCROLL_MAX, SCROLL_MAX);
        lastY = y;
      }, { passive: true });
    }
    window.addEventListener("resize", measure);
  }

  let frame = null;
  function step() {
    for (const s of specks) {
      s.vx = (s.vx + (Math.random() - 0.5) * JITTER - s.dx * SPRING) * DAMPING;
      s.vy = (s.vy + (Math.random() - 0.5) * JITTER - s.dy * SPRING) * DAMPING;

      if (repelOn && pointer.active) {
        // Push directly away from the cursor, falling off to nothing at
        // the edge of REPEL_R so there is no hard boundary.
        const px = s.ax + s.dx - pointer.x;
        const py = s.ay + s.dy - pointer.y;
        const d2 = px * px + py * py;
        if (d2 < REPEL_R * REPEL_R && d2 > 0.5) {
          const d = Math.sqrt(d2);
          const force = (1 - d / REPEL_R) * REPEL_F;
          s.vx += (px / d) * force;
          s.vy += (py / d) * force;
        }
      }

      if (repelOn && scrollVel) s.vy += scrollVel;

      s.vx = clamp(s.vx, -MAX_SPEED, MAX_SPEED);
      s.vy = clamp(s.vy, -MAX_SPEED, MAX_SPEED);

      s.dx += s.vx;
      s.dy += s.vy;
      s.el.style.transform = `translate3d(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px, 0)`;
    }
    scrollVel *= 0.86; // bleed the scroll impulse away over a few frames
    if (Math.abs(scrollVel) < 0.01) scrollVel = 0;
    frame = requestAnimationFrame(step);
  }
  const start = () => { if (!frame) frame = requestAnimationFrame(step); };
  const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = null; } };

  // Don't burn frames while the hero is scrolled out of view.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    ).observe(field);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start()
  );
}

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

function initScrollReveal() {
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

/* ============================================================
   EFFECT: MAGNETIC_BUTTONS
   ============================================================ */
function initMagneticButtons() {
  if (!EFFECTS.MAGNETIC_BUTTONS || reducedMotion() || !finePointer()) return;
  document.documentElement.classList.add("fx-magnetic");

  const PULL = 0.3;  // fraction of the cursor's offset from centre
  const LIMIT = 9;   // px, so large buttons don't wander far

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = clamp((e.clientX - (r.left + r.width / 2)) * PULL, -LIMIT, LIMIT);
      const y = clamp((e.clientY - (r.top + r.height / 2)) * PULL, -LIMIT, LIMIT);
      btn.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
      btn.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
    });
    const release = () => {
      btn.style.setProperty("--mag-x", "0px");
      btn.style.setProperty("--mag-y", "0px");
    };
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("blur", release);
  });
}

/* ============================================================
   EFFECT: AMBIENT_GLOW

   Writes the cursor position to the root element; the CSS paints one
   viewport-anchored radial gradient onto every surface, so the light
   reads as a single sheet crossing the whole page rather than a
   separate highlight per card.
   ============================================================ */
function initAmbientGlow() {
  if (!EFFECTS.AMBIENT_GLOW || !finePointer()) return;
  const root = document.documentElement;
  root.classList.add("fx-ambient");

  let x = window.innerWidth / 2;
  let y = window.innerHeight * 0.4;

  function write() {
    root.style.setProperty("--glow-x", `${x.toFixed(0)}px`);
    root.style.setProperty("--glow-y", `${y.toFixed(0)}px`);
  }

  // Writing the variable only invalidates style; the browser still
  // recalcs and paints once per frame, so no extra throttle is needed.
  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    write();
  }, { passive: true });

  write();
}

/* ============================================================
   EFFECT: GRADIENT_SHIFT

   Rotates the brand ramp's hue as the page scrolls. The tokens are
   authored in HSL around --hue-shift, so setting this one variable
   moves every gradient, button and accent together.
   ============================================================ */
const HUE_SHIFT_MAX = -20; // degrees by the time you reach the invite

function initGradientShift() {
  if (!EFFECTS.GRADIENT_SHIFT) return;
  const root = document.documentElement;
  root.classList.add("fx-huedrift");

  function apply() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    root.style.setProperty("--hue-shift", `${(progress * HUE_SHIFT_MAX).toFixed(2)}deg`);
  }

  window.addEventListener("scroll", apply, { passive: true });
  window.addEventListener("resize", apply);
  apply();
}

/* ============================================================
   EFFECT: HERO_GLOW
   Entirely CSS — this just opens the gate.
   ============================================================ */
const HERO_GLOW_EASE = 0.075; // fraction of the remaining distance per frame

function initHeroGlow() {
  if (!EFFECTS.HERO_GLOW) return;
  const hero = document.querySelector(".hero");
  const glow = hero && hero.querySelector(".hero__glow");
  if (!glow) return;

  const root = document.documentElement;
  root.classList.add("fx-heroglow");

  // Touch devices and reduced-motion get the CSS drift instead; there is
  // no cursor to follow and no per-frame work to do.
  if (!finePointer() || reducedMotion()) {
    root.classList.add("fx-heroglow-idle");
    return;
  }

  const REST = { x: 30, y: 42 }; // where it parks when the pointer leaves
  let tx = REST.x, ty = REST.y;  // target, in % of the hero box
  let cx = REST.x, cy = REST.y;  // current, eased toward the target
  let raf = null;

  function step() {
    cx += (tx - cx) * HERO_GLOW_EASE;
    cy += (ty - cy) * HERO_GLOW_EASE;
    glow.style.setProperty("--hgx", `${cx.toFixed(2)}%`);
    glow.style.setProperty("--hgy", `${cy.toFixed(2)}%`);
    // Stop once it has effectively arrived, so an idle page costs nothing.
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
    }
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(step); };

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 100;
    ty = ((e.clientY - r.top) / r.height) * 100;
    start();
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    tx = REST.x;
    ty = REST.y;
    start();
  });

  step();
}

/* ============================================================
   EFFECT: COIN_CURTAIN

   A scroll-driven transition sitting between the hero and the
   speakers section. Coins rise from below the viewport, and a paper
   surface wipes up behind them, taking the hero's gradient away.

   The zone is taller than the viewport; its inner stage is sticky, so
   scrolling through the extra height plays the sequence in place
   without pinning or hijacking the hero itself.

   ---- tuning ----------------------------------------------------
   COIN_COUNT / COIN_COUNT_SM   how many coins, desktop / small
   COIN_MIN / COIN_MAX          size range in px (and the _SM pair).
                                These are large on purpose: the coins
                                have to cover the seam by themselves.
   COIN_BAND_LO / COIN_BAND_HI  where coins sit relative to the seam at
                                the start, in vh. Negative = above it.
   COIN_RISE_VH                 how far a coin climbs over the window.
                                Must exceed 100 or coins never outrun
                                the seam and will not clear the screen.
   COIN_IMAGES                  the artwork set. Each render is a coin
                                at its own angle, so picking randomly
                                gives the scatter its variety.
   ---------------------------------------------------------------- */
const COIN_IMAGES = [
  "assets/Coin%201.png",
  "assets/Coin%202.png",
  "assets/Coin%203.png",
  "assets/Coin%204.png",
  "assets/Coin%205.png",
  "assets/Coin%206.png",
  "assets/Coin%207.png",
  "assets/Coin%208.png",
  "assets/Coin%209.png",
];
const COIN_COUNT = 15;
const COIN_COUNT_SM = 7;
const COIN_MIN = 170;
const COIN_MAX = 380;
const COIN_MIN_SM = 120;
const COIN_MAX_SM = 240;
const COIN_BAND_LO = -14;
const COIN_BAND_HI = 52;
const COIN_RISE_VH = 132;
const COIN_SPIN = 26; // max degrees of in-plane turn across the window

function initCoinCurtain() {
  if (!EFFECTS.COIN_CURTAIN) return;
  const layer = document.getElementById("coinCurtain");
  const field = document.getElementById("coinField");
  const hero = document.querySelector(".hero");
  if (!layer || !field || !hero) return;

  // Nothing to gate in CSS beyond the layer itself, but keep the class
  // for consistency with the other effects.
  document.documentElement.classList.add("fx-coins");

  // Reduced motion: the layer simply never becomes visible.
  if (reducedMotion()) return;

  const small = window.matchMedia("(max-width: 700px)").matches;
  const count = small ? COIN_COUNT_SM : COIN_COUNT;
  const minSize = small ? COIN_MIN_SM : COIN_MIN;
  const maxSize = small ? COIN_MAX_SM : COIN_MAX;

  const coins = [];
  const frag = document.createDocumentFragment();

  // Shuffled pool, so a small count still draws distinct renders rather
  // than repeating the same two or three by chance.
  const pool = COIN_IMAGES.slice().sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "coin";

    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.width = 640;
    img.height = 640;
    // src is withheld until the transition is near — see primeImages()
    img.dataset.src = pool[i % pool.length];
    el.appendChild(img);

    const size = minSize + Math.random() * (maxSize - minSize);
    el.style.setProperty("--cs", `${size.toFixed(0)}px`);
    // spread across the full width, and past both edges, so the band
    // has no gaps at the sides
    el.style.setProperty("--cx", `${(-8 + Math.random() * 116).toFixed(1)}%`);
    el.style.setProperty("--coin-alpha", (0.62 + Math.random() * 0.3).toFixed(2));
    frag.appendChild(el);

    coins.push({
      el,
      img,
      // starting height relative to the seam, in vh; the spread of these
      // is what makes the cluster a band rather than a single line
      band: COIN_BAND_LO + Math.random() * (COIN_BAND_HI - COIN_BAND_LO),
      rise: COIN_RISE_VH * (0.82 + Math.random() * 0.36),
      // a random resting angle plus a gentle turn as it climbs
      tiltZ: Math.random() * 360,
      spinZ: -COIN_SPIN + Math.random() * (COIN_SPIN * 2),
      driftX: -26 + Math.random() * 52,
    });
  }
  field.appendChild(frag);

  let ticking = false;
  let visible = false;
  let primed = false;

  // The nine renders are ~2MB all told. Holding their src back until the
  // hero is nearly scrolled through keeps that off the initial load,
  // while still fetching well before the coins are wanted.
  function primeImages() {
    if (primed) return;
    primed = true;
    for (const c of coins) {
      if (c.img.dataset.src) {
        c.img.src = c.img.dataset.src;
        delete c.img.dataset.src;
      }
    }
  }

  function draw() {
    ticking = false;
    const vh = window.innerHeight;
    if (!vh) return;

    // The seam is the hero's bottom edge. p runs 0 -> 1 as it travels
    // from the bottom of the viewport to the top: exactly one screen of
    // scrolling, and no extra page height anywhere.
    const seamPx = hero.getBoundingClientRect().bottom;
    const seamVh = (seamPx / vh) * 100;
    const p = clamp(1 - seamPx / vh, 0, 1);

    // fetch the artwork about a screen and a half out
    if (seamPx < vh * 2.5) primeImages();

    const shouldShow = p > 0.001 && p < 0.999;
    if (shouldShow !== visible) {
      visible = shouldShow;
      layer.classList.toggle("is-active", shouldShow);
    }
    if (!shouldShow) return;

    for (const c of coins) {
      // Anchored to the seam, then climbing past it. Because the anchor
      // moves with the seam, the cluster stays over the join instead of
      // drifting off it.
      const y = seamVh + c.band - p * c.rise;
      const fade = clamp(Math.min(p / 0.12, (1 - p) / 0.16), 0, 1);

      c.el.style.setProperty("--cy", `${y.toFixed(2)}vh`);
      c.el.style.setProperty("--cdx", `${(c.driftX * p).toFixed(1)}px`);
      c.el.style.setProperty("--rz", `${(c.tiltZ + c.spinZ * p).toFixed(1)}deg`);
      c.el.style.setProperty("--cfade", fade.toFixed(3));
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  draw();
}

/* ============================================================
   EFFECT: SPOTLIGHT_CARDS

   The glow is a background-image on the card rather than a
   pseudo-element: .agenda-item::before is already the timeline dot,
   and a pseudo-element would need overflow:hidden to stay inside the
   rounded corners — which would clip that dot away.
   ============================================================ */
const SPOTLIGHT_SELECTOR = ".agenda-item, .about-card";

function initSpotlightCards() {
  if (!EFFECTS.SPOTLIGHT_CARDS) return;
  const cards = [...document.querySelectorAll(SPOTLIGHT_SELECTOR)];
  if (!cards.length) return;
  document.documentElement.classList.add("fx-spotlight");

  if (finePointer()) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-a", "1");
      });
      card.addEventListener("pointerleave", () => card.style.setProperty("--spot-a", "0"));
    });
    return;
  }

  // Touch: no cursor to follow, so the glow tracks the card's progress
  // up the viewport and fades out as it leaves the middle band.
  let last = 0;
  function trackScroll() {
    const now = Date.now();
    if (now - last < 60) return; // cheap throttle; scroll fires hard on mobile
    last = now;
    const vh = window.innerHeight;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const progress = clamp((vh - r.top) / (vh + r.height), 0, 1);
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", `${(progress * 100).toFixed(1)}%`);
      // brightest when the card is near the middle of the screen
      const centre = 1 - Math.abs(progress - 0.5) * 2;
      card.style.setProperty("--spot-a", clamp(centre * 1.4, 0, 1).toFixed(2));
    }
  }
  window.addEventListener("scroll", trackScroll, { passive: true });
  window.addEventListener("resize", trackScroll);
  trackScroll();
}

/* ============================================================
   EFFECT: SWEEP_BORDERS
   Entirely CSS — this just opens the gate.
   ============================================================ */
function initSweepBorders() {
  if (!EFFECTS.SWEEP_BORDERS || reducedMotion()) return;
  document.documentElement.classList.add("fx-sweep");
}

/* ============================================================
   EFFECT: SPEAKER_TILT
   ============================================================ */
function initSpeakerTilt() {
  if (!EFFECTS.SPEAKER_TILT || reducedMotion()) return;
  const cards = [...document.querySelectorAll(".speaker-card")];
  if (!cards.length) return;
  document.documentElement.classList.add("fx-tilt");

  // Touch devices get the idle sway defined in CSS; nothing to wire up.
  if (!finePointer()) {
    document.documentElement.classList.add("fx-tilt-idle");
    return;
  }

  const MAX = 13;      // degrees of rotation at the card's edge
  const LIFT = 1.035;  // slight scale so the photo reads as coming forward

  cards.forEach((card) => {
    const photo = card.querySelector(".speaker-card__photo");
    if (!photo) return;

    card.addEventListener("pointerenter", () => {
      card.classList.add("is-tilting");
      photo.style.setProperty("--tilt-scale", String(LIFT));
    });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      photo.style.setProperty("--tilt-x", `${(-py * MAX).toFixed(2)}deg`);
      photo.style.setProperty("--tilt-y", `${(px * MAX).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      photo.style.setProperty("--tilt-x", "0deg");
      photo.style.setProperty("--tilt-y", "0deg");
      photo.style.setProperty("--tilt-scale", "1");
    });
  });
}

/* ============================================================
   EFFECT: SCRAMBLE_TEXT
   ============================================================ */
const SCRAMBLE_SELECTOR = ".hero__tagline, .section__title";

function initScrambleText() {
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

/* ============================================================
   INVITE FORM
   ============================================================ */
function initInviteForm() {
  const form = document.getElementById("inviteForm");
  const status = document.getElementById("inviteStatus");
  const submitBtn = document.getElementById("inviteSubmit");
  const fields = document.getElementById("inviteFields");
  const success = document.getElementById("inviteSuccess");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "invite__status";

    const data = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      organization: form.organization.value.trim(),
      role: form.role.value.trim(),
      message: form.message.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    if (!data.fullName || !data.email || !data.phone) {
      status.textContent = "Please fill in your name, email and phone number.";
      status.classList.add("is-error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn__label").textContent = "Sending…";

    try {
      if (!GOOGLE_SHEETS_ENDPOINT || GOOGLE_SHEETS_ENDPOINT.startsWith("PASTE_")) {
        // No backend configured yet — keep a local fallback so nothing is lost,
        // and let the site owner know in the console.
        console.warn(
          "Moonshot Summit form: GOOGLE_SHEETS_ENDPOINT is not configured. " +
          "See README.md to connect this form to a Google Sheet. Submission logged below."
        );
        console.log("Invite request (not yet sent anywhere):", data);
        const stored = JSON.parse(localStorage.getItem("moonshot_invite_fallback") || "[]");
        stored.push(data);
        localStorage.setItem("moonshot_invite_fallback", JSON.stringify(stored));
      } else {
        // Apps Script web apps don't return CORS headers for simple fetch reads,
        // so we send as no-cors and treat a resolved promise as success.
        await fetch(GOOGLE_SHEETS_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        });
      }

      form.reset();
      // Swap the whole form body out for the confirmation panel.
      fields.hidden = true;
      success.hidden = false;
      // Move focus so screen readers land on the confirmation rather than
      // being stranded on the now-hidden submit button.
      success.focus();
    } catch (err) {
      console.error(err);
      status.textContent = "Something went wrong sending your request. Please try again, or email us directly.";
      status.classList.add("is-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn__label").textContent = "Request an Invite";
    }
  });
}

/* ============================================================
   SCROLL START POSITION

   The landing animation should always play from the top. Scroll
   restoration is disabled in the document head; this pins the offset
   to 0 for good, then enables smooth scrolling once the page has
   settled so anchor links still glide.
   ============================================================ */
function initScrollStart() {
  // A hash means the visitor deep-linked to a section — leave it alone.
  if (!location.hash) window.scrollTo(0, 0);
  setTimeout(() => document.documentElement.classList.add("is-ready"), 0);
}

/* ============================================================
   INIT
   ============================================================ */
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
  initSpotlightCards();
  initSweepBorders();
  initSpeakerTilt();
  initScrambleText();
});
