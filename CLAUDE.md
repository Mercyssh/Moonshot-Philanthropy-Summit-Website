# CLAUDE.md

---

## How to respond to me

<!-- Your rules go here. A few starters — keep, change or delete them. -->

- Don't re-explain code I can read. Explain the *why* when it isn't
  obvious from the diff.
- Don't explain every minute detail of the changes unless i ask explicitely
- Point out potential future issues if you think there could be any. When pointing out potential future issues, highlight the text when writing them. Explain the circumstance that would trigger them, and mention a potential fix in a concise manner
- When adding any new Variables which control visual parameters, list them out along with what they control in a table format
- Try to keep your messages concise, don't spend too many tokens on the message, I would rather you focus on the code output 

## Workflow

- **Do not start a preview server or verify in the browser.** I check
  the site myself. Write the change, explain it, and stop. I will ask
  for a verification pass when I want one.
- Don't leave scratch files in the repo. Clean up anything temporary.
- Prefer editing existing files over adding new ones.


## Effects system

Every interactive effect follows the same pattern, and new ones should
too:

1. A boolean in the `EFFECTS` object at the top of `script.js`.
2. An `init<Name>()` function that returns early if its flag is false.
3. If enabled, it adds an `fx-<name>` class to `<html>`.
4. All related CSS is nested under that `fx-` class.

The point is that flipping one boolean removes the effect completely —
JS *and* CSS — with nothing left behind. Keep it that way.

Effects that respond to the cursor should check `finePointer()` and
provide a touch alternative or disable themselves. Anything that moves
should check `reducedMotion()`.

## Gotchas already hit
Worth knowing before touching these areas:
- The `* { box-sizing }` reset does **not** match pseudo-elements. Set
  `box-sizing: border-box` explicitly on `::before` / `::after` that
  have borders.
- `[hidden]`'s `display: none` comes from the UA stylesheet, so *any*
  author `display` rule beats it. There is a `[hidden] { display: none
  !important }` override near the top of the CSS — leave it.
- Composing transforms: if two rules both set `transform` on one
  element, the later one wins silently. Feed both into a single
  `transform` via CSS variables instead (see `.btn`).
- `prefers-reduced-motion` needs `animation-delay` zeroed as well as
  `animation-duration`, or staggered content stays invisible.
- `.agenda-item::before` is the timeline dot and `.hero__arc` is an
  opaque curve — both have bitten effects that assumed those slots were
  free.

---

<!-- Personal preferences that should apply across all your projects,
     not just this one, belong in ~/.claude/CLAUDE.md instead. -->
