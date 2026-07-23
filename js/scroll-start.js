/* ============================================================
   SCROLL START POSITION

   The landing animation should always play from the top. Scroll
   restoration is disabled in the document head; this pins the offset
   to 0 for good, then enables smooth scrolling once the page has
   settled so anchor links still glide.
   ============================================================ */
export function initScrollStart() {
  // A hash means the visitor deep-linked to a section — leave it alone.
  if (!location.hash) window.scrollTo(0, 0);
  setTimeout(() => document.documentElement.classList.add("is-ready"), 0);
}
