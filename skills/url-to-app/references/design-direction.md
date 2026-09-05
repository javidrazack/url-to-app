# Design direction from the reference

Read before choosing components or building pages. This adapted guidance is credited in [NOTICE.md](../NOTICE.md).

## Infer instead of interviewing

A novice can supply only a URL. Infer product purpose, audience, primary task, page types, theme, density, layout, typography, assets, and motion from the reference. Explain the direction in one short sentence and continue; do not ask the user to choose design dials, libraries, fonts, or quality commands.

When this skill is invoked with a bare URL, start building the referenced experience. On a product/app reference, include its core internal navigation and reachable detail/create/edit flows unless the user narrows scope. On a landing page, build that page and necessary linked interaction surfaces; an outbound link does not authorize rebuilding the entire internet. Record the route inventory before work, implement in batches if large, and keep unfinished routes visible in the coverage record. Never silently deliver only the first screen as a complete app.

Preserve an existing project's stack, intended behavior, and unrelated changes. Default to a new React/Vite app only when the workspace is new. Reuse connected services where authorized. Without a backend, deliver a complete local demo data adapter with consistent fixtures and real local interaction results; label demo data and local persistence plainly. Do not fake server authentication, payments, email delivery, or multi-user synchronization. Missing external access can block those integrations without blocking the rest of the UI.

## Pick the right design register

| Surface | What quality means | What refinement should avoid |
|---|---|---|
| Operational app: dashboard, editor, settings | Fast scanning, clear selection/action states, consistent controls, useful density, predictable navigation | Oversized editorial type in tables, entry choreography, unfamiliar controls added for novelty |
| Marketing or product landing | Clear proposition and next action, intentional composition, distinctive imagery/type, content-driven section rhythm | Repeated filler cards, meaningless gradients, fake social proof, animation that hides content |
| Reading: docs, help, article | Navigation, legible measure, hierarchy, links, uninterrupted reading | Decorative motion, unnecessary panels, compressed long-form text |
| Portfolio/gallery | The work dominates, images and captions are trustworthy, navigation recedes | Interface decoration competing with the work, unrelated stock imagery |

A product's landing page and its dashboard may need different registers. Infer expression, motion, and density separately for each; these are internal choices, not an intake questionnaire. Match the reference before increasing expression. Calm, familiar UI can be excellent; unusual layout is not itself quality.

## Write a compact design contract

Put it in DESIGN.md alongside researched tokens, before implementing the first representative slice:

- Audience and primary task; main route and core user journey.
- Scope and route inventory location; local demo versus connected-service behavior.
- Reference identity to preserve: type roles, palette, density, grid, navigation, imagery treatment, and two or three distinctive details visible in captures.
- Refinements to make: concrete defects or gaps such as low-contrast labels, clipped menus, mobile overflow, dead controls, inconsistent spacing. Keep an evidence/reason for each deliberate departure.
- Layout rules for mobile, intermediate, and wide screens; supported themes; motion/reduced-motion behavior.
- Component/token conventions and asset sources. Use coherent licensed assets; do not vendor a paid template or invent brand/customer claims.
- Acceptance evidence: representative routes/states, required user journeys, screenshot locations, and performance measurement conditions.

Do not replace reference identity with a preferred preset, ban its chosen font/color/icon library, or redesign its navigation for novelty. If the reference contains a usability defect, preserve its character while correcting the defect and recording the change. If the user explicitly requests an exact copy, keep the fidelity target and report any necessary accessibility/behavior tradeoff.

## Resolve design questions with focused evidence

For an uncertain pattern, name the question before searching: for example, how a dense action toolbar should reflow while preserving its primary action. Inspect the supplied reference's relevant state, nearby routes and existing project components first. Use a small additional reference only if it answers that question; match task and information density, not just color or trend. Record what was observed, what is inferred, and which implementation decision the evidence changes. Stop gathering inspiration when the decision is supported.

External reference libraries, hosted design tools, packs and assets are optional. The default workflow works from the supplied URL and bundled guidance. Missing paid access must not stall it or be concealed when it limits evidence. Preserve the local design system and licensed asset boundaries; do not merge unrelated visual styles into a collage or replace DESIGN.md merely because a source proposes its own authority.

## Prove the direction with one working slice

Build shell + the main route + one important interaction, including relevant loading/empty/error states. Also exercise the highest-risk shared composition: related form fields, a cramped action group, a dense table, or an overlay as appropriate. Capture phone, intermediate and desktop layouts, inspect the images, and walk the interaction before propagating patterns to every page. Use [layout-contracts.md](layout-contracts.md) for applicable relationships between controls. Fix systematic problems in tokens/shared components now. This is an agent quality gate, not a mandatory user approval checkpoint.

When delegating, pass the design contract, reference captures, validated slice, and shared APIs to every agent. Do not let each page invent its own visual language.
