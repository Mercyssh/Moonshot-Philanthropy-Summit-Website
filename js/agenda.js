/* ============================================================
   AGENDA DATA + RENDER
   Six "movements", each a session card: a format tag, a title, a
   two-line descriptor and the speaker role(s). Speakers are role
   placeholders until the line-up is confirmed — swap them for real
   names as they lock in.
   ============================================================ */
export const AGENDA = [
  {
    tag: "Opening Keynote",
    title: "How Behavioural Science and AI Can Solve Complex Problems",
    desc: "Why India's hardest challenges have plateaued, and what becomes possible when moonshot thinking converges with behavioural science and AI. The intellectual foundation for everything that follows.",
    speakers: "Director, CSBC, Ashoka University",
  },
  {
    tag: "Live Case Narrative",
    title: "Intervention to Impact: A Real Life Story",
    desc: "What a bold intervention actually changes on the ground – told first by the person whose life it changed, then decoded by the director who designed it. Moonshot impact is not a theory; it reshapes real lives.",
    speakers: "Programme Beneficiary · Project Director, CSBC",
  },
  {
    tag: "Live Brainstorming Session",
    title: "Why AI is an Amplifier",
    desc: "A builder, an implementer and a technology thinker workshop in real time: what does it take for AI to carry bold interventions across India's complexity of language, infrastructure, trust and culture? Not a rehearsed panel – a working session.",
    speakers: "Founder, AI Start-up · Head, Leading NGO · Opinion Leader on Technology",
  },
  {
    tag: "Panel",
    title: "Reimagining Metrics",
    desc: "If moonshots need a new funding structure, they need a new measure of success. A storyteller, a CSR insider and a venture capitalist on metrics that capture transformation rather than only output – and portfolios that satisfy the board while backing the bold.",
    speakers: "Leader, Media & Creative Enterprise · CSR Committee Leader · Venture Capitalist",
  },
  {
    tag: "Keynote · Vision Lab",
    title: "The Future We Can Build",
    desc: "A vivid, specific picture of what five to ten years of moonshot investment could build in India's most critical cause areas. Ambitious, grounded in current research trajectories, and closer than you think.",
    speakers: "Vision Lab Keynote",
  },
  {
    tag: "Keynote",
    title: "Closing Keynote",
    desc: "A founder who has built at scale, on the asymmetric bet: why this is the moment for India's philanthropic capital to move from safe, incremental giving to bold, catalytic investment.",
    speakers: "Established Founder & Entrepreneur",
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
