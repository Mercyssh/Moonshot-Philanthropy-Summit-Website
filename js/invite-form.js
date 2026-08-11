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

  // Phone accepts only digits and a single leading "+". Filter as they type
  // (and on paste) so the field can never hold anything else.
  form.phone.addEventListener("input", () => {
    form.phone.value = form.phone.value
      .replace(/[^\d+]/g, "")      // drop everything but digits and +
      .replace(/(?!^)\+/g, "");     // keep + only in the first position
  });

  // Once a flagged field is edited, drop its red border so it stops nagging.
  fields.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
  });
  form.consent.addEventListener("change", () => {
    form.consent.classList.remove("is-invalid");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "invite__status";

    // Honeypot: a hidden field no human sees. If it's filled, it's a bot —
    // swap in the success panel so the bot thinks it won, but send nothing.
    if (form.website.value) {
      form.reset();
      fields.hidden = true;
      success.hidden = false;
      success.focus();
      return;
    }

    const data = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      organization: form.organization.value.trim(),
      role: form.role.value.trim(),
      linkedin: form.linkedin.value.trim(),
      consent: form.consent.checked,
      submittedAt: new Date().toISOString(),
    };

    // Clear any red borders left over from a previous attempt.
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

    const missing = [];   // required fields left blank, by label
    const problems = [];   // format errors, as full sentences

    // Every field except LinkedIn is required. Flag blanks and red-border them.
    const require = (el, label, val) => {
      if (val) return true;
      el.classList.add("is-invalid");
      missing.push(label);
      return false;
    };

    require(form.fullName, "Full name", data.fullName);
    if (require(form.email, "Email", data.email) &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      form.email.classList.add("is-invalid");
      problems.push("Please enter a valid email address.");
    }
    if (require(form.phone, "Phone", data.phone) &&
        !/^\+?\d{7,15}$/.test(data.phone)) {
      form.phone.classList.add("is-invalid");
      problems.push("Please enter a valid phone number (7–15 digits, an optional leading +).");
    }
    require(form.organization, "Organisation", data.organization);
    require(form.role, "Role / Title", data.role);

    if (!data.consent) {
      form.consent.classList.add("is-invalid");
      problems.push("Please agree to be contacted so we can follow up on your request.");
    }

    const messages = [];
    if (missing.length) {
      messages.push(
        missing.length === 1
          ? `${missing[0]} is required.`
          : `Please fill in: ${missing.join(", ")}.`
      );
    }
    messages.push(...problems);

    if (messages.length) {
      status.textContent = messages.join("\n");
      status.classList.add("is-error");
      // Send focus to the first field with a problem for keyboard/AT users.
      const firstBad = form.querySelector(".is-invalid");
      if (firstBad) firstBad.focus();
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
      submitBtn.querySelector(".btn__label").textContent = "Request My Invite";
    }
  });
}
