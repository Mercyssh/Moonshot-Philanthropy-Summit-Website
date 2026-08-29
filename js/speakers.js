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
  { name: "Dr. Pavan Mamidi", role: "Director, Ashoka University's Centre for Social and Behaviour Change", summit: "The anatomy of behaviour change", photo: "assets/speakers/Pavan Mamidi.png" },
  { name: "Dr. Sharon Barnhardt", role: "Director - Research, Ashoka University's Centre for Social and Behaviour Change", summit: "The science of behaviour change that lasts", photo: "assets/speakers/Sharon Barnhardt.png" },
  { name: "Shweta Agarwal", role: "Board Member - CSR, Sterlite Technologies", summit: "How boards analyse moonshot ideas for social impact", photo: "assets/speakers/Shweta Agarwal.png" },
  { name: "Vanshika Goenka", role: "CEO at Christy & Director at Welspun Corp", summit: "How compliance and courage go together", photo: "assets/speakers/Vanshika Goenka.png" },
  { name: "Aayush Ailawadi", role: "AI & Tech Opinion Leader", summit: "What it takes for AI to amplify impact", photo: "assets/speakers/Aayush Ailawadi.png" },
  { name: "Devavrat Kakade", role: "Executive Director, APAC, JPMorganChase", summit: "Taking bold ideas to a billion people", photo: "assets/speakers/Devavrat Kakade.png" },
  { name: "Geetika Dadlani", role: "Head, Giving Pi & Associate Director, Dasra", summit: "What bold giving looks like from the inside", photo: "assets/speakers/Geetika Dadlani.png" },
  { name: "Ninad Karpe", role: "Founder & Partner, 100xVC", summit: "The moonshot investment thesis", photo: "assets/speakers/Ninad Karpe.png" },
  { name: "Nirav Khambhati", role: "Partner, The Blended Finance Company", summit: "The case for funding innovation", photo: "assets/speakers/Nirav Khambhati.png" },
  { name: "Dr. Maneesh Mishra", role: "VP, Jindal Steel & Head, Naveen Jindal Foundation", summit: "The ground reality of scale", photo: "" },
  { name: "Bilal Jaleel", role: "Director, WTF Media", summit: "How narrative can be an impact metric", photo: "assets/speakers/Bilal Jaleel.png" },
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
