/* ============================================================
   SPEAKERS DATA + RENDER
   Add/remove/edit speakers here — the grid updates automatically.
   `photo` is optional; leave blank to show initials on a gradient.
   ============================================================ */
export const SPEAKERS = [
  { name: "Pramath Sinha", role: "Founder, Ashoka University", photo: "../assets/pramath.png" },
  { name: "Sharon Barnhardt", role: "Director, CSBC, Ashoka University", photo: "../assets/sharon.png" },
  { name: "Dr. Pavan Mamidi", role: "Director, CSBC, Ashoka University", photo: "../assets/pavan.png" },
  { name: "Pooja Haldea", role: "Senior Advisor, CSBC, Ashoka University", photo: "../assets/pooja.png" },
  { name: "Lorem Ipsum", role: "Chief AI Officer, Example Foundation", photo: "../assets/placeholder.png" },
  { name: "Amit Placeholder", role: "Partner, Sample Capital", photo: "../assets/placeholder.png" },
];

// Photos are supplied already framed, so they render as a plain <img>.
const SPEAKER_PLACEHOLDER = "assets/speaker-placeholder.png";

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
    </article>`
  ).join("");
}
