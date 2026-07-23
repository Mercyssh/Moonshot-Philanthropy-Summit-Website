/* ============================================================
   AGENDA DATA + RENDER
   Add/remove/edit agenda stages here.
   ============================================================ */
export const AGENDA = [
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

export function renderAgenda() {
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
