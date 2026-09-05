# Documentation and handoff

Update existing documentation where possible; for a new app, create AGENTS.md, README.md, and DESIGN.md at a depth appropriate to scope. Describe implemented behavior and measured results, not a generic feature wishlist.

## AGENTS.md — contribution contract

Include the actual stack and runtime, commands, shared component/data APIs, route registry, and import/token/layout conventions. Point to representative implementations so future agents can extend existing patterns. Explain how to add a route, including the project's loading pattern, nav visibility, concrete fixture paths, and route-manifest expectations.

Document mock/real service boundaries, environment variable names without secret values, error handling conventions, and verification commands. Keep rules proportional and explain why they matter. Record accepted limitations separately from unresolved defects; do not turn an observed style preference into an unconditional rule for unrelated pages.

## README.md — human quickstart

Include scope, prerequisites, locked install/build/preview commands, scripts, a short structure overview, and documentation links. List only implemented themes, accessibility features, interactions, and integrations. Describe real-vs-mock behavior and required service setup. Include representative screenshots under docs/ when useful, excluding private data.

Report tested runtime/dependency versions, route coverage, final verification results, and outstanding blockers. State whether delivery is a local app or a deployed service. Document asset/font provenance and applicable licenses accurately; do not claim there are no third-party assets when licensed assets are included.

## DESIGN.md — reusable design decisions

Record semantic color/typography/spacing/radius/component tokens with reference sources, theme/selector context, and any approximations. If using machine-readable YAML frontmatter, keep a consistent schema and make references resolvable. Explain layout, hierarchy, responsive behavior, interaction states, and intentional differences from the reference. Avoid duplicate numeric sources of truth.

## Quality evidence

Keep `qa/journeys.md` and `qa/quality-report.md` alongside project documentation. Follow [design-review.md](design-review.md) for evidence fields and dimension statuses. Link the latest UI audit report and reference/final screenshots actually inspected, identify the final source/build, and distinguish passed checks from unverified coverage. Keep screenshots and reports free of private data before committing or sharing.

Generated AGENTS.md should explain the bundled workflow's expectations, document portable project-local QA commands, and tell future contributors to rerun affected checks after UI changes. Do not hardcode the original author's absolute installed-skill path; copy needed QA scripts into the generated project's QA tooling with their applicable license when portability is needed, and install their dependencies in that project.

## Scope and branding check

Compare the result with the agreed branding and content policy. A generic starter should have neutral branding and fictional data; a branded build should retain the requested identity. Search only for known accidental placeholders or unrelated names within the generated project—do not mine other projects for a blacklist or remove ordinary domain vocabulary indiscriminately.

Before committing, inspect the repository boundary, current status, intended diff, ignored build/dependency outputs, and potential session/secret files. Preserve existing history and unrelated changes. Follow the user's delivery/commit instructions; initialize a repository only for a new standalone project when appropriate, and never include unrelated files in an initial commit.
