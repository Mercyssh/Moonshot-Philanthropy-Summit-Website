/* ============================================================
   CONFIG
   Paste your Google Apps Script Web App URL here once deployed.
   See README.md → "Connecting the form to Google Sheets".
   ============================================================ */
const GOOGLE_SHEETS_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

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

  const specks = [];
  const frag = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    const size = 2 + Math.random() * 3;
    el.style.top = `${Math.random() * 90}%`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
    frag.appendChild(el);
    specks.push({ el, dx: 0, dy: 0, vx: 0, vy: 0 });
  }
  field.appendChild(frag);

  // Honour reduced-motion: place the specks, but leave them still.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  let frame = null;
  function step() {
    for (const s of specks) {
      s.vx = (s.vx + (Math.random() - 0.5) * JITTER - s.dx * SPRING) * DAMPING;
      s.vy = (s.vy + (Math.random() - 0.5) * JITTER - s.dy * SPRING) * DAMPING;
      s.dx += s.vx;
      s.dy += s.vy;
      s.el.style.transform = `translate3d(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px, 0)`;
    }
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
  initHeroStars();
  initScrollReveal();
  initInviteForm();
});
