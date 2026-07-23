import { EFFECTS } from "./config.js";
import { reducedMotion, clamp } from "./utils.js";

/* ============================================================
   EFFECT: HERO_ROTATOR

   Cycles a pre-rendered turntable (assets/hero-animation/0001.webp
   .. NNNN.webp) through four 90°-apart resting positions.

   Frame count controls spatial smoothness (how big each visual
   "step" is); easing is applied purely to WHEN each frame displays,
   via an eased time->progress->frame-index mapping. So retiming the
   turn or swapping the easing curve never requires new renders.

   Canvas, not <img> src-swapping: avoids any flash between frames,
   and leaves room to composite a masked photo through the shape
   later without changing the markup.
   ---- tuning ------------------------------------------------------
   ROTATOR_FRAME_COUNT   total frames in the sequence
   ROTATOR_HOLD_MS       how long it rests at each 90° stop
   ROTATOR_TURN_MS       duration of the eased turn between stops
   ROTATOR_STOPS         resting positions per full 360° cycle
   ------------------------------------------------------------------- */
const ROTATOR_FRAME_COUNT = 59;
const ROTATOR_HOLD_MS = 3000;
const ROTATOR_TURN_MS = 300;
const ROTATOR_STOPS = 4;
const ROTATOR_CROSSFADE = true; // blend adjacent frames for sub-frame smoothness
// The shape acts as a window onto these images. Spaces must be URL-encoded.
// The list is cycled: each turn reveals the next image. Add more here to
// get more variety — with a single entry nothing appears to change.
const ROTATOR_MASK_IMAGES = [
  "assets/images to mask/1.jpg",
  "assets/images to mask/3.jpg",
  "assets/images to mask/4.jpg",
  "assets/images to mask/5.jpg",
];
const ROTATOR_MASK_SHADING = 0.55; // 0 = flat image, 1 = full shape shading for depth
// Slow drift of the photo inside its cover-crop. Only the axis that has
// crop overflow can move, so the pan can never expose an edge.
const ROTATOR_PAN = true;
const ROTATOR_PAN_AMPLITUDE = 0.85; // 0..1 fraction of the available overflow used
const ROTATOR_PAN_PERIOD_MS = 56000; // ms for one full back-and-forth drift

