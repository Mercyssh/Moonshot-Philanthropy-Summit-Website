import { GOOGLE_SHEETS_ENDPOINT } from "./config.js";

/* ============================================================
   INVITE FORM
   ============================================================ */
export function initInviteForm() {
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
