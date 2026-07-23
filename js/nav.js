/* ============================================================
   NAV: scroll state + mobile menu
   ============================================================ */
export function initNav() {
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
