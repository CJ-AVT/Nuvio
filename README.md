# Real-Time Editor

**v1.1.0** — visual editor for **React + Vite + Tailwind** (dev-only; nothing runs in production).

[![npm @rte/cli](https://img.shields.io/npm/v/@rte/cli?label=%40rte%2Fcli%201.1.0)](https://www.npmjs.com/package/@rte/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

**Published packages:** `@rte/cli` · `@rte/vite-plugin` · `@rte/overlay` · `@rte/shared` · `@rte/ast-engine`

---

## Purpose

Real-Time Editor is a **drop-in dev overlay** for React + Vite + Tailwind apps. Add the Vite plugin and mount `<RteDevShell />` once — in dev, a floating editor appears over your app. In production builds, it renders nothing.

1. **Turn Edit on** — click elements in the running app.
2. **Make Editable** — untagged elements get a `data-rte-id` written into your **source files** (not browser storage). That survives dev-server restarts, refactors, and future sessions — it is normal code in git.
3. **Edit** — change Tailwind classes and text, **Validate Changes**, then **Apply to Code**.

You can also tag hosts by hand with `data-rte-id` in JSX. To stop editing an element, remove its `data-rte-id` from source (there is no in-overlay “Make not editable” yet).

**Brand Kit** — define project branding once (`rte/brand.json`), then bulk-apply styles by category (card, heading, text, button, table, form, badge) across pages.

Preview before apply. Undo after apply.

---

## Apply to another project

**Mental model:** one Vite plugin + one React shell → dev-only overlay → click to tag → edits live in source forever.

rte is **dev-only** — the Vite plugin and overlay run during `vite dev` and are stripped from production bundles.

**Stack:** Node 20+, React, Vite, Tailwind.

### Drop in the plugin

| Piece | Role |
| ----- | ---- |
| `@rte/vite-plugin` | Dev server: source index, patch writes, `data-rte-loc` on untagged JSX (so you can click-to-tag) |
| `@rte/overlay` + `<RteDevShell />` | Floating chip + editor UI over your app (`import.meta.env.DEV` only) |

**Fastest path** — from the app folder that has `package.json` and `vite.config.*`:

```bash
bunx @rte/cli init --yes   # wires both pieces + a starter editable element
bun run dev
```

Open localhost → rte chip → **Edit on**.

### Day-to-day workflow

| Step | What happens |
| ---- | ------------ |
| **Click untagged UI** | Overlay opens **Make Editable** → confirm → `data-rte-id` is inserted in the matching `.tsx` file |
| **Click tagged UI** | Property panel opens → tweak classes/text → **Validate Changes** → **Apply to Code** |
| **Restart dev / come back later** | Tagged elements stay editable — ids are in source, not session storage |
| **Stop editing an element** | Remove `data-rte-id` from that JSX host in source |

Verify wiring anytime: `bunx @rte/cli doctor` · `bunx @rte/cli scan`

**What `init` creates:** installs packages, patches `vite.config`, mounts `<RteDevShell />`, tags starter `page.title`, and adds `rte/` (`START_HERE.md`, `AGENT.md`, `brand.json`).

**Beyond click-to-tag**

- **Brand Kit** — bulk-apply category styles per page using `rte/brand.json` (needs literal `data-rte-id` + patchable `className` on native DOM).
- **Monorepos** — run `init` **per Vite app**; do **not** add `@rte/overlay` to Tailwind `content` (overlay CSS is self-contained).

After init, read `rte/START_HERE.md`. For dashboard id patterns (cards, tables, nav), see `rte/AGENT.md`.

**Tip:** When `bun create vite` asks “Install and start now?” → **No**, so you can run `init` before the first dev server.

### Manual wiring (skip CLI)

```bash
bun add -d @rte/vite-plugin @rte/overlay
```

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { rte } from "@rte/vite-plugin";

export default defineConfig({
  plugins: [react(), rte()],
  resolve: { dedupe: ["react", "react-dom"] },
});
```

```tsx
// e.g. App.tsx
import { RteDevShell } from "@rte/overlay";

export default function App() {
  return (
    <>
      {/* your app */}
      <RteDevShell />
    </>
  );
}
```

Then use **Make Editable** in the browser (or add `data-rte-id` by hand) and run `bunx @rte/cli doctor`.

**Reference app:** [apps/tailadmin-dogfood/README.md](apps/tailadmin-dogfood/README.md) · **Full guide:** [docs/rteUser.md](https://github.com/ehah/Rte/blob/main/docs/rteUser.md)

### Develop this monorepo

```bash
bun install
bun run build
```

Then run TailAdmin:

```bash
bun run dev:tailadmin          # Brand Kit + TailAdmin (port 5173)
```

---

## Build

| Context | Command |
| ------- | ------- |
| **This monorepo** | `bun run build` — builds all `packages/*` |
| **Your app** | No separate rte build; `rte init` wires the dev plugin and overlay. Run your normal `bun run dev` / `vite dev`. |
| **Production app build** | Unchanged — rte is not included in production bundles. |

---

## Tech stack

| Area | Support |
| ---- | ------- |
| **Runtime** | Node.js 20+ |
| **Package manager** | Bun (this monorepo) |
| **Bundler** | Vite 5.4+, 6.x, 8.x |
| **UI** | React 18.3+, 19.x |
| **Styling** | Tailwind CSS 3.x and 4.x |
| **`className` modes** | literals, `cn()`, conditional `cn`, static `classnames()` |
| **Libraries** | shadcn, TailAdmin, DaisyUI (detection + guides in CLI templates) |

**CLI commands:** `init` · `doctor` · `scan` · `stats` · `brand scan` · `brand apply` · `coverage verify`

---

## Limitations

**Works today**

- Local dev only (`bun run dev` / `vite dev`)
- Element editing and Brand Kit bulk apply for patchable hosts
- React + Vite + Tailwind stacks listed above

**Editing constraints**

- Each `data-rte-id` must be unique (`rte scan` lists duplicates)
- Brand Kit bulk apply requires literal `data-rte-id` + patchable `className` on native DOM
- Wrapper-only props without a patchable native `className` are not indexed

**On the roadmap**

- Next.js `rte init` (experimental `@rte/next` in this monorepo)
- Apply brand to all pages in one action
- In-overlay **Make not editable** (remove `data-rte-id` from source via UI)

**Not planned near-term**

- Vue, Angular, or non-React frameworks
- Production or hosted editing

rte is a **local dev tool**. The Vite plugin exposes write APIs on the dev server. See [SECURITY.md](SECURITY.md).

Full detail: [LIMITATIONS.md](https://github.com/ehah/Rte/blob/main/docs/LIMITATIONS.md) · [COMPATIBILITY.md](https://github.com/ehah/Rte/blob/main/docs/COMPATIBILITY.md)

---

## Scripts

Root `package.json` scripts for this monorepo:

| Script | Description |
| ------ | ----------- |
| `bun run build` | Build all `packages/*` |
| `bun run typecheck` | Typecheck packages and apps |
| `bun run test` | Run package tests |
| `bun run dev` | Build packages, then TailAdmin dogfood (port 5173) |
| `bun run dev:tailadmin` | Same as `bun run dev` |
| `bun run dogfood` | Build + typecheck + test + TailAdmin production build |
| `bun run test:cli` | CLI test suite |
| `bun run coverage:dogfood` | PCC verify all tailadmin pages |
| `bun run brand:dogfood` | Brand scan all tailadmin pages |
| `bun run brand:apply:dogfood` | CLI brand apply (dogfood) |
| `bun run publish:stable` | Publish five `@rte/*` packages to npm `latest` |
| `bun run publish:alpha` | Publish packages to npm `alpha` tag |

---

## More

| Resource | Purpose |
| -------- | ------- |
| [CHANGELOG.md](CHANGELOG.md) | Releases and notable changes |
| [SECURITY.md](SECURITY.md) | Threat model |

**Repository:** [github.com/ehah/Rte](https://github.com/ehah/Rte) · **License:** MIT
