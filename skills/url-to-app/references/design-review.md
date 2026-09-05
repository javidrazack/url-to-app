# Critique, refine, and prove the result

This is a required final design pass, not an optional command. Read after the first complete implementation and use again to confirm material fixes. Adapted sources: [NOTICE.md](../NOTICE.md).

## Inspect actual evidence

Open the final production app. Compare its screenshots with the reference at matching viewports, states, themes, and content. View the images through an image/browser tool; merely saving PNGs does not count as visual inspection. Inspect the first viewport, middle, bottom, and key overlays. Check the full primary journey with pointer and keyboard. Use generated screenshots only as evidence, never as a substitute for implementing live controls.

Run the bundled browser audit in verification.md, but treat machine checks and visual judgment separately. Neither a regex detector nor an axe pass can certify “taste.” If visual inspection cannot run, record the gap and do not claim the visual quality gate passed.

Use [layout-contracts.md](layout-contracts.md) to review the joins between shared components: field control edges/heights, helper/error spacing, heading/action groups, and access to overflowed content. Check intermediate widths and the boundaries of layout changes. A familiar reference may contain defects: record which details preserve identity and which need repair. Do not accept a misaligned row just because each input looks reasonable on its own.

## Review dimensions with explicit evidence

Use pass / needs-fix / unverified for each dimension; do not hide failures behind an averaged score.

| Dimension | Evidence that earns a pass |
|---|---|
| Reference identity | The observed typography, palette, density, layout, assets, and distinctive details survive; departures have a concrete usability or user-request reason |
| Hierarchy and composition | The main task/message is clear, important information is findable, spacing expresses grouping, and sections serve content rather than repeated filler |
| Type and visual consistency | Actual fonts load; roles, baselines, spacing, icons, radii, surfaces, and state colors agree across representative pages |
| Content and imagery | Coherent real/demonstration data, specific copy, useful assets/crops, no false claims, fake product screenshots, TODO slots, or accidental placeholders |
| Interaction completeness | Core tasks produce correct observable results, including error recovery and related page updates; no clickable facades |
| Responsive and accessible behavior | Phone/intermediate/wide captures, keyboard/focus checks, supported themes, reduced motion, long content, zoom, and machine findings are resolved or explicitly unverified |
| Performance | Production measurements identify conditions and remaining limits; key interactions remain usable with realistic data |
| System consistency | Shared components/tokens produce coherent pages; exceptions are intentional and documented, not drift between page implementations |

Ask yourself: if the logo were removed, would the app still resemble this specific reference, or would it be interchangeable with an unrelated generated template? If interchangeable, identify concrete missing signature details and repair them. Do not force novelty into standard data controls to answer this question.

## Fix in priority order

1. Blocked tasks, data errors, false success, inaccessible controls, missing routes.
2. Missing state/recovery behavior, mobile clipping, unreadable content, broken assets.
3. Reference mismatch, weak hierarchy, wrong density, duplicated/filler composition, shared-system drift.
4. Alignment, spacing, typography, imagery, copy, motion, and performance refinement.

Fix shared causes before per-page symptoms. Batch issues, rebuild, recapture affected routes/states, and compare again. Recheck all pages when shared shell/tokens/routing change. Stop discretionary experimentation once the design contract is met, but continue resolving known required defects or name a concrete blocker. Never announce “production-grade” merely because two passes elapsed.

The priority order schedules fixes; it does not excuse remaining known alignment, label-wrapping or clipping defects. Maintain a short issue ledger with observation → shared cause → correction → recheck. Prefer a second independent visual reviewer when available and authorized, without sharing desired scores; otherwise separate the critique from implementation and inspect the captures afresh. A reviewer may find a tie, and one screenshot comparison does not establish a general quality win.

## Evidence report and handoff

Write `qa/quality-report.md` with:

- Final source revision or working-tree identification and build time; actual route/state coverage.
- Reference captures and final captures by route/viewport/theme; which images were visually inspected.
- Each dimension above, status, specific observations, changes made, and confirmation evidence.
- Declared layout contracts, widths/states exercised, failed/not-applicable checks, overflow affordance review, and closure evidence for observed defects.
- Interaction checks with outcome, accessibility findings/manual review, performance conditions/results, and service/browser coverage gaps.
- Outstanding defects and exact mock/external-service boundaries.

Summarize the result for the user in plain language and open the finished app when possible. Keep the report as evidence, not implementation jargon in product UI. Report “verified UI with demo data” when appropriate; reserve a whole-service production claim for tested integrations and deployment conditions too.
