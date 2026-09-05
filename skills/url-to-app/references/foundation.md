# Foundation recipes

Use for a new React + Vite app. In an existing project, preserve the framework and build conventions, and adapt only the relevant token/component guidance.

## Runtime and dependency policy

Check current [Vite requirements](https://vite.dev/guide/) and the selected packages' engine/peer requirements before installation. Use a supported Node LTS version satisfying all of them, record it in the project runtime file, and document the version tested. Do not silently upgrade an existing project's stack.

Use the official scaffold to supply the entry HTML, React entrypoint, TypeScript project configs, Vite config, and linter configuration as a compatible set. Resolve the scaffolder version once and invoke that exact version:

```bash
npm view create-vite version
# Replace <resolved-version> with that result; <root> must be a new directory.
npm create vite@<resolved-version> <root> -- --template react-ts
cd <root>
npm install
npm install --save-exact class-variance-authority clsx tailwind-merge lucide-react
npm install -D --save-exact tailwindcss @tailwindcss/vite playwright @axe-core/playwright
npm pkg set 'scripts.dev=vite' 'scripts.typecheck=tsc -b' 'scripts.build=npm run typecheck && vite build' 'scripts.preview=vite preview'
```

Keep `package-lock.json`, use `npm ci` for reproduction, and record resolved versions (`npm ls --depth=0`) after validation. The scaffold's existing dependency ranges are resolved by the lockfile; do not claim a fixed compatible stack before testing it. Add charts, Radix packages, fonts, and feature dependencies only as their consumers are implemented, resolving peer conflicts instead of suppressing them. Install Chromium with `npx playwright install chromium` before browser checks.

Install one router only when navigation needs it. For the default multi-page recipe, use `npm install --save-exact react-router`; respect a requested/existing router instead. TanStack Router can serve complex typed navigation/search requirements, and a shared query library can serve substantial API data, as described in [react-quality.md](react-quality.md). Do not install competing routers, add server infrastructure to a client demo, or replace the user's stack merely to follow a recipe. Single-page/anchor-only sites may not need a router at all.

## Configure the starter

Preserve the generated TypeScript project references and lint script/configuration (the scaffolder may choose ESLint or another linter). Explicitly enable strict checking and retain `verbatimModuleSyntax` where supported. Add these entries under `compilerOptions` in the app TypeScript config (usually `tsconfig.app.json`):

```json
"strict": true,
"paths": { "@/*": ["./src/*"] }
```

Map the same alias in `vite.config.ts`, preserving any existing options:

```ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
```

Retain Vite client types via the generated config or `src/vite-env.d.ts` (`/// <reference types="vite/client" />`). Remove demo styles/assets only when their replacements render. In the scaffold's entry CSS, replace demo styles with `@import "tailwindcss";` and the token layers below. Remove the starter App.css import if that file is removed. Keep the generated `index.html`, `src/main.tsx`, and a minimal App until the shell is ready.

## Semantic token engine

1. Define reference-derived variables on `:root`, including surface, foreground, border, primary/foreground pairs, typography, spacing, and radius. Preserve the source/theme provenance in DESIGN.md. Add theme overrides only for themes in scope.
2. Map tokens through Tailwind's `@theme inline` when theme values reference other variables:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #17212b;
  --primary: #165dba;
  --primary-foreground: #ffffff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
}

body { margin: 0; background: var(--background); color: var(--foreground); }
```

These sample colors make the starter runnable; replace them with researched values. `inline` controls how variable references resolve; do not claim all theme switching requires it. Check the actual foreground/background pairs in each implemented theme. If using `dark:` utilities with a `.dark` toggle, explicitly configure Tailwind's selector-based dark variant according to its current docs.

3. If density or accent switching is in scope, implement presets via `data-*` attributes on the document root and consume semantic variables. Keep numerical/tabular styling where the reference calls for it.

## Theme state (only when needed)

Persist supported theme choices, validate saved values, and handle unavailable storage. Apply initial document attributes before first paint where possible to avoid a theme flash; subscribe to `matchMedia` changes for system mode and clean up the subscription. CSS-variable changes avoid prop-drilling, but can still trigger style/layout/paint work and context consumer renders.

An optional QA query override such as `?theme=dark` should be validated and temporary; do not overwrite the user's saved preference. Test only the themes/features implemented. Load licensed font packages for required weights and respect the selected family's license.

## Shared utility

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## First gate

Run `npm run typecheck`, `npm run lint`, and `npm run build`. Confirm the starter renders before extending it. Later gates must rebuild and exercise the final production output; this first pass establishes a working foundation only.
