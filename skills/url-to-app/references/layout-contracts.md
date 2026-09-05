# Prove shared layout contracts

Use during the first slice and final review when related controls have a deliberate geometric relationship. These checks complement rendered judgment; they do not score originality, beauty, or complete accessibility.

## Inspect where components meet

Inspect an actual row of form fields, a heading with its action group, and the densest repeated content. Include normal, helper/error, long-content, and narrow states where applicable. A polished isolated input does not prove that its label, help text, sibling input, and button align when composed.

- Related controls in a horizontal row share intentional edges and size variants. Use one field wrapper for label/control/help/error structure; do not patch each page with offsets. Compare control boxes rather than assuming equally tall wrappers prove alignment.
- Action groups remain readable as space narrows. Move the group or stack controls before squeezing labels. Use no-wrap only on short action labels when the surrounding layout can reflow; do not globally prevent text wrapping or truncate meaningful actions.
- A deliberately scrollable table exposes important information and an understandable way to reach the rest. Check touch and keyboard scrolling, focus visibility, and an overflow cue when columns are offscreen. Do not add a permanent cue to a table that already fits. Containment fixes document overflow, not discoverability.
- Inspect phone, intermediate and desktop layouts, then just above/below any breakpoint where a composition changes. Include longer realistic labels and supported zoom. Wrapping in headings/prose or vertically stacked mobile fields can be intentional.

Record concrete preserve/repair decisions before changing CSS. Known accidental alignment, clipping and label-wrapping defects are required fixes, even when copied from the reference. An exact-copy instruction may change the fidelity target; report its usability tradeoff explicitly.

## Declare a few meaningful assertions

Add `layoutChecks` to the relevant entries in `qa/routes.json`, using selectors for real rendered controls. The agent chooses these from the design contract; the user need not know selectors or commands. Apply assertions to representative shared patterns, not every DOM node. Do not add an empty showcase solely to pass them.

```json
[
  {
    "path": "/orders/new",
    "selector": "main h1",
    "text": "Create order",
    "layoutChecks": [
      {
        "name": "paired field control edges",
        "type": "align",
        "edge": "top",
        "selectors": ["#customer-name", "#company"],
        "minWidth": 700,
        "tolerancePx": 2
      },
      {
        "name": "text input size variant",
        "type": "same-size",
        "dimension": "height",
        "selectors": ["#customer-name", "#company"]
      },
      {
        "name": "short submit label stays on one line",
        "type": "single-line",
        "selectors": ["button[type='submit'] .button-label"]
      }
    ]
  }
]
```

Replace example selectors and the breakpoint with the actual implementation. Each selector must match exactly one visible element; missing, ambiguous or hidden targets fail. `align` compares `top`, `bottom`, `left` or `right`; `same-size` compares `height` or `width`. Their spread must be within `tolerancePx` (default 2px; permitted range 0–10). `single-line` counts overlapping visible text bands; select the label, excluding separately positioned badges or icons. Empty labels fail. It does not prove text is unclipped, untruncated, or readable.

Optional `minWidth` and `maxWidth` are inclusive viewport bounds. Outside them, the check is reported as `not-applicable`, not passed. Explain responsive intent; do not narrow bounds or increase tolerances merely to hide a failure. Visual review still covers other widths and states.

The existing `ui-audit.mjs` runs these contracts after route/assets are ready and records measurements in `inspection.layoutChecks`. Failed contracts make the UI audit fail. The focused route sweep validates the manifest but only checks route readiness; it does not execute geometry assertions. The report also lists contained horizontal scrollers as review prompts, not automatic defects.

For an overlay or interactive state, open it in a journey test, wait for its content, then import `inspectLayoutChecks` from the bundled `layout-checks.mjs`. Use `validateLayoutChecks` first for programmatic input. Capture overlays at viewport size. For full-page comparisons after interactions, scroll to the same known position (normally the top), settle fonts/assets, and freeze finite animations. Review live motion separately. Do not score fixed-position artifacts caused by different screenshot scroll positions as app defects.

## Close the loop

For each discrepancy, record the route/state/width, observed failure, shared cause, correction, and recheck evidence. Fix shared components before local exceptions. Reuse valid evidence from the unchanged build; rerun affected assertions and screenshots after fixes, and the full relevant route/profile set after shared layout changes. Passing these measurements never replaces opening and comparing the rendered images.
