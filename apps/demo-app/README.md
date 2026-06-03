# Nuvio demo app (`@nuvio/demo-app`)

Minimal Vite + React + Tailwind app for the **v0.5.0 stable 10-minute onboarding path** (scenario S8 in [DOGFOOD.md](../../docs/DOGFOOD.md)).

## Run

From repo root:

```bash
pnpm install
pnpm build
pnpm --filter @nuvio/demo-app dev
```

Open **http://localhost:5174** (fixed port so it does not clash with TailAdmin dogfood on 5173).

## What to edit first

1. Turn on **Edit** on the Nuvio chip.
2. Click the **Nuvio** heading (`demo.hero.title`).
3. Pick **Heading** in the section menu (or edit text directly).
4. **Preview Changes** → **Apply to Code**.

No TailAdmin complexity — suitable for first-time users following [nuvioUser.md](../../docs/nuvioUser.md) only.

## Stable acceptance screenshot

```bash
# Terminal 1
pnpm --filter @nuvio/demo-app dev

# Terminal 2 (after Playwright install in scripts/)
node scripts/v05-stable-acceptance.mjs --demo-url=http://localhost:5174
```

Produces `docs/screenshots/v0.5/SS14-demo-first-edit.png`.
