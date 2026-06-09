# Nuvio — Simple setup guide

**For vibe-coders:** edit your app in the browser while it runs locally. Click text, tweak styles, save back to your code.

**On npm:** [`@nuvio/cli@1.0.0`](https://www.npmjs.com/package/@nuvio/cli) (installs matching `@nuvio/vite-plugin` + `@nuvio/overlay`).

---

## Quick Start

In your **Vite + React** project folder (`package.json` + `vite.config.ts`):

```bash
pnpm dlx @nuvio/cli@1.0.0 init --yes
pnpm dev
```

Open the localhost URL → Nuvio chip → **Edit on** → click the page title (`page.title`) or any untagged element → **Make Editable** → **Preview Changes** → **Apply to Code**.

- `--yes` skips the confirm prompt. Without it, the CLI asks **Proceed? [y/N]** first.
- Run init in your **app folder**, not the Nuvio monorepo root.
- Tailwind is recommended for class edits; init warns but still runs if Tailwind is missing.
- More help in your project after init: `nuvio/START_HERE.md`.

**What init does (you don’t do this by hand):** installs `@nuvio/vite-plugin` + `@nuvio/overlay` at **1.0.0**, wires `vite.config`, mounts `NuvioDevShell` in `App.tsx`, adds overlay CSS in `main.tsx`, sets `data-nuvio-id="page.title"` on the first heading, creates `nuvio/`. Safe to run again. Does **not** start `pnpm dev` for you.

---

## New project from zero

When `pnpm create vite` asks **“Install and start now?”** → **No** (otherwise dev runs before init and you see no Nuvio chip).

```bash
pnpm create vite my-app --template react-ts
cd my-app
pnpm install
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

Add to `src/index.css` if needed:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then Quick Start (`init --yes` + `pnpm dev`).

---

## After setup — how editing works

1. `pnpm dev` — Nuvio only runs in local dev, not production.
2. Chip → **Edit on** → click a tagged element or use **Make Editable** on untagged UI.
3. Change text or styles in the panel (tasks: Heading, Card, Table, Button, Form, Nav, etc.).
4. **Preview Changes** → **Apply to Code** — source files update. **Undo last** if needed.

**Simple Mode:** plain-language screens; **Advanced** and **Developer details** are optional.

### Click-to-tag (no manual id required)

Click any **untagged** native element → panel offers **Make Editable** → confirm → nuvio inserts `data-nuvio-id` in source. Restart dev server after upgrading nuvio so the loc transform is active.

### Mark more UI manually (optional)

```tsx
<h1 data-nuvio-id="home.title" className="text-4xl font-bold">Welcome</h1>
```

**Rules:** unique names (`home.title`, `nav.dashboard`). `className` may be a string literal or supported `cn()` patterns on that host.

**Dashboards (cards, tables, buttons):** ask your AI agent to read `nuvio/AGENT.md` — or use Make Editable in the browser.

**Component libraries:** [shadcn](libraries/shadcn.md) · [TailAdmin](libraries/tailadmin.md) · [DaisyUI](libraries/daisyui.md)

---

## Manual setup (no CLI)

```bash
pnpm add -D @nuvio/vite-plugin@1.0.0 @nuvio/overlay@1.0.0
```

**`vite.config.ts`** — add `nuvio()` and exclude overlay from prebundle:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nuvio } from "@nuvio/vite-plugin";

export default defineConfig({
  plugins: [react(), nuvio()],
  optimizeDeps: { exclude: ["@nuvio/overlay"] },
});
```

**`src/main.tsx`:**

```ts
import "@nuvio/overlay/style.css";
```

**`src/App.tsx`:**

```tsx
import { NuvioDevShell } from "@nuvio/overlay";
// …inside return: <NuvioDevShell />
```

Add `data-nuvio-id` on editable elements or use Make Editable, then `pnpm dev`.

---

## Project diagnostics

```bash
nuvio doctor          # pass/fail checklist (deps, vite, overlay, indexed ids)
nuvio scan            # list data-nuvio-id hosts with file:line
nuvio stats           # short summary; add --json for scripts
```

Use `--cwd <path>` to point at another project root. Disable anonymous telemetry: `NUVIO_TELEMETRY=0`.

---

## Something wrong?

| Problem | Fix |
| ------- | --- |
| **No Nuvio chip** | `create vite` started dev before init → **Ctrl+C**, `pnpm dlx @nuvio/cli@1.0.0 init --yes`, `pnpm dev`. |
| **Edit dead / no styles** | `nuvio doctor`, then `rm -rf node_modules/.vite`, `pnpm dev`. |
| **0 ids / nothing clickable** | Use **Make Editable**, or add `data-nuvio-id`, save, restart dev. |
| **Apply greyed out** | Edit on → click an id’d element; fix duplicate ids (`nuvio scan`). |
| **Panel clipped** | **Reset position** on chip/editor, hard-refresh, restart dev. |
| **Install failed** | `node -v` ≥ 20; run from folder with `package.json`. |

---

## Quick reference

| I want to… | Do this |
| ---------- | ------- |
| Wire a project | `pnpm dlx @nuvio/cli@1.0.0 init --yes` then `pnpm dev` |
| First edit | Edit on → click title or Make Editable → Preview → Apply |
| Check wiring | `nuvio doctor` |
| More editable UI | Make Editable in browser, or `nuvio/AGENT.md` for dashboards |
| Undo | **Undo last** on the chip |

---

## Telemetry

Nuvio collects anonymous usage metrics to improve onboarding and reliability. No source code, file contents, file paths, project names, emails, or personal data are sent.

Disable anytime with:

```bash
NUVIO_TELEMETRY=0
```

In the browser overlay: `localStorage.setItem("nuvio.telemetry", "0")` (then refresh). Details: [PostHog_telemetry.md](./PostHog_telemetry.md).

---

## Optional links

- **1.0 release notes:** [nuvio_v1.0.md](./nuvio_v1.0.md)
- **Upgrade from 0.5.x:** [MIGRATION_0.5_to_1.0.md](./MIGRATION_0.5_to_1.0.md)
- **Examples:** [examples/README.md](../examples/README.md)
- Telemetry spec: [PostHog_telemetry.md](./PostHog_telemetry.md)
- Limits: [LIMITATIONS.md](./LIMITATIONS.md)
- Versions: [COMPATIBILITY.md](./COMPATIBILITY.md)
- Maintainer dogfood: [DOGFOOD.md](./DOGFOOD.md)
