/* ============================================================
   SCROLL START POSITION

   The landing animation should always play from the top. Scroll
   restoration is disabled in the document head; this pins the offset
   to 0 for good, then enables smooth scrolling once the page has
   settled so anchor links still glide.
   ============================================================ */
export function initScrollStart() {
  const goToHash = () => {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el) el.scrollIntoView();
  };

  // Enabling smooth scrolling is what makes nav clicks glide; it must wait
  // until after any load-time scroll correction so that correction stays an
  // instant jump rather than an animated one over the hero.
  const enableSmooth = () =>
    document.documentElement.classList.add("is-ready");

  if (!location.hash) {
    // No deep link — start at the top and let the hero animation play.
    window.scrollTo(0, 0);
    setTimeout(enableSmooth, 0);
    return;
  }

  // Deep link to a section. The browser's native fragment jump fires before
  // renderSpeakers()/renderAgenda() build their grids and before the speaker
  // images have sized, so every section above the target grows *after* the
  // jump and the target slides out from under the scroll position — leaving
  // the viewport past the section (at the footer, for #invite). Re-pin to the
  // target once the layout has actually settled, then switch smooth on.
  goToHash();
  window.addEventListener("load", () => {
    goToHash();
    requestAnimationFrame(() => {
      goToHash();
      enableSmooth();
    });
  });
}
