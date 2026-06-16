# nuvio

**v1.1.0** — visual editor for **React + Vite + Tailwind** (dev-only; nothing runs in production).

[![npm @nuvio/cli](https://img.shields.io/npm/v/@nuvio/cli?label=%40nuvio%2Fcli%201.1.0)](https://www.npmjs.com/package/@nuvio/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

**Published packages:** `@nuvio/cli` · `@nuvio/vite-plugin` · `@nuvio/overlay` · `@nuvio/shared` · `@nuvio/ast-engine`

---

## Purpose

nuvio lets you edit a React + Vite + Tailwind app visually in the browser and write changes back to real source files.

- **Brand Kit** — define project branding once (`nuvio/brand.json`), then bulk-apply styles by category (card, heading, text, button, table, form, badge) across pages.
- **Element editing** — click a tagged element, preview Tailwind and text changes, then apply to code.

Preview before apply. Undo after apply. The overlay and Vite plugin run only in dev (`import.meta.env.DEV`).

---

## Setup

### Use nuvio in your app

**Requirements:** Node 20+, React, Vite, Tailwind.

From your app folder (where `package.json` and `vite.config` live):

```bash
pnpm dlx @nuvio/cli init --yes
pnpm dev
```

Open localhost → click the nuvio chip → **Edit on**.

After init, see `nuvio/START_HERE.md` and `nuvio/AGENT.md` in your project.

**Tip:** When `pnpm create vite` asks “Install and start now?” → **No**, so you can run `init` before the first dev server.

### Develop this monorepo

```bash
corepack enable
pnpm install
pnpm build
```

Then run TailAdmin:

```bash
pnpm dev:tailadmin          # Brand Kit + TailAdmin (port 5173)
```

---

## Build

| Context | Command |
| ------- | ------- |
| **This monorepo** | `pnpm build` — builds all `packages/*` |
| **Your app** | No separate nuvio build; `nuvio init` wires the dev plugin and overlay. Run your normal `pnpm dev` / `vite dev`. |
| **Production app build** | Unchanged — nuvio is not included in production bundles. |

---

## Add to an existing project or monorepo

### Recommended: CLI init

Run from the **app package** that has Vite + React (not necessarily the monorepo root):

```bash
cd apps/your-app
pnpm dlx @nuvio/cli init --yes
```

`init` installs `@nuvio/vite-plugin` and `@nuvio/overlay`, registers the Vite plugin, mounts the dev shell, and adds starter instrumentation.

### Manual wiring

If you skip the CLI or need to wire by hand:

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  resolve: { dedupe: ["react", "react-dom"] },
});
```

```tsx
// e.g. App.tsx
import { NuvioDevShell } from "@nuvio/overlay";

export default function App() {
  return (
    <>
      {/* your app */}
      <NuvioDevShell />
    </>
  );
}
```

### Instrument hosts

Add stable `data-nuvio-id="your.region.id"` on JSX you want to edit or brand. For Brand Kit bulk apply, use a **literal** `className` on the same native element.

Optional: add `nuvio/pages/<page>.pcc.yaml` and run `nuvio coverage verify --page <page>`.

### Monorepo notes

- Run `nuvio init` (or manual wiring) **per app** that should have the editor.
- `nuvio doctor` recognizes workspace-linked monorepo apps.
- Overlay CSS is self-contained — do **not** add `@nuvio/overlay` to Tailwind `content`.

More: [apps/tailadmin-dogfood/README.md](apps/tailadmin-dogfood/README.md) · [docs/nuvioUser.md](docs/nuvioUser.md)

---

## Tech stack

| Area | Support |
| ---- | ------- |
| **Runtime** | Node.js 20+ |
| **Package manager** | pnpm 9 (this monorepo) |
| **Bundler** | Vite 5.4+, 6.x, 8.x |
| **UI** | React 18.3+, 19.x |
| **Styling** | Tailwind CSS 3.x and 4.x |
| **`className` modes** | literals, `cn()`, conditional `cn`, static `classnames()` |
| **Libraries** | shadcn, TailAdmin, DaisyUI (detection + guides in CLI templates) |

**CLI commands:** `init` · `doctor` · `scan` · `stats` · `brand scan` · `brand apply` · `coverage verify`

---

## Limitations

**Works today**

- Local dev only (`pnpm dev` / `vite dev`)
- Element editing and Brand Kit bulk apply for patchable hosts
- React + Vite + Tailwind stacks listed above

**Editing constraints**

- Each `data-nuvio-id` must be unique (`nuvio scan` lists duplicates)
- Brand Kit bulk apply requires literal `data-nuvio-id` + patchable `className` on native DOM
- Wrapper-only props without a patchable native `className` are not indexed

**On the roadmap**

- Next.js `nuvio init` (experimental `@nuvio/next` in this monorepo)
- Apply brand to all pages in one action

**Not planned near-term**

- Vue, Angular, or non-React frameworks
- Production or hosted editing

nuvio is a **local dev tool**. The Vite plugin exposes write APIs on the dev server. See [SECURITY.md](SECURITY.md).

Full detail: [docs/LIMITATIONS.md](docs/LIMITATIONS.md) · [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)

---

## Scripts

Root `package.json` scripts for this monorepo:

| Script | Description |
| ------ | ----------- |
| `pnpm build` | Build all `packages/*` |
| `pnpm typecheck` | Typecheck packages and apps |
| `pnpm test` | Run package tests |
| `pnpm dev` | Build packages, then TailAdmin dogfood (port 5173) |
| `pnpm dev:tailadmin` | Same as `pnpm dev` |
| `pnpm dogfood` | Build + typecheck + test + TailAdmin production build |
| `pnpm test:cli` | CLI test suite |
| `pnpm coverage:dogfood` | PCC verify all tailadmin pages |
| `pnpm brand:dogfood` | Brand scan all tailadmin pages |
| `pnpm brand:apply:dogfood` | CLI brand apply (dogfood) |
| `pnpm publish:stable` | Publish five `@nuvio/*` packages to npm `latest` |
| `pnpm publish:alpha` | Publish packages to npm `alpha` tag |

---

## More

| Resource | Purpose |
| -------- | ------- |
| [CHANGELOG.md](CHANGELOG.md) | Releases and notable changes |
| [SECURITY.md](SECURITY.md) | Threat model |

**Repository:** [github.com/ehah/Nuvio](https://github.com/ehah/Nuvio) · **License:** MIT
