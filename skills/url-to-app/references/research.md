# Research playbook — turning a URL into ground truth

Goal: end this phase with (a) exact design tokens, (b) the full page inventory, (c) visual captures, (d) a research summary. Everything downstream is built from these four artifacts.

## 1. Capture the page

```
webfetch the URL (html format) and save the working copy
npx -y playwright screenshot --viewport-size=1440,900 --wait-for-timeout=3000 <url> ref-desktop.png
npx -y playwright screenshot --viewport-size=390,844  --wait-for-timeout=3000 <url> ref-mobile.png
```

Repeat captures for 2–3 key routes if the reference has multiple pages. These images are the comparison target for the final verification sweep — keep them.

## 2. Extract tokens from stylesheets (never from pixels)

Pixel sampling or DOM-computed styles routinely miss the true scale — in the proven run, sampling picked a pale mint tint where the compiled CSS held a saturated primary plus a full shade family.

1. Find stylesheet URLs in the saved HTML (`<link rel="stylesheet">` or `/_next/static/chunks/*.css` patterns).
2. Download each CSS file to a temp dir.
3. Grep for custom-property definitions and dedupe:

```bash
grep -o '\-\-<prefix>-[a-z-]*:[^;]*' *.css | sort -u
```

Look for these families (names vary by site): `--primary`, `--background`, `--card`, `--muted-foreground`, `--border`, `--ring`, `--radius*`, `--shadow*`, sidebar-specific vars, chart palettes (`--chart-1..5`), and spacing metrics (`--page-padding`, `--card-padding`, table cell paddings).

4. Record **both light and dark values** when the site ships both (they usually appear twice — once under `:root`/light, once under `.dark`).
5. Also capture: font families (`grep -o 'font-family:[^;}]*'`), the radius scale, and any signature patterns (gradient recipes, grid overlays, glass headers with backdrop-blur values).

Deliverable: a token table — light column, dark column, plus layout metrics and fonts.

## 3. Enumerate the route inventory

From the saved HTML, extract every internal nav link:

```bash
grep -oE 'href="/[a-z-]+[^"]*"' page.html | grep -vE '_next|\.css|\.js|\.ico' | sort -u
```

Group by the reference's own nav sections. This list becomes:
- the page/wave plan,
- the generated project's nav config,
- the final route-sweep input.

Note which routes are placeholders in the reference itself (mark them as stubs in the plan) and which need heavy dependencies (editor → tiptap, map → leaflet, kanban → dnd-kit).

## 4. Page anatomy

For the primary route (and any distinctive ones), read the saved DOM and record section order in one line each, e.g. `hero (gradient, grid overlay, $value, delta pill, CTA, right-side sparkline) → 4 stat cards (label/value/delta/micro-viz) → tiers | growth chart → reasons | trials`. Note recurring anatomy patterns: stat card structure, list row structure, badge/pill conventions, uppercase vs sentence-case labels, tabular-numeral usage. These become the generated design system's component specs.

## 5. Research summary

End the phase with a compact summary the user can correct: token table, fonts, layout metrics, route inventory grouped by nav section, per-page anatomy notes, and any scope questions that fell out (heavy deps, auth pages, docs site). Do not start building until the Phase 0 interview answers are locked against this summary.
