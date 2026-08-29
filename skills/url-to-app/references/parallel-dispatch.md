# Parallel dispatch — building 40+ pages without integration hell

Sub-agents give 10× throughput on page construction, but only under two rules: every agent gets the **same conventions block**, and every agent owns an **exclusive file list**. Every cross-agent bug in the proven 47-route run traced to a violated ownership boundary.

## Orchestrator-owned files (agents NEVER edit)

- `src/App.tsx` — the route table. The orchestrator wires all routes centrally after each batch.
- `src/routes/nav.ts` — nav config (sidebar, breadcrumbs, titles derive from it).
- Any mock file another domain owns.
- Shared infrastructure built before the first batch: mock API factory, DataTable, PageHeader/Field, chart wrappers.

Why: agents working in parallel WILL collide on shared files — duplicate route entries, mismatched imports, half-written edits read by another agent's typecheck. Exclusive ownership makes integration deterministic.

## Batch plan

1. **Batch 0 (orchestrator solo)**: foundation, token engine, primitives, nav config, shared infrastructure. Nothing dispatches until `tsc + build` are green here.
2. **Batches of ~5 agents**: one agent per page, or one per resource (a CRUD resource = list + create + edit + detail + its own mock file, all owned by one agent). Group small related pages (notifications/support/timeline/search) into one agent.
3. After each batch: orchestrator wires routes, runs the full gauntlet, fixes integration bugs, then dispatches the next batch.

## The shared conventions brief

Start every agent brief with this same block (adjust project-specific tokens):

```
PROJECT: <root> — Vite + React 19 + TS strict + Tailwind v4 ("<style>" aesthetic).

CONVENTIONS (non-negotiable):
- `@/` imports; `import type` for types; no unused vars/imports (strict noUnusedLocals).
- Tokens: bg-background, bg-card, text-foreground, text-muted-foreground, border-border,
  bg-muted, text-primary-strong, bg-primary-fade; status = tint + strong pairs
  (bg-success-tint text-success-strong); radius rounded-card/card-lg/input; shadows shadow-xs/card/pop.
- cn() from '@/lib/utils'. Icons: lucide-react strokeWidth={1.8}. NO emoji — initials avatars only.
- Numbers/money: className "num"/"amount". Labels sentence case; TableHead auto-uppercases.
- Scaffold: <div className="space-y-5"> → <PageHeader/> from '@/components/app/page-header'.
  Shell owns page padding — pages render content only.
- Radix imports are namespace-style: import * as DialogPrimitive from '@radix-ui/react-dialog'.

SHARED INFRA (read these first): <list the exact files: mock/api.ts, data-table.tsx, page-header.tsx, ui/*>

YOUR SCOPE — create EXACTLY these files and nothing else:
<exclusive file list>

VERIFY: cd <root> && npx tsc --noEmit 2>&1 | grep -iE "<your-keyword>" ; npx eslint <your files>.
Fix errors in YOUR files only — other agents run in parallel; ignore unrelated errors.

RETURN: created paths + 3-line summary + deviations.
```

The `grep` filter on tsc output matters: a full-project typecheck mid-parallel shows other agents' transient errors; agents must not "fix" files they don't own.

## Brief anatomy that prevents rework

- **Point at shared infra by path** and name the exact exports — agents that guess APIs invent variants (this caused a 19-file Avatar API mismatch in the proven run).
- **Name the exact files** ("create EXACTLY these files") — prevents agents from "helpfully" wiring routes or editing nav.
- **Ask for deviations in the return** — agents make judgment calls; surfacing them lets the orchestrator correct systemic drift once instead of 19 times.
- **Expect ~1 in 3 dispatches to fail on provider/network errors.** Retry failures; batch results as they land rather than synchronizing.

## Central integration checklist (after each batch)

1. Wire routes for the batch's pages (see verification.md for the react-router v7 constraint).
2. Full gauntlet: `tsc --noEmit` → eslint → build.
3. Grep new files for convention drift (uppercase labels, raw hex, emoji, non-namespace Radix imports).
4. Fix systemically: if one agent got an API wrong, assume siblings did too — fix the shared component API rather than 19 call sites when possible (e.g., adding a `name` prop to Avatar instead of editing every usage).
