# React implementation quality by impact

Use when building React components/data flows and during the performance pass. Apply the rows that match the app. This is original url-to-app guidance informed by the source review recorded in [NOTICE.md](../NOTICE.md), not the full Vercel rule corpus or an extra dependency.

## Establish scope before choosing a technique

Keep the requested/existing framework and router. A Vite client app does not gain Next.js server components or server actions by copying their APIs. Use the framework's documented equivalent when server rendering/functions are actually in scope; verify current APIs before use. A component/data library is a dependency choice, not a prerequisite for visual quality.

For a new app, retain React + Vite + strict TypeScript + Tailwind as the lightweight base. Choose one router when routes are needed; TanStack Router is an option for complex typed routes/search parameters. Use the existing data library, or consider TanStack Query/SWR for substantial shared asynchronous server data. Do not add a request cache library solely to wrap static fixtures or local UI state. A full-stack framework such as TanStack Start is a separate architecture/hosting decision when server capabilities are requested; do not infer a need for a new backend from a screenshot.

## Review in this order

| Priority | Look for | Apply when justified | Verify |
|---|---|---|---|
| 1. Dependency chain | Independent reads awaiting each other; a child waits for its parent to mount before starting unrelated data work | Start independent work together; await actual dependencies in order; use independent boundaries for independently useful content | Request timing and a real failure/retry path; permission checks still precede protected reads |
| 2. Initial load | Heavy editors/charts/maps or unrelated routes loaded for the first screen; broad imports pulling unused code | Use supported package exports and the selected framework's lazy-loading mechanism; defer noncritical consumers | Initial route's complete shared/deferred graph, direct reload, loading/error boundaries and first meaningful content |
| 3. Data lifetime | Repeated requests, duplicated caches, stale responses overwriting newer choices, synchronous storage reads during every render | Reuse one data layer; key by actual inputs and user context; cancel/ignore obsolete results; version persisted records | Rapid input/navigation, invalidation after writes, failed saves and account changes where applicable |
| 4. State ownership | Derived values copied into state/effects, global state making unrelated components update, event logic hidden in effects | Derive inexpensive values from current inputs; keep state near its consumers; handle user actions at their event boundary | Same visible/data result, predictable error handling, no extra effect-driven update cycle |
| 5. Measured render cost | Expensive repeated transforms/renders, unstable component definitions, excessive work during typing/scrolling | Keep component identities stable; reduce fanout; memoize expensive pure work only when measured; defer nonurgent rendering or virtualize large collections when needed | Trace/profile before and after with realistic data; selection, focus and keyboard semantics still work |

Use `Promise.all` for independent work only when a single failure should fail the group. If partial results are useful, handle each result deliberately; do not swallow failures to report success. Check cheap validation/authorization prerequisites first, and never parallelize mutations whose order affects correctness.

Lazy loading uses React/framework facilities already present: React lazy/Suspense or router splitting for a Vite app, framework equivalents elsewhere. Do not paste `next/dynamic`, Next-specific import options, or server-only caching into a client app. Do not deep-import private/unexported package paths to chase a smaller bundle. Keep the critical image and initial useful content available promptly.

Memoization and tiny JavaScript rewrites come after the dependency chain and loading cost. Avoid blanket `useMemo`/`useCallback`, per-component caching of trivial expressions, module-level mutable user/request state, and unbounded global caches. In server code, authentication, per-user cache isolation and correct request lifetimes are prerequisites; a performance rule does not establish security. Do not suppress hydration warnings or disable Strict Mode to conceal a correctness problem.

## Record a small evidence table

In `qa/quality-report.md`, record applicable category → observed issue or no material issue → change → before/after evidence → behavior recheck. State route, build, browser, data volume and measurement conditions. Mark server-only categories not applicable to a client demo. If no material bottleneck is observed, record that and stop speculative optimization. Reuse the same final-build measurements in [optimize.md](optimize.md); do not launch duplicate full audit matrices just to populate two reports.
