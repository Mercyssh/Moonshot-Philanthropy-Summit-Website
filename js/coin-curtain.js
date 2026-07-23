import { EFFECTS } from "./config.js";
import { reducedMotion, clamp, seededRandom } from "./utils.js";

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
   COIN_SEED                    fixes the scatter. Every position, size,
                                angle and image choice derives from this
                                one number, so the same seed always
                                gives the same arrangement. Change it to
                                any other integer to roll a new layout;
                                once you find one you like, leave it.
   ---------------------------------------------------------------- */
const COIN_SEED = 20;
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
const COIN_SPIN = 480; // max degrees of in-plane turn across the window

export function initCoinCurtain() {
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

  // Every random draw below comes from here, so the whole arrangement is
  // reproducible from COIN_SEED alone.
  const rand = seededRandom(COIN_SEED);

  // Shuffled pool, so a small count still draws distinct renders rather
  // than repeating the same two or three by chance. Fisher-Yates rather
  // than sort(() => rand() - 0.5), which is a biased shuffle.
  const pool = COIN_IMAGES.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

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

    const size = minSize + rand() * (maxSize - minSize);
    el.style.setProperty("--cs", `${size.toFixed(0)}px`);
    // spread across the full width, and past both edges, so the band
    // has no gaps at the sides
    el.style.setProperty("--cx", `${(-8 + rand() * 116).toFixed(1)}%`);
    el.style.setProperty("--coin-alpha", (0.62 + rand() * 0.3).toFixed(2));
    frag.appendChild(el);

    coins.push({
      el,
      img,
      // starting height relative to the seam, in vh; the spread of these
      // is what makes the cluster a band rather than a single line
      band: COIN_BAND_LO + rand() * (COIN_BAND_HI - COIN_BAND_LO),
      rise: COIN_RISE_VH * (0.6 + rand() * 0.8),
      // a fixed resting angle plus a gentle turn as it climbs
      tiltZ: rand() * 360,
      spinZ: -COIN_SPIN + rand() * (COIN_SPIN * 2),
      driftX: -26 + rand() * 52,
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
