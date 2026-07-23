/* ============================================================
   CONFIG
   Paste your Google Apps Script Web App URL here once deployed.
   See README.md → "Connecting the form to Google Sheets".
   ============================================================ */
export const GOOGLE_SHEETS_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

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
   HERO_ROTATOR      A pre-rendered 360° turntable of the hero shape,
                     stopping at four 90° positions with an eased
                     turn between them. Desktop only (.hero__stage
                     is hidden below 940px).
   HERO_MARQUEE      Mobile only. A full-bleed ribbon of summit photos
                     auto-scrolls across the top of the hero, tinted to
                     the brand gradient and fading into it at both edges.
                     The phone counterpart to the desktop rotator.
   LIQUID_GLASS      The CSBC about card becomes a frosted glass panel
                     with a gradient rim and a glow that trails the
                     cursor. Touch/reduced-motion keep the static rim.
   TIMELINE_GLOW     Mobile only. As the agenda timeline scrolls, a
                     masked glow + border highlight tracks the card
                     nearest the viewport centre, lerping smoothly
                     between cards and settling on the last one.
   ============================================================ */
export const EFFECTS = {
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
   HERO_ROTATOR: true,
   HERO_MARQUEE: true,
   LIQUID_GLASS: true,
   TIMELINE_GLOW: true,
};
