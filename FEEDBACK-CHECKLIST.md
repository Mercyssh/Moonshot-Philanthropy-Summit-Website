# Moonshot Summit — Website Feedback Checklist

Source: reviewer feedback PDF (`Moonshot_Summit_Website_Content.md.pdf`), 3 Aug review of
https://mps.om-rane.com/ — annotated screenshots, items 1–12 + phone notes.

Status snapshot: **16 implemented, 1 deferred.** IDs are our internal labels; PDF item
numbers noted in parentheses.

---

## ✅ Implemented

| ID | Change | Files |
|----|--------|-------|
| G1 | Removed the "chips" (falling poker-chip coins) — `COIN_CURTAIN: false` | `js/config.js` |
| G2 | Removed the corner-motif "frame" (hero + invite) and all CSS/JS refs | `index.html`, `styles.css`, `js/scroll-reveal.js` |
| G3 | Em dashes → en dash / comma across all visible copy (code comments left as-is) | `index.html`, `js/agenda.js` |
| G4 | Consistent **Title Case** on all section titles + one sentence-case agenda title | `index.html`, `js/agenda.js` |
| G5 | Removed the byline/tagline under the logo — hero **and** footer | `index.html`, `styles.css` |
| H1 | Nav shows the **star mark only**, flush to the screen edges; partners flush right | `assets/Logo Star (White).svg` (new), `styles.css` |
| H2 | Nav + "initiative by" strip made one **solid** bar (the seam was two translucent layers over the gradient) | `styles.css` |
| H3 | Enlarged the top bar: taller nav, bigger star, links, partner logos, attribution text | `styles.css` |
| N1 | Desktop nav "Why" → "Why Attend" | `index.html` |
| HR2 | Why headline → "What Would It Take to Build Solutions for the Future?" | `index.html` |
| Q2 | Pull-quote size floor raised so it stays header-sized on phones; accent pinned to one size/weight | `styles.css` |
| F1 | Invite/form text consolidated to two tiers — 15px body, 14px labels | `styles.css` |
| Footer | Footer brand + partner lockup + legal line pushed flush to the screen edges, matching the nav (shared `--edge-gutter`) | `styles.css` |
| P1 | Confirmed all of the above hold on the mobile layout | — |
| HR1 | Hero already ordered (logo → DTV → timer → buttons → support) and left-aligned; light-touch font pass collapsed the DTV sub-label **weight 500 → 600** so the date plate uses two weights (700/600) not three | `styles.css` |
| Q1 | Pull-quote moved to sit **directly between the hero and Why Attend** (was below Why Attend) | `index.html` |

### Key value changes made
| Variable / rule | Before → After | Controls |
|---|---|---|
| `--nav-h` | 78/92px → 88/104px | bar height (cascades to hero offset, drawer, anchor scroll) |
| `.nav__brand .brand-logo` | full lockup 34/40px → star 46/56px | nav mark |
| `.nav__links` font | 15px → 16.5px | nav link size |
| `.nav__partners img` | 38/46px → 44/56px | partner lockup |
| `.topline__text` | 11/9.5px → 12.5/11px | attribution text |
| `.pullquote__text` | `clamp(21,3.2vw,32)` → `clamp(24,4.4vw,32)` | quote size floor on mobile |
| `--edge-gutter` (new) | `clamp(18px, 2.4vw, 30px)` | shared edge inset for the full-bleed nav + footer bars |

### Decisions already made
- **Nav logo:** star mark only (not the full wordmark).
- **Alignment:** logos flush to the true screen edges (not the content column).
- **Byline:** removed everywhere (kept flexibility, per reviewer's "imo drop it").

---

## ⏳ Deferred

### M1 · Clean up unclean motif edges (PDF #6, pg 2)
**Deferred by decision (4 Aug)** — skip for now, revisit later.
The hero S-curve motif (summit photo masked through the shape) has rough/jagged edges.
Root cause is in the mask itself — either the source frame alpha in
`assets/hero-animation/*.webp` or the canvas compositing in `js/hero-rotator.js`
(feather / anti-alias the edge). Inspect a frame's alpha channel first.
When picked up: preferred approach is to **feather the mask edge in the canvas
compositing** (no per-frame asset re-export; applies uniformly to all frames).

---

## Not in scope (reviewer notes, no action expected)
- "Phone version looks great" — confirmation, no change (covered by P1).

## Follow-up housekeeping
- Now-unused assets after G1/G2: `assets/top-left-corner-motif.svg`,
  `assets/top-right-corner-motif.svg`. Harmless; delete if you want a clean assets folder.
  (`assets/Logo (White).svg` is still used by the footer — keep it.)
- **Trade-off from H2:** the nav is now solid paper instead of translucent glass over the
  hero. This was the only reliable way to kill the seam. To restore the glass look, revert
  `.nav` / `.topline` backgrounds to `rgba(251,249,246,0.7)` + blur — but the seam returns.
