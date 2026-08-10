/* ============================================================
   SPEAKERS DATA + RENDER
   Add/remove/edit speakers here — the grid updates automatically.
   `photo` is optional; leave blank to fall back to the placeholder.
   `summit` is the one-line role each speaker plays in the evening.
   Names are placeholders until the line-up is confirmed — replace
   "To be announced" with the real name (and add a `photo`) as each
   speaker is locked in.
   ============================================================ */
export const SPEAKERS = [
  { name: "Dr. Pavan Mamidi", role: "Director, Ashoka University's Centre for Social and Behaviour Change", summit: "Opens the summit with its central thesis", photo: "assets/speakers/Pavan Mamidi.png" },
  { name: "Ninad Karpe", role: "Partner, 100xVC & Founder, Karpe Diem Ventures", summit: "The moonshot investment thesis", photo: "assets/speakers/Ninad Karpe.png" },
  { name: "Aayush Ailawadi", role: "Opinion Leader on AI & Tech", summit: "The paradigm shift, and its guardrails", photo: "assets/speakers/Aayush Ailawadi.png" },
  { name: "Vanshika Goenka", role: "CEO at Christy and Director at Welspun Group", summit: "Compliance and courage, together", photo: "assets/speakers/Vanshika Goenka.png" },
  { name: "Geetika Dadlani", role: "Associate Director, Dasra", summit: "The philanthropist’s point of view", photo: "assets/speakers/Geetika Dadlani.png" },
  { name: "Devavrat Kakade", role: "Executive Director, JPMorganChase", summit: "Socialising moonshot interventions at scale", photo: "assets/speakers/Devavrat Kakade.png" },
  { name: "To be announced", role: "Venture Capitalist", summit: "The builder's view of AI for impact" },
  { name: "To be announced", role: "Vision Lab Keynote", summit: "The future we can build" },
  { name: "To be announced", role: "Established Founder & Entrepreneur", summit: "The closing call to action" },
];

// Photos are supplied already framed, so they render as a plain <img>.
const SPEAKER_PLACEHOLDER = "assets/speakers/placeholder.png";

export function renderSpeakers() {
  const grid = document.getElementById("speakersGrid");
  if (!grid) return;
  grid.innerHTML = SPEAKERS.map(
    (s) => `
    <article class="speaker-card">
      <img class="speaker-card__photo" src="${s.photo || SPEAKER_PLACEHOLDER}"
           alt="${s.name}" width="400" height="380" loading="lazy">
      <p class="speaker-card__name">${s.name}</p>
      <p class="speaker-card__role">${s.role}</p>
      ${s.summit ? `<p class="speaker-card__summit">${s.summit}</p>` : ""}
    </article>`
  ).join("");
}
