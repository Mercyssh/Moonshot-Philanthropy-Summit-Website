/* ============================================================
   AGENDA DATA + RENDER
   Each session card holds a format tag, a title and a short
   descriptor. Add or reorder cards here — the timeline rail refits
   itself automatically.
   ============================================================ */
export const AGENDA = [
  {
    tag: "Opening Keynote",
    title: "The Anatomy of Behaviour Change",
    desc: "Why India's hardest challenges have plateaued, and what opens up when behavioural science, moonshot thinking and AI meet. The foundation for everything that follows.",
  },
  {
    tag: "Keynote",
    title: "The Case for Funding Innovation ",
    desc: "Why this is the moment for India's philanthropic capital to stop funding programmes and start funding behaviour change.",
  },
  {
    tag: "Live Brainstorming Session",
    title: "Behaviour Meets AI: The Amplifier Effect",
    desc: "A builder, an implementer and a designer work it out live: what does AI actually need to personalise and scale behavioural interventions across India's tangle of language, infrastructure, trust and culture? No rehearsed panel – a working session, in real time.",
  },
  {
    tag: "Panel",
    title: "Measuring What Matters",
    desc: "Moonshots need a new funding structure, which means they need a new measure of success. A behavioural scientist, a CSR insider and a venture capitalist debate how behavioural outcomes can sit alongside outputs, and how a portfolio can satisfy the board while still backing the bold.",
  },
  {
    tag: "Closing Keynote",
    title: "The Future We Can Create",
    desc: "A closing keynote address on the future we can create together.",
  },
];

/* Trim the timeline rail so it starts at the first node and ends at the
   last, instead of running the full height of the list. The dots are
   drawn by CSS at a fixed offset inside each card, so their centres are
   derived from that offset plus the first/last card positions, and fed
   back to the rail as --rail-top / --rail-bottom. Re-run on resize and
   once web fonts settle, since both change the cards' heights. */
export function initAgendaRail() {
  const list = document.getElementById("agendaList");
  if (!list) return;

  const fit = () => {
    const items = list.querySelectorAll(".agenda-item");
    if (items.length < 2) {
      list.style.removeProperty("--rail-top");
      list.style.removeProperty("--rail-bottom");
      return;
    }
    // Mirror the CSS dot geometry: 1px card border + top offset + radius.
    const small = window.matchMedia("(max-width: 620px)").matches;
    const dotCenter = small ? 1 + 24 + 6 : 1 + 28 + 7.5;
    const first = items[0];
    const last = items[items.length - 1];
    list.style.setProperty("--rail-top", `${first.offsetTop + dotCenter}px`);
    list.style.setProperty("--rail-bottom", `${list.clientHeight - (last.offsetTop + dotCenter)}px`);
  };

  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(fit, 150);
  });
}

export function renderAgenda() {
  const list = document.getElementById("agendaList");
  if (!list) return;
  list.innerHTML = AGENDA.map(
    (a) => `
    <div class="agenda-item">
      <p class="agenda-item__tag">${a.tag}</p>
      <div class="agenda-item__body">
        <p class="agenda-item__title">${a.title}</p>
        <p class="agenda-item__desc">${a.desc}</p>
      </div>
    </div>`
  ).join("");
}
