# nuvio

**Edit React apps visually and apply changes back to source code.**

Stop burning AI prompts on:

- make this card wider
- move this button left
- change this padding
- change this color

nuvio lets you:

- Click UI elements in the browser
- Edit text and Tailwind styles visually
- Preview the diff before anything hits disk
- Apply changes directly to your source files

Dev-only. Nothing runs in production.

[![npm @nuvio/cli](https://img.shields.io/npm/v/@nuvio/cli?label=%40nuvio%2Fcli)](https://www.npmjs.com/package/@nuvio/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](package.json)

---

## Demo

**Edit on → click an element → Preview Changes → Apply to Code** (about 1 minute).

<img src="docs/assets/nuvio.gif" width="100%" alt="nuvio demo: Edit on → click an element → Preview Changes → Apply to Code" />

Try it yourself after [Quick Start](#quick-start), or run the maintainer demo app:

```bash
pnpm build && pnpm --filter @nuvio/demo-app dev
```

Open `http://localhost:5174` → nuvio chip → **Edit on**.

Asset path: [docs/assets/nuvio.gif](docs/assets/nuvio.gif) · More captures: [docs/screenshots/v0.5/README.md](docs/screenshots/v0.5/README.md)

---

## Quick Start

**You need:** React · Vite · Tailwind · Node 20+

In your project folder (`package.json` + `vite.config`):

```bash
pnpm dlx @nuvio/cli init
pnpm dev
```

Open localhost → turn **Edit** on in the nuvio chip → click an element → **Preview Changes** → **Apply to Code**.

That's it. After init, see `nuvio/START_HERE.md` in your project.

**Tip:** When `pnpm create vite` asks “Install and start now?” → **No**, so you can run `init` before the first dev server.

Full walkthrough: [docs/nuvioUser.md](docs/nuvioUser.md)

---

## What nuvio does

After `nuvio init`, nuvio:

1. Installs `@nuvio/vite-plugin` and `@nuvio/overlay`
2. Registers the Vite plugin (dev server only)
3. Mounts the nuvio overlay in your app shell
4. Adds a starter editable region (`page.title` on your first heading)
5. Lets you click instrumented elements and edit in the browser
6. Generates source-backed patches and writes them to your files

**Preview before apply.** **Undo** after apply. **No production bundle** — the overlay renders nothing when `import.meta.env.DEV` is false.

Want more of the UI editable? Add `data-nuvio-id="unique.name"` to JSX hosts. See `nuvio/AGENT.md` after init.

---

## Telemetry

nuvio collects **anonymous usage events** to improve onboarding and reliability. Telemetry is **on by default** and **opt-out**.

**Collected**

- CLI / overlay version
- OS and Node version (CLI)
- Event names (e.g. `nuvio_init_completed`, `apply_to_code`)
- Coarse install outcome (success / partial / failed)

**Not collected**

- Source code
- File contents
- File paths
- Project names
- Emails
- Usernames
- Personal information

**Disable anytime**

```bash
NUVIO_TELEMETRY=0
```

In the browser overlay: `localStorage.setItem("nuvio.telemetry", "0")` then refresh.

Details: [docs/PostHog_telemetry.md](docs/PostHog_telemetry.md)

---

## Current Limitations

**Works today**

- React 18 / 19
- Vite 5, 6, and 8
- Tailwind CSS 3.x and 4.x
- Local dev only (`pnpm dev` / `vite dev`)

**Editing constraints**

- `className` on edited elements should be a **string literal** (not `cn(...)` or dynamic expressions) for style patches
- Each `data-nuvio-id` must be **unique** in your project
- Full dashboard UIs need explicit ids — the CLI adds a starter title; use `nuvio/AGENT.md` for more

**On the roadmap**

- Next.js `nuvio init` (experimental `@nuvio/next` exists in the monorepo today)
- `nuvio doctor` for setup checks
- Click-to-tag in the overlay

**Not planned near-term**

- Vue, Angular, or non-React frameworks
- Production / hosted editing

Honest list: [docs/LIMITATIONS.md](docs/LIMITATIONS.md) · [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)

---

## Advanced Setup

Use this if you skip the CLI or need to wire nuvio by hand.

### Manual install

```bash
pnpm add -D @nuvio/vite-plugin @nuvio/overlay
```

### Register the Vite plugin

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
```

Optional plugin options:

```ts
nuvio({
  scanGlobs: ["src/**/*.{tsx,jsx}"],
  verbose: process.env.NUVIO_VERBOSE === "1",
});
```

### Mount the dev shell

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

`NuvioDevShell` returns `null` in production builds. The Vite plugin runs only on `vite dev`. See [docs/DEV_ONLY.md](docs/DEV_ONLY.md).

### Instrument hosts

Put stable **`data-nuvio-id="your.region.id"`** on JSX you want to edit. Ids must be unique. Use a string-literal `className="..."` on the same element for Tailwind patches.

### Troubleshooting

**`0 ids` in the chip** — no TSX/JSX matched under the scan root. Restart dev after changes; try `nuvio({ verbose: true })` and check the terminal for `[nuvio]` logs.

**No nuvio chip after `create vite`** — run `nuvio init` before `pnpm dev`, or restart dev after init.

**Edit button dead / no overlay styles** — re-run `pnpm dlx @nuvio/cli init --yes`, then `rm -rf node_modules/.vite` and `pnpm dev`.

**Apply greyed out** — turn Edit on, select an id’d element, run **Preview Changes** first; fix duplicate ids if reported.

More: [docs/nuvioUser.md](docs/nuvioUser.md) · [CHANGELOG.md](CHANGELOG.md)

### Requirements (monorepo contributors)

- **Node.js** >= 20
- **pnpm** 9 (`corepack enable` recommended)

### Compatibility notes

| Stack | Supported |
| ----- | --------- |
| Vite | 5.4+, 6.x, 8.x |
| React | 18.3+, 19.x |
| Tailwind | 3.x, 4.x |

Overlay CSS is self-contained — you do **not** add `@nuvio/overlay` to Tailwind `content`.

Full matrix: [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)

---

## Maintainer Documentation

For nuvio contributors and release work — not needed to use nuvio in your app.

| Doc | Purpose |
| --- | ------- |
| [docs/nuvioUser.md](docs/nuvioUser.md) | Public user guide |
| [docs/DOGFOOD.md](docs/DOGFOOD.md) | Dogfood / acceptance sign-off |
| [docs/FULL_MVP_DOD.md](docs/FULL_MVP_DOD.md) | Definition of done |
| [docs/npmPublish.md](docs/npmPublish.md) | Publish `@nuvio/*` to npm |
| [docs/PostHog_telemetry.md](docs/PostHog_telemetry.md) | Telemetry spec |
| [docs/PRD.md](docs/PRD.md) | Product requirements |
| [docs/implPlan.md](docs/implPlan.md) | Implementation plan |
| [docs/nuvio_v0.5.3.md](docs/nuvio_v0.5.3.md) | Current npm release notes |

### Monorepo setup

```bash
corepack enable
pnpm install
pnpm build
```

### Demo app (from repo root)

```bash
pnpm --filter @nuvio/demo-app dev
# or
pnpm dev   # builds packages, then starts demo-app
```

Open the printed localhost URL. Turn **Edit on** in the chip to try selection, Preview, Apply, and Undo.

**Quick test:** select a card under **Haider Ali** → **Move down** → **Undo last** if needed.

TailAdmin dogfood: `pnpm dev:tailadmin`

### Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm build` | Build all `packages/*` |
| `pnpm typecheck` | Typecheck packages and apps |
| `pnpm test` | Run package tests |
| `pnpm dogfood` | Build + typecheck + test + demo production build |
| `pnpm test:cli` | CLI test suite |
| `pnpm telemetry:smoke` | Live PostHog CLI smoke (maintainers) |
| `pnpm posthog:verify` | Send a verify event to PostHog |
| `pnpm publish:stable` | Publish five `@nuvio/*` packages to npm `latest` |

---

## Built With AI

nuvio was developed using modern AI-assisted engineering workflows.

Tools used during development include:

- Cursor Agent
- Claude
- ChatGPT

AI accelerated implementation, while product direction, architecture, and final decisions remained human-led.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

**Repository:** [github.com/ehah/Nuvio](https://github.com/ehah/Nuvio) · **License:** MIT
