# Documentation trio — AGENTS.md, README.md, DESIGN.md

Generate all three before shipping. They serve different readers: agents (AGENTS.md), developers (README.md), and design systems tooling (DESIGN.md). Skimping on AGENTS.md costs the most — it is the contract that keeps future AI contributions on-system.

## AGENTS.md (the agent contract)

Sections, in order:

1. **Stack table** — framework, styling, routing, primitives, charts, forms, icons, fonts. One row each.
2. **Commands** — dev/build/lint/typecheck with one-line purposes. Include the QA screenshot hook if theming supports it (`?theme=dark&accent=blue`).
3. **Non-negotiable conventions** — the 8–10 rules that keep generated code on-system: `@/` alias + `import type`, semantic token classes only (never raw hex), `.num`/`.amount` on figures, sentence-case labels, radius ladder, shadow vocabulary, icon rules, page scaffold, density vars, accent-aware classes.
4. **Component inventory** — every primitive and app-level pattern with its prop API in compact notation: `StatCard{label,value,delta:{value,direction,tone?},sub?,children?}`. Include newer additions the moment they land.
5. **Data layer** — the mock API factory signature and the swap-to-real-endpoint story.
6. **Reference implementations index** — a table mapping needs to exemplar files ("CRUD list → `src/pages/management/orders/list.tsx`"). This is the highest-leverage section: agents copy the closest real page instead of inventing.
7. **Extension recipes** — "How to add a page" (must include the lazy-import + `page()` helper requirement with a never-import-statically prohibition), "How to add a primitive".
8. **Design rules** — the binding named rules from DESIGN.md, restated in one line each.
9. **Known exceptions** — documented slop-detector advisories and accepted lint warnings, so future runs don't "fix" intentional signatures.

Write rules with their *why* ("Radix Dialog owns focus and Escape — hand-rolled listeners double-close stacked sheets"), not as bare MUSTs.

## README.md (the human quickstart)

1. One-paragraph pitch + what's included (route count by area).
2. Quickstart block + scripts table.
3. Screenshots table (commit 4–6 PNGs under `docs/`: light, dark, a distinctive app, settings).
4. Theming summary (modes, accents, densities, RTL + the QA hook).
5. Structure tree (annotated, ≤15 lines).
6. Documentation pointers (AGENTS.md, DESIGN.md).
7. License stance: original implementation inspired by the reference's design language; no vendored source or assets.

## DESIGN.md (portable token spec)

YAML frontmatter with the machine-readable layer: `colors` (descriptive slug names, not `blue-800`), `typography` roles (display/headline/title/body/label/numeric), `rounded` scale, `spacing`, `components` (≤8 props each, `{colors.x}` references). Then markdown sections in canonical order: Overview (named creative north star), Colors (with **named rules** — short, citable doctrines like "The Two-Teal Rule: white text sits only on the deep shade"), Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.

Keep frontmatter normative; prose explains application. Don't duplicate values between frontmatter and prose.

## Brand isolation sweep (before commit)

```bash
grep -ri "<client-project-names>\|<reference-brand>" src/ *.md package.json index.html
```

Zero hits required — including domain vocabulary from the user's other work ("payer", internal product names). Templates must read as generic. Fix leaks with neutral copy, then commit.
