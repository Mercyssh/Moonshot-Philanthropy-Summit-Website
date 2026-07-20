# The Moonshot Philanthropy Summit — Website

A single-page site for CSBC × Ashoka University's Moonshot Philanthropy Summit.

## Files

```
index.html    Page structure (Intro, Speakers, Agenda, About, Request Invite)
styles.css    All styling — colors/fonts are defined as CSS variables at the top
script.js     Speaker & agenda data, page behaviour, and the invite form logic
```

All copy in this draft is placeholder (Lorem ipsum / sample names & bios) — swap it
for real content before launch. Everything is plain HTML/CSS/JS, so it can be hosted
anywhere (Netlify, Vercel, GitHub Pages, or your own server) with no build step.

## Updating Speakers

Open `script.js` and edit the `SPEAKERS` array near the top:

```js
const SPEAKERS = [
  { name: "Full Name", role: "Title, Organisation", photo: "" },
  // add as many as you like — the grid updates automatically
];
```

Leave `photo` empty to show a gradient circle with initials, or set it to an image
URL (or a local path like `assets/speaker-name.jpg`) to show a real photo.

## Updating the Agenda

Same idea, in the `AGENDA` array in `script.js`:

```js
const AGENDA = [
  { time: "11:00", title: "Session title", desc: "One or two lines of description." },
];
```

## Connecting the "Request Invite" form to Google Sheets

The form is built to POST to a small **Google Apps Script Web App**, which is the
standard free way to send data from a static site straight into a Google Sheet —
no backend or paid service needed, and it comfortably handles a few hundred
submissions.

**1. Create the sheet**
- Make a new Google Sheet, e.g. "Moonshot Summit — Invite Requests".
- Add a header row: `Timestamp | Full Name | Email | Phone | Organization | Role | Message`

**2. Add the script**
- In the sheet, go to **Extensions → Apps Script**.
- Delete any starter code and paste this in:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.fullName || "",
    data.email || "",
    data.phone || "",
    data.organization || "",
    data.role || "",
    data.message || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**3. Deploy it**
- Click **Deploy → New deployment**.
- Select type **Web app**.
- Set "Execute as" to **Me**, and "Who has access" to **Anyone**.
- Click **Deploy**, authorise the permissions Google asks for, and copy the
  resulting **Web app URL** (it looks like
  `https://script.google.com/macros/s/XXXXXXXX/exec`).

**4. Wire it into the site**
- Open `script.js`.
- Paste the URL as the value of `GOOGLE_SHEETS_ENDPOINT` at the very top of the file:

```js
const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

That's it — submissions will now land as new rows in your sheet in real time.

> Until you paste a real URL, the form still works end-to-end (validation, success
> message) but simply logs the submission to the browser console and a local
> fallback, so nothing is lost while you finish setup — you'll just want to
> connect the sheet before sharing the link.

## Design notes

- Colors, type, and spacing tokens are all declared as CSS variables at the top of
  `styles.css` — safe to retune without touching layout code.
- The dotted line running down the left edge on desktop (with the star travelling
  along it as you scroll) is a deliberate nod to "Moonshot" — it can be removed by
  deleting the `.rail` block in `index.html` and `initRail()` in `script.js` if you'd
  rather not keep it.
- The Ashoka University and CSBC marks are currently rendered as styled text
  lockups (no image assets were provided). Swap `.logo-ashoka` / `.logo-csbc` spans
  in `index.html` for `<img>` tags once you have the official logo files.
