/* ============================================================
   CONFIG
   Paste your Google Apps Script Web App URL here once deployed.
   See README.md → "Connecting the form to Google Sheets".
   ============================================================ */
export const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbycO9Cg_1tbt8m1VTN1818KsYPvpQJytB7GAEwQlFSP9pNzAkGoXJSif8E7aFrQjmJy/exec";

/* ============================================================
   HERO IMAGES — single source of truth

   The pool of summit photos shared by both hero treatments: the
   desktop turntable (HERO_ROTATOR) and the mobile ribbon
   (HERO_MARQUEE). Add or remove entries here only — both modules
   import this list, so they can never fall out of sync. Any count
   works; each treatment cycles the list on its own.
   ============================================================ */
export const HERO_IMAGES = [
   "assets/images to mask/1.jpg",
   "assets/images to mask/2.jpg",
   "assets/images to mask/3.jpg",
   "assets/images to mask/4.jpg",
   "assets/images to mask/5.jpg",
   "assets/images to mask/6.jpg",
   "assets/images to mask/7.jpg",
   "assets/images to mask/8.jpg",
];

/* ============================================================
   INTERACTION EFFECTS — ON/OFF SWITCHES

   Flip any of these to false to remove that effect completely.
   Each one is gated behind an `fx-*` class that this file adds to
   <html>, so switching it off disables the CSS as well as the JS —
   nothing is left behind and nothing needs deleting.

   MAGNETIC_BUTTONS  Buttons drift toward the cursor, snap back on
                     leave. Desktop pointers only.
   SCRAMBLE_TEXT     Headings resolve out of random glyphs the first
                     time each one comes into view.
   CURSOR_SPECKS     The hero specks scatter away from the cursor. On
                     touch devices they drift with scroll velocity.
   HERO_GLOW         A soft pool of light follows the cursor across the
                     hero's gradient, with easing. Touch devices and
                     reduced-motion get a slow automatic drift instead.
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
   QUOTE_WAVES       Two brand-gradient sine waves drift in opposite
                     phase behind the pull-quote. Reduced motion draws
                     them once, static.
   FLOATING_CTA      A fixed "Request an Invite" pill that fades in once
                     the hero scrolls away and hides again while the
                     invite section itself is on screen.
   ============================================================ */
export const EFFECTS = {
   MAGNETIC_BUTTONS: true,
   SCRAMBLE_TEXT: true,
   CURSOR_SPECKS: true,
   HERO_GLOW: true,
   HERO_ROTATOR: true,
   HERO_MARQUEE: true,
   LIQUID_GLASS: false,
   TIMELINE_GLOW: true,
   QUOTE_WAVES: true,
   FLOATING_CTA: true,
};
