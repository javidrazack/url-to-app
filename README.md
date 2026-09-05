# url-to-app

**URL → Working app codebase**

Recreate the requested parts of a live website as a working, documented app. Research styles and rendered behavior, preserve the requested scope and stack, build shared components, and verify the final production output.

See [`skills/url-to-app/SKILL.md`](skills/url-to-app/SKILL.md) for the workflow and supporting references. Frontend demos and production service integrations are identified separately.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Agent Skills compatible](https://img.shields.io/badge/Agent%20Skills-compatible-blue)](https://github.com/vercel-labs/agent-skills)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-purple)](#installing)

## Installing

The `npx skills add` CLI scans the `skills/` folder in this repo, so all skills install the same way.

**Install all skills in this repo** (today = 1, future = N):
```bash
npx skills add https://github.com/javidrazack/url-to-app
```

**Install a single skill by its `name:` field** (the `name:` inside `SKILL.md` frontmatter, not the folder):
```bash
npx skills add https://github.com/javidrazack/url-to-app --skill "url-to-app"
```

For a manual install, copy the entire `skills/url-to-app/` directory, including its references and scripts.

**Claude Code Plugin** (because `.claude-plugin/` is present):
```bash
/plugin marketplace add javidrazack/url-to-app
/plugin install url-to-app
```

### Updating

Re-run the install command to update the skill and its bundled references/scripts.

## Skills

| Skill (folder) | Install name | Description |
|---|---|---|
| `url-to-app` | `url-to-app` | Recreate scoped pages and interactions, with documented production-build verification |

Future variants (e.g., `url-to-app-v1`, `url-to-app-imagegen`) will appear here and install via `--skill`.

## Usage

Share a URL with the app or pages you want built:

```
Build me this: https://example.com/dashboard/saas
Turn https://preview.tabler.io/ into a React app — light theme only, start with dashboard + one CRUD list
My boss sent https://coreui.io/demos/bootstrap/4.2/dark/index.html — needs to look like it but in Next.js, shell + dashboard
```

The skill will:
1. Establish scope from the request and existing project, asking only material missing questions.
2. Research rendered navigation, stylesheet tokens, computed styles, page anatomy, and interactions.
3. Build the foundation and shared components, using the existing stack or a compatible React + Vite starter.
4. Implement scoped pages, using parallel agents only when authorized and useful.
5. Measure and optimize, then verify the final production build through preview, route checks, interactions, accessibility, and screenshots.
6. Document implementation, token provenance, mock/service boundaries, and verification evidence.
7. Hand off according to the user's repository and delivery instructions.

## Requirements

- A Node runtime supported by the selected scaffolder and dependencies; check their current engine requirements.
- A browser or suitable fetch tools for reference research.
- For the bundled checker: Playwright installed in the generated app and its matching Chromium browser.

## Route checker

Run from the generated app directory:

```bash
npm install -D --save-exact playwright
npx playwright install chromium
node <skill-path>/scripts/route-sweep.mjs http://127.0.0.1:4173 qa/routes.json
```

Serve the final production build first. The checker now requires a nonempty JSON manifest, replacing the old comma-separated route argument:

```json
[
  { "path": "/dashboard", "selector": "main[data-page='dashboard'] h1", "text": "Dashboard" }
]
```

Choose a selector for completed route content, not the shared shell or loading fallback. See [verification.md](skills/url-to-app/references/verification.md) for redirects, authenticated sessions, status expectations, and limitations.

Exit codes: `0` means every check passed; `1` means route failures; `2` means invalid input or setup failure. Route smoke checks supplement interaction and visual verification.

To run the checker regression suite, use a working directory with Playwright installed and Chromium available:

```bash
node --test <skill-path>/scripts/route-sweep.test.mjs
```

## Research

Background writing that shaped this skill lives in `skills/url-to-app/references/`.

## License

[MIT](LICENSE) · Copyright (c) 2026 javidrazack
