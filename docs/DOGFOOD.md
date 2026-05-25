# Dogfood checklist (Full MVP)

Run this **outside the monorepo** (or treat the demo app as a smoke test) before tagging **`latest`** on npm.

## A. Monorepo smoke (contributors)

From repo root:

```bash
pnpm install
pnpm dogfood
pnpm dev
```

Manual checks on http://localhost:5173 (port may vary):

1. **Edit on** — chip shows dev channel **connected**, index **≥ 7 ids**
2. **Select** — hero, lead, feature cards, pricing CTA each resolve to a source path
3. **Style edit** — change text or a Tailwind control → **Validate** → **Apply** → HMR updates; **Undo last** restores
4. **Move** — select a feature card → **Move down** or **Move up** → cards swap order; **Undo last**
5. **Hide / Show** — hide element, show again
6. **Duplicate** — duplicate card → new `*.copy` id appears in index after refresh
7. **Chrome** — drag Editor / Nuvio chip headers; collapse panels; reload page — positions restore

## B. Clean consumer install (maintainer)

In an empty directory:

```bash
pnpm create vite nuvio-dogfood --template react-ts
cd nuvio-dogfood
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
pnpm add -D @nuvio/vite-plugin@latest @nuvio/overlay@latest
```

Wire per [README.md](../README.md) § Public alpha:

- `nuvio()` in `vite.config.ts`
- Tailwind `content` includes `./node_modules/@nuvio/overlay/dist/**/*.js`
- `<NuvioDevShell />` in `App.tsx`
- At least two siblings with `data-nuvio-id` under a `className="flex ..."` parent

```bash
pnpm dev
```

Confirm **Validate → Apply** and **Move down** on one sibling.

## C. Record results

| Check | Pass? | Notes |
| ----- | ----- | ----- |
| Index ids > 0 | | |
| Validate change summary | | |
| Apply writes file | | |
| Undo restores | | |
| Move sibling | | |
| Published `@latest` install | | |

File issues with Vite/React/Tailwind/Node versions per [COMPATIBILITY.md](./COMPATIBILITY.md).

### Troubleshooting

- **Dev channel `error`**, Validate/Apply disabled, console **404 on `overlay/dist/index.js`**: stop the dev server, run `pnpm dev` from the **repo root** (or restart `pnpm --filter @nuvio/demo-app dev`), then **hard-refresh** the browser. The demo app loads overlay from **source** in dev; a stale tab after a failed HMR update needs a full reload.
