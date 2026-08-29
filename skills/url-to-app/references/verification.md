# Verification gauntlet

An SPA returns HTTP 200 even when the page crashes to blank — "the server said ok" verifies nothing. Verification is: typecheck → lint → build → route sweep (real DOM) → visual sweep (real pixels). Run in that order; fix in one batch per round, confirm with at most one more round.

## 1. Static gate

```bash
npm run build        # tsc --noEmit && vite build
npm run lint
```

Zero errors required. Warnings: acceptable only if documented in AGENTS.md "Known exceptions".

## 2. Route sweep (bundled script)

```bash
node <skill-path>/scripts/route-sweep.mjs http://localhost:<port> "/dashboard/saas,/orders,/apps/editor,..." [viewportWidth]
```

The script launches headless Chromium, visits each route, listens for `pageerror`, and fails any route whose `#root` stays empty. Start the dev server first (`nohup npm run dev &`), keep it running for the whole phase.

Interpretation:
- **Empty root + no page error** → route not matched, or a lazy import failed silently. Check the route table.
- **Empty root + page error** → read the error; the two recurring classics:
  - `` `X` is not a <Route> component `` — react-router v7 allows only `<Route>` elements as children of `<Routes>`. A helper component that *returns* routes still crashes. Map over data inline instead.
  - `` `AvatarFallback` must be used within `Avatar` `` — composition error; prefer fixing the component API (add a `name` prop to Avatar) over editing every call site.

## 3. Visual sweep

```bash
npx -y playwright screenshot --viewport-size=1440,900 --wait-for-timeout=2000 <url> shot-name.png
npx -y playwright screenshot --viewport-size=390,844  --wait-for-timeout=2000 <url> shot-mobile.png
```

Capture: primary dashboard, a CRUD list, one heavy app, auth page, settings — in light AND dark (use the theme QA query hook, e.g. `?theme=dark`, or toggle via the settings page). Compare against the reference captures from the research phase. One batched fix round for everything the sweep shows, then one confirmation round, then stop — open-ended polishing burns the budget.

Reading screenshots yourself (image read) is fine; also run the design-slop detector if the impeccable skill is installed:

```bash
node <impeccable-path>/scripts/detect.mjs --json src/
```

Triage findings: fix real defects; document intentional signature patterns (e.g., a hero grid overlay) as known exceptions in AGENTS.md.

## 4. Performance pass (measured + impeccable optimize)

1. **Bundle gate (always):** Read the build output. If the entry JS chunk exceeds ~300 KB minified, convert page imports to lazy routes:

```tsx
const Page = lazy(() => import('./pages/...'))
// route: element={page(Page)} where page() wraps in <Suspense fallback={<PageFallback/>}>
```

Re-measure and report before/after (the proven run: 1,880 KB single bundle → 358 KB entry + 130 on-demand chunks). Then document the lazy-import requirement in the generated AGENTS.md so future contributors don't regress it.

2. **Impeccable optimize (if the impeccable skill is installed):** Load and follow `<impeccable-path>/reference/optimize.md` — diagnose and fix UI performance beyond bundle size (render cost, interaction latency, layout shifts, expensive effects, image/asset weight). Run its checks against the primary dashboard + one heavy route.

3. **Impeccable audit (if installed):** Load and follow `<impeccable-path>/reference/audit.md` — technical quality checks (a11y, perf, responsive). Triage findings same as slop: fix real defects, document intentional exceptions in AGENTS.md "Known exceptions".

The bundle gate is mandatory; the impeccable passes are opportunistic but preferred — they catch what the byte count misses.

## 5. Debugging recipes

- **Blank page, no console error**: check that the route element tree renders — log `document.getElementById('root').children.length`.
- **Console capture**: `npm i -D playwright` once, then a small script with `p.on('pageerror', ...)` beats guessing.
- **HMR confusion after big edits**: restart the dev server before trusting a screenshot.
- **Stale optimized deps**: vite logs "optimized dependencies changed. reloading" — wait for the reload before capturing.
