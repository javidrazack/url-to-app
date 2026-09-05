# Complete the user journey

Read while implementing and before final verification. Adapted sources: [NOTICE.md](../NOTICE.md).

## Controls must produce observable outcomes

Maintain a compact journey/state matrix in `qa/journeys.md`: route/component, trigger, expected result, data source, states exercised, evidence, and remaining external dependencies. Cover the user's core task and each distinct interaction family, not just one button per app.

- Navigation reaches the right page and survives refresh, back/forward, and direct loading. Active state and breadcrumbs remain correct. Unknown routes have a useful recovery path.
- Search/filter/sort/pagination change the displayed data consistently, combine sensibly, and expose clear/reset/empty outcomes. Search input is not merely decorative.
- Create/edit forms validate, submit once, preserve input on error, show success only after the adapter succeeds, and update list/detail views. Protect against stale responses and duplicate submissions. Local demo persistence must survive the promised lifetime and offer a documented reset.
- Destructive changes use suitable confirmation or undo, with clear scope and recovery. Do not exercise live destructive actions while testing the reference or an unrelated service.
- Menus/popovers/dialogs open, close, fit the viewport, escape clipping ancestors, support keyboard use, and return focus appropriately. Escape dismisses the right layer.
- Tabs change the relevant panel; downloads contain meaningful output; charts/tooltips reflect actual fixture or service data. Do not substitute toast messages for requested behavior.
- Disabled/unavailable controls explain why. Avoid visible no-op controls, fake links, fabricated notifications, and false saved/sent/paid states.

## Build and verify applicable states

For each important async or editable surface, cover default, focus/hover/pressed, loading, empty, no-results, error/retry, success, disabled, and permission states where they apply. Use layout-stable loading feedback; never add artificial delay solely to showcase it. Keep context available during refresh and partial failure.

Exercise real inputs: long names, unbroken IDs, large values, zero rows, many rows, missing images, duplicate actions, slow responses, and failed saves. Use deterministic fixture scenarios or test interception in the generated app; keep production services isolated from test data. Test supported locales/scripts and avoid assuming short English strings. Do not add an internationalization platform solely to pass a hypothetical test.

## Accessibility is an interaction requirement

Use semantic elements, programmatic labels, meaningful names, appropriate announcements, error associations, logical reading/tab order, visible focus, and accessible pointer targets. Ensure keyboard access to the entire primary journey. Test zoom/reflow, reduced motion, and supported themes. Use actual contrast measurements for states the automated scan cannot assess.

Run the bundled UI audit for machine-detectable issues and inspect its `incomplete` findings manually. Also test keyboard/menu/dialog behavior, 200% zoom and text scaling, non-color status cues, and relevant screen-reader announcements; axe cannot prove these experiences. Record unavailable assistive-technology/browser coverage as unverified, not passed.

## Real integration boundary

A UI can be carefully engineered with a local demo adapter. That is not production authentication, server authorization, payments, or shared persistence. If a connected backend is in scope, test validation and failure behavior at the service boundary too. Ask only for missing access/configuration that prevents real integration and continue independent UI work. Never label localStorage sessions or mock login as secure authentication.
