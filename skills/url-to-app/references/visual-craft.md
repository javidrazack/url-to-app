# Visual craft while building

Read immediately before UI implementation. Adapted sources: [NOTICE.md](../NOTICE.md). Apply the reference's design contract; these checks improve execution rather than imposing a new aesthetic.

## Hierarchy and composition

Give the primary task and content a clear position in the first viewport. Distinguish page title, section heading, labels, values, and help text with a small repeatable type/spacing system. Size containers around actual content. Group related controls tightly and separate independent sections deliberately.

For operational screens, preserve consistent table rows, aligned numeric columns, compact controls, current navigation, and meaningful semantic colors. Use tabular figures for comparable values. Do not convert every dataset into unrelated metric cards or add decorative charts without meaning.

For marketing surfaces, plan section composition from the message and assets. Repeated equal cards, identical icon-heading-text blocks, ornamental eyebrows, gratuitous gradients/glass, and fake screenshots are prompts to review intent, not mechanical prohibitions. Remove filler or change composition only when it improves the reference-led story. A deliberately regular comparison grid or restrained text-led site needs no forced asymmetry or stock images.

## Typography, space, and surfaces

- Match the reference's font character and role hierarchy; verify actual font loading and the font license. Use an appropriate fallback with similar metrics and record substitutions.
- Limit prose width for reading, while allowing data tables appropriate density. Avoid fixing line breaks by shrinking all text. Inspect long titles, values, italic descenders, localized strings, and zoom.
- Use shared spacing, radii, elevation, control-height, and layer scales. Align related headings, prices, inputs, and actions optically as well as mathematically. Do not apply one arbitrary radius to every element.
- Define semantic foreground/background/action/state pairs; test them in each supported theme and interaction state. Keep charts legible without relying only on color. Preserve intentional brand palettes instead of banning colors by name.
- Check actual contrast, including muted copy, placeholder text, buttons on images, focus rings, selected tabs, and error text. Follow current WCAG guidance; do not treat a screenshot or a guessed hex pair as a measured pass.
- Let components express their role through restrained borders, layers, and backgrounds. Do not decorate every container, nest panels without purpose, or use icon tiles to fill otherwise empty content.

## Assets and truthful content

Use reference/user assets when authorized and appropriately licensed, otherwise source or create relevant replacements. Use image-generation capabilities when available and valuable, but don't require them for a UI that doesn't need imagery. Never use unrelated random photography just to occupy a slot.

Prefer a real product capture or a functioning component preview when demonstrating a product; decorative rectangles masquerading as a finished dashboard are not acceptable substitutes. Use meaningful alt text, reserve dimensions, and verify crops at each layout size. SVG is appropriate for genuine icons, logos, diagrams, and vector artwork; quality depends on execution, not file format.

Use specific, coherent copy and consistent action labels. Preserve provided facts. Clearly mark illustrative metrics and demo data; do not fabricate testimonials, customer logos, guarantees, reviews, or business results. Replace lorem ipsum, TODO UI, generic filler, stale page titles, and mismatched entity names before handoff.

## Responsive design and motion

- Compose explicit mobile layouts: navigation transforms, controls reflow, tables have an accessible overflow strategy, actions remain reachable, and sticky/fixed elements don't cover content.
- Test an intermediate width as well as phone and desktop. Fix the offending constraint; hiding document overflow is not a fix for clipped content. A contained horizontal table can be intentional if usable with touch and keyboard.
- Prefer native controls and accessible primitives. Use one coherent icon family and consistent optical sizes; don't swap a project's library merely because it is common.
- Motion explains state, continuity, or a deliberate brand moment. Keep operational UI responsive, transitions interruptible, and main content visible without waiting for reveals.
- Honor reduced motion regardless of the chosen animation intensity. Avoid continuous React state updates for pointer/scroll effects, uncleaned listeners, unbounded animation loops, and scroll hijacking that removes native navigation. Add a library only for an observed requirement that simpler CSS/native APIs cannot satisfy.

## Before spreading a pattern

Inspect the representative slice for reference identity, hierarchy, typography, alignment, actual content, imagery, mobile behavior, and all relevant states. Fix shared causes before tuning each page. A template with clean code but generic composition has not passed this gate.
