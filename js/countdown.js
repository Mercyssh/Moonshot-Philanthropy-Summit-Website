/* ============================================================
   COUNTDOWN

   Explicit +05:30 offset so the target is the event's local start
   time in Mumbai regardless of where the visitor is.
   ============================================================ */
const EVENT_START = new Date("2026-08-26T11:00:00+05:30");

export function initCountdown() {
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
