# url-to-app

**One skill. A reference URL. A working app with built-in design refinement.**

Install url-to-app, then supply a reference website. The agent researches its identity and behavior, builds the app, refines the rendered UI, and verifies the final production build. Design direction, visual craft, interaction hardening, performance optimization, and visual critique are included. Users do not need to install Impeccable or Taste separately or know which refinement commands to invoke.

## Install

```bash
npx skills add https://github.com/javidrazack/url-to-app --skill "url-to-app"
```

Or install through the Claude Code plugin marketplace:

```bash
/plugin marketplace add javidrazack/url-to-app
/plugin install url-to-app
```

Re-run the install command to update the skill and its bundled references/scripts. For a manual installation, copy the **entire** `skills/url-to-app/` folder, including its notices, references, scripts, and license files.

## Use

With the skill selected, a URL alone is enough:

```text
$url-to-app https://example.com/dashboard
```

You can narrow or override the defaults:

```text
Build https://example.com/dashboard, but just orders and order details.
Use this reference for my existing app's settings page. Keep the stack and branding.
Recreate https://example.com/product with its editorial typography and restrained motion.
```

The agent infers ordinary choices instead of interviewing the user about fonts, libraries, design dials, or QA commands. It asks only for material missing decisions or access that blocks a real integration. Explicit review/research requests stay reviews; they do not trigger an app build.

## The built-in flow

1. **Research and design direction.** Inspect rendered navigation, tokens, screenshots, content, and interactions. Preserve the reference's identity and record the scope and core journey.
2. **One working slice.** Build the shell, main page, and one important interaction. View desktop/mobile captures and refine the shared design before expanding it.
3. **Complete the app.** Implement in-scope pages and observable outcomes, with shared components and a coherent data adapter. Keep track of every route and unfinished service integration.
4. **Critique and refinement.** Review composition, hierarchy, type, density, imagery, copy, state coverage, and consistency against the reference.
5. **Hardening and optimization.** Check real inputs, recovery paths, keyboard/focus, responsive behavior, and reduced motion. Measure and fix actual loading/interaction bottlenecks.
6. **Production verification.** Build and preview the final output; run route/UI audits, test user journeys, inspect screenshots, fix issues, and repeat affected checks.
7. **Evidence and handoff.** Deliver the app with project docs, journey results, reference/final captures, and a quality report that distinguishes passed, failed, and unverified gates.

Dense dashboards use predictable, efficient product UI. Marketing and portfolio surfaces get reference-led composition and expression. Common fonts, colors, cards, and icons are not banned mechanically; visual decisions must serve the reference and the user's task.

## Included capabilities

| Capability | Included implementation |
|---|---|
| Reference-driven direction | `design-direction.md`: infer audience, page type, expression, motion, density, and a compact design contract |
| Visual craft | `visual-craft.md`: hierarchy, typography, spacing, semantic color, assets, responsive composition, and purposeful motion |
| Complete interactions | `interaction-quality.md`: observable task results, state/recovery coverage, realistic input, keyboard/focus, and honest data boundaries |
| Performance refinement | `optimize.md`: measured bottlenecks, asset/loading strategy, render cost, motion, layout stability, and revalidation |
| Critique and polish | `design-review.md`: required rendered comparison, prioritized fixes, concrete evidence, and visual sign-off |
| Automated UI evidence | `ui-audit.mjs`: route readiness, axe checks, overflow, broken images, viewport screenshots, and limited navigation observations |

These are adapted, self-contained playbooks with original audit tooling, **not the full Impeccable or Taste products**. Their live editors, hooks, native platform workflows, and detectors are not vendored. Source revisions, adaptations, and licenses are recorded in [NOTICE.md](skills/url-to-app/NOTICE.md).

## Quality and scope

A clean build or scanner cannot certify visual taste. The agent must open the rendered app, view screenshots, compare against the reference, and walk meaningful interactions. It cannot call an unviewed screenshot a passed visual check. Required defects remain open until fixed or clearly blocked.

By default, an app reference includes core navigation and reachable detail/create/edit flows; a landing reference includes that page and required interaction surfaces. User constraints take precedence. Without connected services, the app uses an explicitly labeled local demo adapter with working local behavior. This is not a substitute for production authentication, payments, authorization, or multi-user persistence. Real integrations need their own access and validation.

No prompt guarantees production readiness. This skill makes design and behavior checks required and makes missing evidence visible rather than promising quality from a style preset.

## Requirements

- A coding agent with filesystem/build access, browser control, and the ability to view captured images.
- A Node runtime supported by the selected framework and dependencies.
- Reference access or supplied captures for inaccessible pages.
- For bundled checks: Playwright, `@axe-core/playwright`, and matching Chromium in the generated app's development environment. The agent installs these when permitted; no separate design skill is required.

If a required tool cannot run, the agent completes independent work and reports the gate as unverified instead of claiming a pass.

## Browser checks

From the generated app directory, after building and starting its production preview:

```bash
npm install -D --save-exact playwright @axe-core/playwright
npx playwright install chromium
node <skill-path>/scripts/ui-audit.mjs http://127.0.0.1:4173 qa/routes.json qa/ui
```

The UI audit checks each manifest route at mobile, intermediate, and desktop widths, plus a reduced-motion mobile profile. It creates a unique evidence directory containing `report.json` and PNG captures. It reuses the route checker, so a duplicate full route sweep is unnecessary.

The manifest introduced in v2.0.0 remains compatible:

```json
[
  { "path": "/dashboard", "selector": "main[data-page='dashboard'] h1", "text": "Dashboard" }
]
```

Choose selectors for **completed route content**, not the shell or loading fallback. See [verification.md](skills/url-to-app/references/verification.md) for themes, redirects, authenticated sessions, state coverage, and limitations. For a focused route-only check:

```bash
node <skill-path>/scripts/route-sweep.mjs http://127.0.0.1:4173 qa/routes.json
```

Both CLIs use exit `0` for passing machine checks, `1` for failures, and `2` for invalid input/setup failure. UI audit success still requires manual review of visual quality, keyboard behavior, axe `incomplete` findings, hidden states, and actual motion. Its unthrottled navigation observations are not field Core Web Vitals or INP.

## Development checks

From a working directory with Playwright and axe installed, with Chromium available:

```bash
node --test <skill-path>/scripts/route-sweep.test.mjs <skill-path>/scripts/ui-audit.test.mjs
```

The regression suites use local fixtures to exercise route and UI failure detection. [Evaluation scenarios](evals/scenarios.json) describe broader reference-to-app behavior to test independently; they are not a claim that a full model benchmark has been run.

## License

Original url-to-app code and instructions: [MIT](LICENSE), Copyright (c) 2026 javidrazack. Selected design guidance is adapted from [Impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0) and [Taste Skill](https://github.com/Leonxlnx/taste-skill) (MIT); their notices and licenses ship with the skill. See the [attribution and adaptation record](skills/url-to-app/NOTICE.md).
