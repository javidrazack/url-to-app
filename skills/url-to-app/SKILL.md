---
name: url-to-app
description: Build a complete, production-grade React+Vite admin/dashboard web app from a live URL reference — design tokens extracted from the site's actual CSS, a reusable component library, every page from the reference's navigation, agent+human documentation, and a verified optimized build. Use this skill whenever the user shares a URL of a dashboard, admin panel, SaaS app, or any UI they want recreated as a real codebase, says "build this like [template]", asks to turn a design/site into a project, pastes a link with instructions like "make me this", or says "url to app" — even when they provide nothing but the link. Also use when the user asks to extract a design system or template from a website into a usable starter.
---

# URL to App

Turn a live URL into a complete, hand-off-ready React project: tokens extracted from the site's real stylesheets (not eyeballed pixels), a reusable shadcn-style component library, every page in the reference's navigation, documentation for humans and agents, and a verified, code-split production build.

The method below was proven end-to-end on a 47-route admin template. Follow the phases in order; each has one non-obvious insight that makes or breaks the result.

## Phase 0 — Scope interview (ask once, batched)

Before writing code, ask the user these in a single round (offer recommended defaults so they can answer in one word each):

1. **Stack** — default: Vite 8 + React 19 + TypeScript strict + Tailwind CSS v4. Honor explicit overrides (Next.js, etc.) but warn when a stack change degrades the recipe (e.g., Next needs its own routing/data idioms).
2. **Theme scope** — default: light + dark + runtime accent/density theming (the full engine). Simpler option: light-only.
3. **Demo content** — default: mirror the reference's visible content 1:1 (numbers, names) for fidelity. Alternative: neutral placeholders.
4. **Delivery** — default: waves with checkpoints (foundation → shell → pages → docs), parallel sub-agents for page construction. Solo build only if the user refuses sub-agents.
5. **Heavy features** — if the reference includes rich text, maps, drag-and-drop, or auth flows: ask real-vs-stub. Real means adding `@tiptap/*`, `react-leaflet`, `@dnd-kit/*` deps.
6. **Brand isolation** — confirm the output is a generic template: zero references to the user's other projects, zero copied source/assets from the reference. Recreate the design language; never vendor code, fonts binaries, or images from the target site (it is likely a paid template — original implementation is both safer and more useful).

Record the answers; they parameterize everything downstream.

## Phase 1 — Research the reference

Read `references/research.md` and follow it exactly. Summary:

1. Fetch the URL and save a working copy of the HTML.
2. **Extract tokens from compiled stylesheets, never from pixels** — pixel sampling misses the real scale (it grabbed a pale tint once where the true primary was a saturated green). Grep the site's `.css` files for custom-property blocks (`--brand-*`, `--app-*`, shadcn-style `--primary` etc.) in both light and dark variants.
3. Enumerate the full route inventory from nav links in the DOM — this defines the page list and the wave plan.
4. Capture desktop + mobile screenshots of the key reference pages (Playwright CLI) — these are the visual ground truth for later comparison.
5. Write a short research summary: token table, layout metrics, page anatomy per route, section order.

## Phase 2 — Foundation

Scaffold with the exact recipes in `references/foundation.md`: strict TypeScript config, ESLint flat config, Tailwind v4 via the Vite plugin, self-hosted fonts (fontsource), `cn()` util. Then build the token engine: semantic CSS variables on `:root`/`.dark`, mapped into Tailwind through `@theme inline` so utilities stay live-bound — this is what makes runtime theme switching work with zero re-render cost. If theming scope includes accents/density, drive them with `data-*` attributes on `<html>` and a small persisted ThemeProvider.

## Phase 3 — Component library

Build shadcn-style primitives in `src/components/ui/` before any page: Button, Badge, Card family, Input/Textarea/Label, Checkbox, Switch, Select, Separator, Skeleton/Spinner, Avatar, Breadcrumb, Tabs, DropdownMenu, Dialog, Sheet, Tooltip, Table, Progress, EmptyState. Rules that prevent the most common agent failures:

