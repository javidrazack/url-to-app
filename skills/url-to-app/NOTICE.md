# Design guidance attribution

The self-contained design references in this skill adapt selected ideas from:

- **Impeccable**, Paul Bakaus and contributors, [pbakaus/impeccable](https://github.com/pbakaus/impeccable), upstream revision `8dac6ae7e020c43ab10ce9b41939f6fd42627b96`. Sources reviewed: `skill/reference/{craft-floor,operate,polish,harden,optimize,audit}.md`. Apache-2.0; [license](third-party/impeccable-LICENSE.txt) and [upstream notice](third-party/impeccable-NOTICE.md) are bundled.
- **Taste Skill**, Copyright (c) 2026 Leonxlnx, [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), upstream revision `ccbc15639c97057cbfcf32ecebc38ef716e4bb37`. Sources reviewed: `skills/taste-skill/SKILL.md` and `skills/redesign-skill/SKILL.md`. MIT; [license](third-party/taste-skill-LICENSE.txt) is bundled.

Adapted files: `references/design-direction.md`, `references/visual-craft.md`, `references/interaction-quality.md`, `references/optimize.md`, and `references/design-review.md`. These are rewritten, combined, and modified for reference-driven app building. They distinguish operational UI from marketing surfaces, preserve reference identity, remove external command dependencies and conflicting universal style bans, and require evidence before quality claims. Applicable upstream license and attribution terms are retained. Other original url-to-app code and instructions remain under the [MIT license](LICENSE.txt), also bundled here.

This is a selected capability integration, not a vendored copy of either full product. No upstream live-editor, hooks, native platform workflows, or detector implementation is included. No separate skill installation or upstream fetch is required at build time. The browser audit scripts are original url-to-app code and load Playwright/axe from the generated project's development dependencies.

When refreshing these adaptations, record the upstream revision, review changed guidance for scope/identity/accessibility conflicts, retain notices, and rerun the bundled checks. Do not overwrite these adaptations automatically with upstream text.