export function initHeroRotator() {
  if (!EFFECTS.HERO_ROTATOR) return;
  const canvas = document.getElementById("heroRotator");
  if (!canvas) return;
  // Shown two ways: as the desktop stage (>=940px) and, on phones
  // (<=700px), stacked in flow below the hero copy. The 701-939px band
  // shows it nowhere, so skip the ~700KB of frames and the rAF loop
  // there rather than load them unseen.
  const onDesktop = window.matchMedia("(min-width: 940px)").matches;
  const onMobile = window.matchMedia("(max-width: 700px)").matches;
  if (!onDesktop && !onMobile) return;

  document.documentElement.classList.add("fx-hero-rotator");
  const ctx = canvas.getContext("2d");

  // On phones the ribbon is laid on its side so it reads as a full-width
  // horizontal band. Only the SHAPE (the mask) is rotated, not the photo
  // drawn through it — so the images stay upright. 90° on a square buffer
  // maps the frame onto itself with no clipping.
  const shapeAngle = onMobile ? Math.PI / 2 : 0;

  const src = (i) => `assets/hero-animation/${String(i + 1).padStart(4, "0")}.webp`;
  const frames = new Array(ROTATOR_FRAME_COUNT);

  const W = canvas.width, H = canvas.height;

  // The shape is built on an offscreen canvas first (so a crossfade has
  // clean combined alpha), then used as the mask for the photo.
  const shapeCanvas = document.createElement("canvas");
  shapeCanvas.width = W;
  shapeCanvas.height = H;
  const sctx = shapeCanvas.getContext("2d");

  const masks = ROTATOR_MASK_IMAGES.map((s) => {
    const im = new Image();
    im.decoding = "async";
    im.src = s;
    return im;
  });
  let maskIdx = 0;
  let prevMaskIdx = 0;
  let maskFade = 1; // 0 -> 1 while the incoming photo fades in over a turn
  const ready = (m) => m && m.complete && m.naturalWidth > 0;
  // Repaint the photo through the shape already on shapeCanvas once the
  // visible mask finishes loading (it may land after its shape frame).
  masks.forEach((im, i) => {
    im.addEventListener("load", () => { if (i === maskIdx || i === prevMaskIdx) composite(); });
  });

  // cover-fit: fill WxH, preserve aspect, crop the overflow. When panning,
  // shift within the cropped overflow on a slow sine so it stays in bounds.
  function drawCover(c, img) {
    const ir = img.width / img.height, cr = W / H;
    let dw, dh;
    if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
    let ox = (W - dw) / 2, oy = (H - dh) / 2;
    if (ROTATOR_PAN && !reducedMotion()) {
      const ph = (performance.now() / ROTATOR_PAN_PERIOD_MS) * Math.PI * 2;
      ox += Math.sin(ph) * ((dw - W) / 2) * ROTATOR_PAN_AMPLITUDE; // 0 unless horizontal overflow
      oy += Math.cos(ph) * ((dh - H) / 2) * ROTATOR_PAN_AMPLITUDE; // 0 unless vertical overflow
    }
    c.drawImage(img, ox, oy, dw, dh);
  }

  // Composite the current shape (already on shapeCanvas) as a window onto
  // the photo. Before the photo loads, the shape is drawn plainly so the
  // hero is never blank.
  function composite() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    const cur = masks[maskIdx], prev = masks[prevMaskIdx];
    const curOk = ready(cur), prevOk = ready(prev);
    if (!curOk && !prevOk) {
      ctx.drawImage(shapeCanvas, 0, 0);
      return;
    }
    // Crossfade the outgoing photo (full) under the incoming one (maskFade).
    // Both share the same pan offset, so only the image content dissolves.
    if (prevOk && maskFade < 1) { ctx.globalAlpha = 1; drawCover(ctx, prev); }
    if (curOk) { ctx.globalAlpha = prevOk ? maskFade : 1; drawCover(ctx, cur); }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(shapeCanvas, 0, 0);           // clip photo to the shape's alpha
    if (ROTATOR_MASK_SHADING > 0) {
      ctx.globalCompositeOperation = "multiply"; // press the shape's shading back on
      ctx.globalAlpha = ROTATOR_MASK_SHADING;
      ctx.drawImage(shapeCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // Paint one shape frame onto shapeCanvas, honouring shapeAngle. Kept in
  // one place so both draw() and blend() rotate the mask identically.
  function drawShape(img, alpha) {
    sctx.globalAlpha = alpha;
    if (shapeAngle) {
      sctx.save();
      sctx.translate(W / 2, H / 2);
      sctx.rotate(shapeAngle);
      sctx.translate(-W / 2, -H / 2);
      sctx.drawImage(img, 0, 0, W, H);
      sctx.restore();
    } else {
      sctx.drawImage(img, 0, 0, W, H);
    }
    sctx.globalAlpha = 1;
  }

  function draw(index) {
    const img = frames[index];
    if (!img || !img.complete) return;
    sctx.clearRect(0, 0, W, H);
    drawShape(img, 1);
    composite();
  }

  // Crossfade two adjacent frames onto the shape canvas: base at full,
  // next layered at `frac`. In the overlapping shape region this resolves
  // to a true crossfade; the thin non-overlap sliver ghosts, which reads
  // as motion blur and helps the low frame count feel smoother.
  function blend(indexA, indexB, frac) {
    const a = frames[indexA], b = frames[indexB];
    if (!a || !a.complete) return;
    sctx.clearRect(0, 0, W, H);
    drawShape(a, 1);
    if (frac > 0 && b && b.complete) drawShape(b, frac);
    composite();
  }

  // Frame 0 loads eagerly so the hero isn't blank; the rest load in
  // the background, well ahead of when the loop first needs them.
  const first = new Image();
  first.onload = () => { frames[0] = first; draw(0); };
  first.src = src(0);

  // Reduced motion: first frame only, no timer, no further loads.
  if (reducedMotion()) return;

  function loadRest() {
    for (let i = 1; i < ROTATOR_FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      frames[i] = img;
    }
  }
  if ("requestIdleCallback" in window) requestIdleCallback(loadRest, { timeout: 2000 });
  else setTimeout(loadRest, 300);

  // Evenly spaced resting frames regardless of whether FRAME_COUNT
  // divides cleanly by STOPS — rounding to the nearest frame is
  // visually indistinguishable from an exact multiple.
  const stopIndex = (stop) =>
    Math.round((stop / ROTATOR_STOPS) * ROTATOR_FRAME_COUNT) % ROTATOR_FRAME_COUNT;

  let stop = 0;
  let phase = "hold"; // "hold" | "turn"
  let phaseStart = performance.now();
  let drawn = -1; // last frame index painted during a hold, to skip redundant draws
  let raf = null;

  // turn state, set when a turn begins
  let fromIdx = 0, span = 0;

  function drawOnce(index) {
    if (index === drawn) return;
    draw(index);
    drawn = index;
  }

  function beginTurn(now) {
    // Cycle to the next photo as the turn starts; it crossfades in over the
    // turn (see maskFade in tick) rather than snapping.
    prevMaskIdx = maskIdx;
    maskIdx = (maskIdx + 1) % masks.length;
    maskFade = 0;
    fromIdx = stopIndex(stop);
    const toIdx = stopIndex((stop + 1) % ROTATOR_STOPS);
    // shortest forward path, wrapping at the 360°/0° seam
    span = (toIdx - fromIdx + ROTATOR_FRAME_COUNT) % ROTATOR_FRAME_COUNT;
    phase = "turn";
    phaseStart = now;
  }

  function tick(now) {
    if (phase === "hold") {
      // With pan on, the crop shifts every frame, so repaint unconditionally
      // instead of skipping redundant same-index draws.
      if (ROTATOR_PAN) draw(stopIndex(stop));
      else drawOnce(stopIndex(stop));
      if (now - phaseStart >= ROTATOR_HOLD_MS) beginTurn(now);
    } else {
      // Linear progress — no easing. Crossfade between the two nearest
      // frames each tick so motion is smooth despite the low frame count.
      const t = clamp((now - phaseStart) / ROTATOR_TURN_MS, 0, 1);
      maskFade = t; // photo crossfade tracks the turn's progress
      if (t >= 1) {
        maskFade = 1;
        stop = (stop + 1) % ROTATOR_STOPS;
        phase = "hold";
        phaseStart = now;
        drawn = -1; // force a repaint after blending bypassed drawOnce
        drawOnce(stopIndex(stop));
      } else {
        const pos = t * span;
        const base = Math.floor(pos);
        const idxA = (fromIdx + base) % ROTATOR_FRAME_COUNT;
        const idxB = (fromIdx + base + 1) % ROTATOR_FRAME_COUNT;
        if (ROTATOR_CROSSFADE) blend(idxA, idxB, pos - base);
        else draw(idxA);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  const start = () => {
    if (raf) return;
    // Rebase the phase clock so a resume continues from where it paused
    // instead of fast-forwarding through an elapsed hold or turn.
    phaseStart = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const pause = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : pause()),
      { threshold: 0 }
    ).observe(canvas);
  } else {
    start();
  }
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : start()));
}
