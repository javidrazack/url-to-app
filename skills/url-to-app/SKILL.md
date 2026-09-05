---
name: url-to-app
description: Recreate a website or app from a live URL as a working codebase, using reference styles, page structure, and interactions. Use when the user asks to build an app from a URL, recreate a dashboard or template, or turn a site into a usable starter. Do not infer a build request from a bare URL without supporting context, or use for a site review or token extraction alone.
---

# URL to App

Turn the requested parts of a live reference into a working, documented app. Match the observed design language and agreed behavior; distinguish a frontend with demo data from a service with production authentication and persistence.

## Phase 0 — Establish scope

Reuse choices already supplied in the conversation and inspect the target workspace before scaffolding. Preserve existing stack, repository conventions, branding, and unrelated changes. In a new project, default to React + Vite + strict TypeScript + Tailwind CSS; choose compatible versions using current official documentation.

State reasonable assumptions and continue. Batch only missing questions that materially affect implementation: which pages when scope is ambiguous, whether substantial features need real integration, and any required deployment target. A request for one screen stays one screen. For a whole-app recreation, inventory the reference's relevant pages before estimating scope.

- Match the reference's observed themes. Add accent/density controls or other features only when present or requested.
- Use visible demo content where appropriate to the request. For a generic starter, use neutral branding and fictional data; for an authorized branded build, preserve requested names/assets. Do not import unrelated project context. Inspect reference styles without vendoring proprietary source or assets; use user-provided or appropriately licensed assets when authorized.
- Treat auth, persistence, maps, editors, and drag-and-drop as behaviors to specify. Installing a UI dependency alone does not implement a real integration. Label mock/stub behavior and any missing service configuration.
- Use parallel agents only when authorized, available, and useful for independent work; otherwise follow the same phases serially. No user refusal is needed for a solo build.

## Phase 1 — Research the reference

Read [references/research.md](references/research.md). Produce a scoped route inventory, token table with source/theme context, page anatomy notes, and representative desktop/mobile captures. Use rendered navigation and computed styles when static HTML/CSS is incomplete. Mark inaccessible pages and inferred values instead of claiming complete coverage.

## Phase 2 — Foundation

For a new Vite app, read [references/foundation.md](references/foundation.md) for a complete minimal scaffold and semantic token engine. Adapt to the existing stack when present; do not apply Vite routing/build recipes to another framework unchanged. Get the starter's typecheck, lint, and build passing before page construction.

## Phase 3 — Shared components and shell

Build the primitives required by the scoped pages, plus repeated patterns such as PageHeader and DataTable. Keep primitives independent of route data. Use semantic token classes, documented prop APIs, accessible controls, and appropriate loading/empty/error states.

For Radix primitives, use namespace imports when accessing `.Root`/`.Trigger` parts. Keep context-dependent parts inside their provider; expose an Avatar `name` convenience prop if useful. Let Dialog/Sheet manage focus and Escape. Verify keyboard operation and focus return in the composed app.

Keep a central route registry with navigation metadata; detail/edit routes need not appear in the sidebar. Derive menus and breadcrumbs from that registry where useful. Establish shared mock/data APIs before building consumers. For a multi-page Vite app, use lazy page imports with stable Suspense fallbacks from the start unless measurements justify another approach.

## Phase 4 — Build the scoped pages

Read [references/parallel-dispatch.md](references/parallel-dispatch.md) when delegating. Give agents exclusive file ownership and explicit shared APIs, and have the orchestrator integrate routes. For serial work, keep the same shared contracts without dispatch overhead.

Implement the agreed interactions, not just visible controls. Use representative deterministic fixtures and concrete IDs for detail routes. Record external services or inaccessible reference states that prevent full implementation.

## Phase 5 — Optimize, then verify the final app

Read [references/verification.md](references/verification.md). Measure production output and optimize material bottlenecks before the final gate. Optional installed design/performance skills can help, but basic accessibility and functional checks do not depend on them.

Final gate: typecheck → lint → production build → preview that build → route sweep → representative interaction and visual checks. The bundled checker takes a JSON manifest with route-specific content expectations; an HTTP 200 or nonempty root is insufficient. Rebuild and repeat affected checks after any later code/configuration changes.

Batch fixes efficiently. Continue until required checks pass or a concrete blocker prevents progress; report blockers and incomplete scope accurately. Limit optional cosmetic refinement, not correction of known defects. Never weaken an assertion just to make a failed check pass.

## Phase 6 — Documentation and handoff

Read [references/docs.md](references/docs.md). Update existing documentation or create AGENTS.md, README.md, and DESIGN.md at a depth appropriate to the project. Document implemented behavior, mock/stub boundaries, route extension patterns, token sources, commands, and verification results.

Inspect Git status and repository boundaries before making repository changes. Initialize only a new standalone project when appropriate; preserve existing history and unrelated work. Follow the user's commit/delivery instructions, stage only intended files, and do not treat a successful local build as deployment.

Report completed scope, limitations, final verification evidence, measured bundle output, and documentation locations. Call the result production-ready only when the agreed production integrations and checks support that claim.
