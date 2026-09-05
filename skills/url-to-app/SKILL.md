---
name: url-to-app
description: Build and refine a complete working app from a reference website URL, with built-in design direction, visual craft, interaction hardening, performance optimization, and rendered UI review. Use for URL-to-app requests, recreating a dashboard/site/template, or a bare reference URL supplied to this skill. Infer sensible defaults and build without requiring design expertise or separately installed design skills. Do not use for explicit review, research, or token-extraction-only requests.
---

# URL to App

A reference URL is enough to start. Deliver a working app with the reference's identity, complete in-scope interactions, and a visually reviewed production build. This skill includes adapted Impeccable/Taste design guidance and original browser checks; no separate design skill or optional optimize command is needed. See [NOTICE.md](NOTICE.md) for attribution and the scope of the integration.

## The default experience

When invoked with only a URL, inspect it, infer the product and design, explain the direction briefly, and proceed. Do not turn the workflow into a stack/theme/font interview or ask the user to invoke refinement commands. Respect explicit requests to inspect rather than build. Reuse supplied choices and existing project conventions; default to React + Vite + strict TypeScript + Tailwind only in a new workspace.

Build the reference's core app navigation and reachable detail/create/edit flows; a landing reference defaults to that page and necessary interaction surfaces. Honor a narrower requested scope. Inventory before implementation and track all remaining routes rather than silently shipping a partial app. Ask only when a missing decision or access blocks meaningful implementation; continue independent work.

Design refinement preserves the reference's character while correcting usability and implementation defects. Do not replace it with a generic preset or apply marketing animation/layout rules to dense operational screens. Preserve requested branding and verified content, use licensed assets, and label illustrative data. A local demo with working behavior is distinct from real server authentication, payments, or shared persistence.

## Required flow

### 1. Discover the product and reference

Read [references/research.md](references/research.md) and [references/design-direction.md](references/design-direction.md). Produce the route inventory, token provenance, desktop/mobile reference captures, primary journey, and a compact DESIGN.md contract. Classify each surface as operational, marketing, reading, or gallery and infer its expression, motion, and density. Record unseen pages and uncertain values.

### 2. Establish the foundation and prove one slice

For a new Vite app, read [references/foundation.md](references/foundation.md); adapt to the existing framework otherwise. Get typecheck, lint, and starter build passing.

Before editing UI, read [references/visual-craft.md](references/visual-craft.md) and [references/interaction-quality.md](references/interaction-quality.md); for React data/component work also use [references/react-quality.md](references/react-quality.md). Build the shell, main route, and one important interaction with relevant loading/empty/error states. Include the riskiest shared composition (such as a form row and a heading/action group), not only the main page's happy state. Use shared tokens and accessible primitives. Capture and **view** phone, intermediate, and desktop images, walk the interaction, and fix hierarchy, identity, typography, density, and responsive issues before copying the pattern across the app. This is an agent check, not a user approval checkpoint.

### 3. Build the complete scoped app

Create only the primitives and shared patterns the app needs; document their APIs. Maintain a central route registry including non-navigation detail/edit routes. Keep page data out of primitives, context-dependent parts inside their providers, and focus/overlay handling in proven accessible components. Use lazy page loading for multi-page Vite apps when appropriate.

Complete observable behavior, not clickable facades: navigation, filtering, CRUD, validation, state changes, and meaningful export/download outcomes where present. Use an explicit data adapter, coherent fixtures, and the promised persistence lifetime. Record journey/state coverage in `qa/journeys.md` using interaction-quality.md. Do not substitute success toasts for unimplemented actions or present local demo sessions as secure auth.

When useful and authorized, delegate independent pages using [references/parallel-dispatch.md](references/parallel-dispatch.md). Pass the design contract, validated slice, and exclusive ownership; otherwise continue serially. Delegation and extra skills are not prerequisites.

### 4. Critique and refine the complete experience

Read [references/design-review.md](references/design-review.md). Inspect actual renders and the main user journey. Compare with the reference, fix concrete weaknesses in composition, type, spacing, assets, copy, state coverage, and shared-system consistency, and preserve intentional identity. Apply the same standard to every distinct page pattern, supported theme, and key overlay. Use [references/layout-contracts.md](references/layout-contracts.md) to inspect composed controls and declare applicable alignment, size, and short-label assertions in the route manifest. Fix shared causes before local symptoms; a known layout defect is not optional decoration.

### 5. Harden and optimize

Finish the relevant edge cases in interaction-quality.md: long/missing data, failed/retried saves, duplicate actions, permissions, mobile navigation, keyboard/focus, reduced motion, and zoom. Missing integrations are explicit blockers, not hidden stubs.

Read and run [references/optimize.md](references/optimize.md) for **every build**. Measure the primary and heaviest route/interaction, fix material bottlenecks, and preserve visual quality and behavior. Do not report local navigation samples as field Core Web Vitals.

### 6. Verify the final production build

Read [references/verification.md](references/verification.md). Final gate: typecheck → lint → build → production preview → route/UI audit → journey/state checks → actual screenshot comparison and visual sign-off. Run the bundled `ui-audit.mjs` with the route manifest for viewport captures, axe checks, overflow, broken-image detection, and limited performance observations. It reuses the route checker. A standalone `route-sweep.mjs` remains available for focused route checks.

Use browser/tools already available or install the documented development dependencies in the generated project when permitted; do not require users to install Impeccable/Taste. If a tool cannot run, record the exact unverified gate and complete unaffected work; never silently skip it or claim a pass.

Batch fixes, rebuild, and repeat affected checks. Recheck all routes when shared layout/tokens/routing change. Resolve required failures or report a concrete blocker; limit discretionary redesign once the contract is met. Never weaken checks to hide defects. A nonempty root, clean scanner, screenshot file, or elapsed number of passes does not establish completion.

### 7. Document and hand off

Use [references/docs.md](references/docs.md). Update README.md, AGENTS.md, DESIGN.md, and `qa/quality-report.md` with actual scope, component/data contracts, verified journeys, inspected captures, performance evidence, limitations, and mock/service boundaries. Keep user-facing product copy free of implementation bookkeeping.

Open the finished app when possible. Report the outcome concisely with evidence and any missing service/browser coverage. Call it “verified UI with demo data” when that is what was tested; reserve whole-service production claims for verified integrations and deployment conditions. Preserve existing Git history and unrelated changes, and follow the user's commit/deployment instructions.
