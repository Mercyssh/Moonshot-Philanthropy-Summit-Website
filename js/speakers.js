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
  { name: "To be announced", role: "Director, CSBC, Ashoka University", summit: "Opens the summit with its central thesis" },
  { name: "To be announced", role: "Founder, AI Start-up", summit: "The builder's view of AI for impact" },
  { name: "To be announced", role: "Head, Leading NGO", summit: "The ground truth of scale" },
  { name: "To be announced", role: "Opinion Leader on Technology", summit: "The paradigm shift, and its guardrails" },
  { name: "To be announced", role: "Leader, Media & Creative Enterprise", summit: "Why narrative is a metric" },
  { name: "To be announced", role: "CSR Committee Leader, Large Corporation", summit: "Compliance and courage, together" },
  { name: "To be announced", role: "Venture Capitalist", summit: "The moonshot investment thesis" },
  { name: "To be announced", role: "Vision Lab Keynote", summit: "The future we can build" },
  { name: "To be announced", role: "Established Founder & Entrepreneur", summit: "The closing call to action" },
];

// Photos are supplied already framed, so they render as a plain <img>.
const SPEAKER_PLACEHOLDER = "assets/placeholder.png";

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