- CVA variants + `cn()` + `data-slot` attributes on every part.
- Radix under the hood, imported as namespaces: `import * as DialogPrimitive from '@radix-ui/react-dialog'` — the parts live at `DialogPrimitive.Root` etc. Named imports like `{ Dialog as DialogPrimitive }` do NOT give you `.Root` and will fail typecheck.
- Give `Avatar` a `name` prop that renders initials internally. Agents otherwise compose `AvatarFallback` standalone, which throws at runtime.
- Radix Dialog/Sheet own focus and Escape (including stacked sheets) — never hand-roll Escape listeners.
- Compose `page()`-style helpers only at the route layer; keep primitives pure.

## Phase 4 — Pages via parallel dispatch

Read `references/parallel-dispatch.md`. The core pattern:

- One **nav config file** (`routes/nav.ts`) is the single source of truth: sidebar groups, mobile nav, breadcrumbs, and page titles all derive from it.
- Dispatch one sub-agent per independent page or resource, in batches of ~5. Each brief contains: the shared conventions block (same text every time), the agent's exclusive file list, pointers to the shared infrastructure it consumes, and a self-verification step filtered to its own files.
- **Agents never touch shared files** — `App.tsx`, `nav.ts`, or another domain's mock data. The orchestrator alone wires routes centrally after each batch. This is the single most important rule; violations are the source of every integration bug.
- Shared infrastructure (mock API factory, DataTable, PageHeader) is built once by the orchestrator *before* the first page batch.

## Phase 5 — Integration + verification gauntlet

Read `references/verification.md`. In order:

1. Wire the full route table centrally. Constraint: react-router v7 allows only `<Route>` elements as children of `<Routes>` — a helper component that returns routes will compile but crash at runtime with "not a <Route> component". Map over data inline instead.
2. `tsc --noEmit` → ESLint → production build, fix everything.
3. Run the bundled route sweep: `node <skill-path>/scripts/route-sweep.mjs <base-url> <routes.csv>` — it loads every route headless, fails any route whose app root stays empty, and captures page errors. Fix in one batch, re-run once.
4. Screenshot sweep (desktop, mobile, dark via the theme QA hook) and compare against the reference captures from Phase 1. One batched fix round, one confirmation round, stop.

## Phase 5b — Optimize (measured + impeccable)

1. Measure the build first. If the entry chunk exceeds ~300 KB minified, convert page imports to `React.lazy` + a `page()` helper with a stable Suspense fallback, and re-measure. Expect an order-of-magnitude drop (a 1,880 KB single bundle became a 358 KB entry + 130 on-demand chunks). Document the lazy-import requirement in the generated AGENTS.md so future agents don't regress it.
2. If the impeccable skill is installed, load and follow its `reference/optimize.md` (UI perf: render cost, interaction, layout shifts) and `reference/audit.md` (a11y/perf/responsive) against the primary dashboard + one heavy route — this is optimization beyond bundle bytes and slop removal (slop itself is caught by `detect.mjs` in the Phase 5 visual sweep).

## Phase 6 — Documentation trio

Read `references/docs.md` for skeletons. Generate all three:

- **AGENTS.md** — the agent contract: stack table, commands, non-negotiable conventions, component inventory with prop APIs, a "reference implementations" index mapping needs to exemplar files, extension recipes ("how to add a page" must include the lazy-import requirement), and the binding design rules.
- **README.md** — human quickstart, scripts, structure, screenshots (commit them under `docs/`), theming summary, license stance.
- **DESIGN.md** — portable token frontmatter (colors/typography/rounded/spacing/components) plus the binding rules with memorable names.

## Phase 7 — Ship

`git init`, `.gitignore` (node_modules, dist), one clean initial commit. Grep the tree for the user's other project names to enforce brand isolation. Report: route count, bundle sizes (before/after splitting), verification results, and where the docs live.

## Pitfalls that cost real time (learned the hard way)

- **Pixels lie; stylesheets don't.** Token extraction from rendered DOM missed the true primary color entirely.
- **Shared-file ownership is the integration contract.** Every cross-agent bug in the proven run traced to an agent editing a file another agent also owned.
- **react-router v7** rejects non-`<Route>` children of `<Routes>` at runtime, not compile time — the sweep catches it.
- **Radix imports** must be namespace-style; named imports compile in some versions and fail in others.
- **Verify routes by rendering, not by HTTP status** — an SPA returns 200 for a blank crash page. The sweep checks actual DOM output.
- **Lazy-load pages from the start of documentation**, not as an afterthought — agents copy the recipe they read.
