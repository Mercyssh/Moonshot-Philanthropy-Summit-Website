/* ============================================================
   FLOATING CTA
   A fixed "Request an Invite" pill. It stays out of the way over
   the hero (whose own CTA is already on screen), fades in once the
   hero has scrolled away, and hides again while the invite section
   itself is showing so it never duplicates that section's button.
   ============================================================ */
import { EFFECTS } from "./config.js";

export function initFloatingCta() {
  if (!EFFECTS.FLOATING_CTA) return;
  const cta = document.getElementById("floatingCta");
  const hero = document.querySelector(".hero");
  const invite = document.getElementById("invite");
  if (!cta || !hero || !invite) return;

  document.documentElement.classList.add("fx-floating-cta");

  let pastHero = false; // hero has scrolled fully out of view
  let onInvite = false; // invite section is on screen

  const apply = () => {
    const show = pastHero && !onInvite;
    cta.classList.toggle("is-visible", show);
    cta.setAttribute("aria-hidden", String(!show));
    cta.tabIndex = show ? 0 : -1;
  };

  new IntersectionObserver(
    ([e]) => {
      pastHero = !e.isIntersecting;
      apply();
    }
  ).observe(hero);

  new IntersectionObserver(
    ([e]) => {
      onInvite = e.isIntersecting;
      apply();
    },
    { threshold: 0.12 }
  ).observe(invite);
}
