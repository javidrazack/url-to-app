# url-to-app

**URL → Production React+Vite App**

Turn any dashboard URL into a hand-off-ready React project: tokens extracted from the site's *actual* stylesheets (not pixels), a reusable shadcn-style component library, every page in the reference's navigation, docs for humans + agents, and a verified code-split build.

Proven end-to-end on a 47-route admin template — see `skills/url-to-app/SKILL.md` for the full 7-phase workflow.

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

You can also copy `skills/url-to-app/SKILL.md` into your project or paste it into ChatGPT / Codex / Claude conversations.

**Claude Code Plugin** (because `.claude-plugin/` is present):
```bash
/plugin marketplace add javidrazack/url-to-app
/plugin install url-to-app
```

### Updating

Re-run the install command — the newer `SKILL.md` replaces the older in place. Pin to v1 later:
```bash
npx skills add https://github.com/javidrazack/url-to-app --skill "url-to-app-v1"
```

## Skills

| Skill (folder) | Install name | Description |
|---|---|---|
| `url-to-app` | `url-to-app` | **Default** — URL → production React+Vite app (full 7-phase workflow) |

Future variants (e.g., `url-to-app-v1`, `url-to-app-imagegen`) will appear here and install via `--skill`.

## Usage

Just share a URL — even bare:

```
Build me this: https://example.com/dashboard/saas
Turn https://preview.tabler.io/ into a React app — light theme only, start with dashboard + one CRUD list
My boss sent https://coreui.io/demos/bootstrap/4.2/dark/index.html — needs to look like it but in Next.js, shell + dashboard
```

The skill will:
1. **Research** the URL — grep `*.css` for `--*` tokens (both light/dark), enumerate routes, screenshot ground truth
2. **Foundation** — strict TS, ESLint flat, Tailwind v4 `@theme inline`, `cn()` util, async ThemeProvider
3. **Components** — 21 CVA primitives + Radix namespace imports + `Avatar{name}` + `page()` lazy helper
4. **Pages** — parallel dispatch (exclusive files, `routes/nav.ts` SSOT, orchestrator wires `App.tsx`)
5. **Verify** — `tsc` → `lint` → `build` → `scripts/route-sweep.mjs` (real DOM) → screenshots → bundle gate (<300 KB)
6. **Optimize** — `React.lazy` + optional `impeccable` `optimize`/`audit` when installed
7. **Docs** — `AGENTS.md` + `README.md` + `DESIGN.md` with binding rules
8. **Ship** — `git init`, `.gitignore`, one commit, brand isolation grep

## Requirements

- Node 18+, `npx` (for `npx skills add`)
- For verification: `playwright` (route sweep) + `chrome` for screenshots

## Research

Background writing that shaped this skill lives in `skills/url-to-app/references/`.

## License

[MIT](LICENSE) · Copyright (c) 2026 javidrazack
