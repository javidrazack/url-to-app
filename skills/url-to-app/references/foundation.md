# Foundation recipes

Copy these exactly; they encode decisions that took real debugging (TS 6 deprecations, Tailwind v4 runtime theming, React 19 ref semantics).

## Scaffold

```bash
mkdir -p <root>/src/{lib,components/ui,theme,layout,pages,mock,routes}
cd <root> && npm init -y
npm install react react-dom react-router recharts class-variance-authority clsx tailwind-merge \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip \
  @radix-ui/react-switch @radix-ui/react-checkbox @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-slot @radix-ui/react-avatar lucide-react \
  @fontsource-variable/public-sans @fontsource-variable/jetbrains-mono
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  tailwindcss @tailwindcss/vite tw-animate-css eslint @eslint/js typescript-eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

Swap the font packages when the reference uses different faces (extract from Phase 1). Add heavy deps (tiptap/leaflet/dnd-kit/react-hook-form/zod) only when the scope interview says real.

## tsconfig.json (strict, TS 5.5+/6-safe)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

No `baseUrl` — TypeScript 6 deprecates it; relative `paths` work alone. Add `src/vite-env.d.ts` containing `/// <reference types="vite/client" />` or CSS side-effect imports fail typecheck.

## vite.config.ts

```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
})
```

## eslint.config.js (flat)

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)
```

## Token engine (src/index.css) — the runtime-theming core

Three layers, in order:

1. **Semantic CSS variables on `:root`** (light values) and `.dark` (overrides): `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--divider`, status triads (`--success`, `--success-strong`, `--success-tint`, …), sidebar vars, chart palette, and density metrics (`--page-pad`, `--card-pad`, `--cell-py`, `--cell-px`). Accent presets as `[data-accent='blue'] { --primary: …; --primary-strong: …; }` blocks — every accent needs a **deep shade that passes 4.5:1 with white text** (bright brand teal at ~2.5:1 fails AA; the deep stop keeps the hue faithful).
2. **`@theme inline`** mapping semantic vars into Tailwind utilities (`--color-background: var(--background)`). `inline` is what keeps utilities live-bound to the runtime vars — without it, theme switching silently no-ops.
3. **Density presets** as `[data-density='compact'] { --card-pad: 16px; … }` blocks, consumed by components via `p-(--card-pad)` / `py-(--cell-py)`.

Plus: `.num`/`.amount` tabular-figure utilities, `::selection`, thin scrollbars, any signature pattern (e.g. a `.hero-grid` overlay).

## ThemeProvider (src/theme/theme-provider.tsx)

Context holding `{ mode: 'light'|'dark'|'system', accent, density, rtl }`, persisted to localStorage, applied to `document.documentElement` in an effect (`.dark` class, `data-accent`, `data-density`, `dir`). `system` tracks `matchMedia('(prefers-color-scheme: dark)')` live. Export `ACCENTS` (value/label/swatch) for settings UIs, and support a QA URL override (`?theme=dark&accent=blue&density=compact`) parsed on first load — it makes automated visual sweeps of every theme combination trivial.

## lib/utils.ts

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## main.tsx

Fontsource imports first, then `index.css`, then `ThemeProvider > BrowserRouter > App`.

## First gate

`npm run build` must pass before any component work. The recurring first-build failures, all cheap: missing `vite-env.d.ts`, `baseUrl` deprecation, non-namespace Radix imports, duplicate icon exports in an icons module (skip a wrapper icons module entirely — import lucide directly).
