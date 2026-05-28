# Tailwind v4 test app

Controlled fixture for **Nuvio v0.2.0 Step 3**: Tailwind v4 + Vite + React, no `tailwind.config.js`.

## Run

From repo root:

```bash
pnpm install
pnpm --filter @nuvio/tailwind-v4-test dev
```

Open the URL Vite prints (often `http://localhost:5173` or `5174` if the demo app is running).

## What to verify

1. Chip shows **connected** and **≥ 14 ids** (literal `data-nuvio-id` only).
2. **Overlay CSS self-contained (source)** in chip.
3. Edit mode → select `tw4.hero.title` → change text → **Validate** → **Apply** → HMR updates.
4. Change padding/color on a card with literal `className` → validate → apply → **Undo last**.
5. No Tailwind `content` entry for `@nuvio/overlay` in this app.

## Stack

- Vite 6
- React 19
- Tailwind CSS 4 (`@tailwindcss/vite`, `@import "tailwindcss"` in `src/index.css`)
- `@nuvio/vite-plugin` + `@nuvio/overlay` (`workspace:*`)
