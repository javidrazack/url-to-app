# Verification of the final app

A successful build, HTTP 200, or nonempty app root does not prove that a route works. Check route-specific content and required interactions against the final production build.

## 1. Measure and optimize before the final gate

Measure the production output and identify initial-route dependencies as well as the entry file. Use lazy route imports for a multi-page app when appropriate; avoid splitting only to improve a single reported number. Report raw/gzip sizes with their units and distinguish entry, shared initial dependencies, and deferred chunks. Do not promise a fixed reduction from another project's result.

Read [optimize.md](optimize.md) and perform its measurement/fix pass on every build. Read [design-review.md](design-review.md) for required visual critique and [interaction-quality.md](interaction-quality.md) for complete user journeys. These playbooks are bundled; no separate design skill installation is required.

## 2. Build and serve the production output

From the app directory:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Keep preview running using the environment's process/session tools and stop only the server you started afterward. Check actual server readiness. For another framework, use its production serve equivalent. Build success and preview do not verify a deployment host's rewrite/base-path configuration; verify that environment too when deployment is in scope.

## 3. Route manifest and sweep

Install Playwright in the generated project (`npm install -D --save-exact playwright`) and Chromium (`npx playwright install chromium`). Keep the lockfile. Run the script from the project directory so it resolves the project's dependency, even when the script lives in an installed skill elsewhere.

Create `qa/routes.json`, a nonempty array of objects:

```json
[
  { "path": "/dashboard", "selector": "main[data-page='dashboard'] h1", "text": "Dashboard" },
  { "path": "/orders/ord-001", "selector": "main[data-page='order-detail'] [data-order-number]", "text": "ORD-001" },
  { "path": "/", "expectedPath": "/dashboard", "selector": "main[data-page='dashboard'] h1", "text": "Dashboard" }
]
```

- `path`: concrete path, including any deployment base prefix, query, or hash.
- `selector`: unique CSS selector for visible, completed content of that route. Choose an existing semantic element or a marker on the actual page component, never the shared shell, Suspense fallback, or a marker synthesized from the URL. For async data, identify loaded content rather than a heading that appears before the data finishes.
- `text`: expected rendered text within that element (whitespace normalized, substring match).
- `expectedPath`: optional explicit redirect destination; defaults to `path`. Includes exact query/hash when used.
- `status`: expected final document HTTP status, default 200. Use a different status only for an intentional case such as a tested 404.
- `timeoutMs`: optional readiness/navigation timeout, default 15000.
- `errorSelector`: optional CSS selector for error boundaries; default `[data-route-error]`. Mark generated route error boundaries accordingly, or supply their actual selector.

```bash
node <skill-path>/scripts/route-sweep.mjs http://127.0.0.1:4173 qa/routes.json 1440 900
```

This replaces the former comma-separated route argument; CSV input is no longer accepted. Each route uses a fresh browser context, checks navigation/HTTP status/final URL and visible expected content, and records page errors and failed same-origin scripts/styles. Exit 0 means every manifest check passed; 1 means route failures; 2 means invalid input or setup failure. Preserve the per-route report.

For authorized authenticated tests, set `ROUTE_SWEEP_STORAGE_STATE` to a local Playwright session-state file. Keep session files out of version control. Use separate manifests/session runs for authenticated routes and expected unauthenticated redirects. The sweep does not create accounts or log in for you.

The checker is a smoke test, not proof of full functionality. It cannot judge whether an assertion is specific enough, whether the inventory omitted pages, or whether errors occur in untested later interactions. Inspect failures and strengthen incomplete assertions; never weaken them to conceal defects.

## 4. Bundled UI audit (required)

From the app directory:

```bash
npm install -D --save-exact playwright @axe-core/playwright
npx playwright install chromium
node <skill-path>/scripts/ui-audit.mjs http://127.0.0.1:4173 qa/routes.json qa/ui
```

The UI audit reuses the route checker and its manifest/session configuration. If it checks the full manifest, a separate identical route sweep is unnecessary. It checks every manifest route at 390px, 768px, and 1440px widths, plus a reduced-motion mobile profile. It writes a unique `run-*` directory containing full-page PNGs and `report.json`, with a route/profile mapping.

It checks axe's available WCAG A/AA rule tags, document overflow, broken loaded image elements, and route readiness/errors. Capture readiness has a deadline; a timeout is a failure. Exit 0 means machine checks passed, 1 means failures, and 2 means setup/input failure. Dependency or browser failure is not a skipped pass. Retain the report and inspect `incomplete` axe findings manually. Do not disable checks merely to obtain a green result.

Add explicit theme query variants to the manifest when the app supports them; the audit does not invent theme controls. For local demo states, provide fixture/query routes whose actual content assertions identify that state. For interactive states such as open dialogs, use journey tests to open the state and capture/check it. Do not claim those are covered by default route scans.

The captures freeze animations for comparison. Inspect motion interactively; the reduced-motion run checks rendering under that preference but cannot prove all motion behavior. Scroll to lazy-loaded or below-fold assets and inspect/capture them separately if the report warns they remain pending. Background images, deliberate contained scrollers, clipping, typography, and composition still need visual review.

The report includes unthrottled local navigation/FCP/resource observations. These are diagnostic samples, not field Core Web Vitals, INP, or a performance budget pass. Use the built-in optimize playbook to measure actual bottlenecks with appropriate tooling.

**A machine pass is not visual approval.** Open and compare the images with the reference, walk the UI, and record each design-review dimension as pass / needs-fix / unverified in `qa/quality-report.md`. If image viewing is unavailable, mark the visual gate unverified.

## 5. Interaction, accessibility, and visual checks

Follow [interaction-quality.md](interaction-quality.md) and record results in `qa/journeys.md`. Against the same production preview, verify representative user journeys required by scope: navigation and direct reload, filter/sort/pagination results, form validation and successful submission, dialog open/close and focus return, and real editor/map/drag-and-drop/auth behavior when included. Check loading/empty/error states, keyboard access, labels, focus visibility, contrast, and mobile overflow. Confirm actual persistence/network outcomes for real integrations; label mock behavior honestly.

Compare representative desktop/mobile captures with the reference at matching viewport, theme, state, and content. Include every distinctive layout and each supported theme, plus below-fold content as needed. Wait for the relevant ready state, fonts, and images. Record mismatches and fix material defects using [design-review.md](design-review.md). A saved screenshot is not evidence of having inspected it.

## 6. Completion and revalidation

Batch fixes, rebuild, then rerun affected route/interaction/visual checks. Changes to shared components, routing, themes, or build configuration warrant all-route checks; lazy-import changes require production reload verification. The reported passing evidence must match the final source and output.

Continue until required acceptance checks pass or a concrete blocker prevents progress. If blocked, report the failing check, evidence, remaining scope, and needed input; do not declare success. Bound optional cosmetic refinement separately. Document accepted limitations without relabeling functional defects as intentional style exceptions.
