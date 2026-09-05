# Built-in performance pass

Read for every build after the representative slice and again before final verification. This playbook ships inside url-to-app; it requires no external design skill. Adapted sources: [NOTICE.md](../NOTICE.md).

## Measure the actual bottleneck

Record the route, build, browser, viewport, network/CPU conditions, data size, and measurement method. Inspect the primary route and the heaviest interaction/page; record before/after when changing performance-sensitive code. Separate a local lab measurement from field data. Do not call a local navigation timer “INP” or treat an entry chunk size as the entire initial load.

The bundled UI audit records limited navigation/FCP/resource observations alongside screenshots and accessibility results. It does not measure field Core Web Vitals or replace a browser trace/Lighthouse run. Use available profiling tools on a production build for loading, long tasks, expensive renders, layout shifts, and a realistic repeated interaction. If a measurement tool is unavailable, report that gap while completing other checks.

## Choose fixes from evidence

| Symptom | Inspect | Candidate fix |
|---|---|---|
| Slow first useful content | Critical request chain, initial route/shared JS, font/image loading | Defer unrelated routes/widgets; size critical images correctly; load only needed font files; remove unused dependencies |
| Slow filtering/editing/scrolling | Main-thread trace, render fanout, data volume, layout reads/writes | Keep state local; batch work; cancel stale requests; paginate/virtualize justified large lists; eliminate repeated forced layout |
| Content jumps | Unsized assets/embeds, font swap, skeleton dimensions, late banners | Reserve correct dimensions and stable state geometry; use compatible font metrics; avoid inserting content above the user's task |
| Janky motion | Per-frame React renders, listeners, heavy paint effects | CSS/native or motion-value updates; cleanup subscriptions; reduce effect cost and affected area; respect reduced motion |
| Memory/resource growth | Timers, observers, object URLs, subscriptions, repeated navigation | Dispose resources; abort pending work; verify memory/listener behavior after repeated open/close/navigation |

Do not lazy-load the image that is needed for the first meaningful viewport. Use responsive images, useful caching, and measured compression without damaging the reference's visual quality. Keep nonessential imagery deferred. Avoid blanket preload/prefetch, global `will-change`, indiscriminate memoization, and new animation libraries without a demonstrated need.

Test a narrow/mobile layout and realistic data volume, not only a desktop with three rows. Verify that fixes preserve keyboard operation, content, layout, motion preferences, and actual data results. Do not remove features or hide information just to improve a score.

## Final evidence

Record production asset sizes with units and loading role (entry/shared/deferred), plus measured performance observations and limitations in `qa/quality-report.md`. Rebuild after optimization and run the final route, UI, journey, and screenshot checks against that output. A reduced bundle or clean audit does not establish visual quality by itself.
